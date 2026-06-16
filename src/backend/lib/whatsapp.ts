import clientPromise from './db';
import { ObjectId } from 'mongodb';

export type WhatsAppStatus = 'Disconnected' | 'Awaiting QR' | 'Connected' | 'Error';

let client: any = null;
let currentQR: string | null = null;
let currentStatus: WhatsAppStatus = 'Disconnected';
let initializationPromise: Promise<void> | null = null;

const ADMIN_PHONE = '919359570497'; // Admin number

// Initialize the WhatsApp Client
export async function initWhatsApp() {
  if (client || initializationPromise) return initializationPromise;

  currentStatus = 'Disconnected';
  initializationPromise = new Promise((resolve, reject) => {
    try {
      console.log('[WhatsApp] Initializing client...');
      import('whatsapp-web.js').then(({ default: pkg, Client, LocalAuth }) => {
        const C = Client || pkg?.Client;
        const LA = LocalAuth || pkg?.LocalAuth;
        client = new C({
        authStrategy: new LA(),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        }
      });

        client.on('qr', (qr: string) => {
        console.log('[WhatsApp] QR RECEIVED');
        currentQR = qr;
        currentStatus = 'Awaiting QR';
      });

      client.on('ready', () => {
        console.log('[WhatsApp] Client is ready!');
        currentQR = null;
        currentStatus = 'Connected';
        resolve();
      });

      client.on('authenticated', () => {
        console.log('[WhatsApp] Authenticated!');
      });

      client.on('auth_failure', (msg: any) => {
        console.error('[WhatsApp] Authentication failure', msg);
        currentStatus = 'Error';
        reject(new Error(msg));
      });

        client.on('disconnected', (reason: string) => {
        console.log('[WhatsApp] Client was logged out', reason);
        currentStatus = 'Disconnected';
        client = null;
        initializationPromise = null;
      });

        client.on('message', async (msg: any) => {
        const adminId = `${ADMIN_PHONE}@c.us`;
        // Only respond to admin
        if (msg.from !== adminId && msg.author !== adminId) return;

        const text = msg.body.toLowerCase().trim();
        
        try {
          if (text === 'get excel') {
            msg.reply('Generating Excel file of all bookings...');
            const excelBuffer = await generateBookingsExcel();
            const { default: pkg, MessageMedia } = await import('whatsapp-web.js');
            const MM = MessageMedia || pkg?.MessageMedia;
            const media = new MM('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', excelBuffer.toString('base64'), 'bookings.xlsx');
            client!.sendMessage(msg.from, media);
          } else if (text.startsWith('get ') && text.endsWith(' invoice')) {
            // e.g., "get 16-06-26 invoice" -> "16-06-26"
            const dateStr = text.replace('get ', '').replace(' invoice', '').trim();
            msg.reply(`Generating PDF and Excel invoice for ${dateStr}...`);
            
            const bookings = await fetchBookingsForDate(dateStr);
            if (bookings.length === 0) {
              msg.reply(`No bookings found for date: ${dateStr}`);
              return;
            }

            const pdfBuffer = await generateInvoicePDF(bookings, dateStr);
            const { default: pkg, MessageMedia } = await import('whatsapp-web.js');
            const MM = MessageMedia || pkg?.MessageMedia;
            const pdfMedia = new MM('application/pdf', pdfBuffer.toString('base64'), `invoice_${dateStr}.pdf`);
            await client!.sendMessage(msg.from, pdfMedia);

            const excelBuffer = await generateBookingsExcel(bookings);
            const excelMedia = new MM('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', excelBuffer.toString('base64'), `invoice_${dateStr}.xlsx`);
            await client!.sendMessage(msg.from, excelMedia);
          }
        } catch (error: any) {
          console.error('[WhatsApp] Error handling message:', error);
          msg.reply(`An error occurred: ${error.message}`);
        }
      });

        client.initialize().catch((err: any) => {
          console.error('[WhatsApp] Initialization failed', err);
          currentStatus = 'Error';
          reject(err);
        });
      }).catch((err: any) => {
        console.error('[WhatsApp] import error', err);
        currentStatus = 'Error';
        reject(err);
      });
    } catch (error) {
      console.error('[WhatsApp] Setup error', error);
      currentStatus = 'Error';
      reject(error);
    }
  });

  return initializationPromise;
}

export function getStatus() {
  return { status: currentStatus, qr: currentQR };
}

export async function sendAdminNotification(message: string) {
  if (currentStatus !== 'Connected' || !client) {
    console.warn('[WhatsApp] Cannot send message, client not connected');
    return false;
  }
  try {
    const adminId = `${ADMIN_PHONE}@c.us`;
    await client.sendMessage(adminId, message);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Failed to send notification:', error);
    return false;
  }
}

// -------------------------
// Helpers
// -------------------------

async function fetchBookingsForDate(dateStr: string) {
  const dbClient = await clientPromise;
  const db = dbClient.db('shailraj');
  
  // Date format could be various things. Let's try to match it against createdAt or travelDate.
  // The user might type "16-06-26" meaning YYYY-MM-DD or DD-MM-YY.
  // We'll just do a broad search in stringified dates or precise if we know the schema.
  // For simplicity, we'll fetch all and filter in JS if complex, or try a regex.
  const allBookings = await db.collection('bookings').find({}).toArray();
  
  return allBookings.filter((b: any) => {
    // Check if the date string is in the travelDate or createdAt
    const cd = new Date(b.createdAt).toISOString().split('T')[0];
    const td = b.travelDate ? String(b.travelDate) : '';
    
    return cd.includes(dateStr) || td.includes(dateStr) || 
           new Date(b.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-').includes(dateStr);
  });
}

export async function generateBookingsExcel(bookingsData?: any[]): Promise<Buffer> {
  let data = bookingsData;
  if (!data) {
    const dbClient = await clientPromise;
    const db = dbClient.db('shailraj');
    data = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
  }

  const xlsx = await import('xlsx');

  const worksheet = xlsx.utils.json_to_sheet(data!.map((b: any) => ({
    ID: b._id.toString(),
    Name: b.name || 'N/A',
    Phone: b.phone || 'N/A',
    Email: b.email || 'N/A',
    Date: b.date || 'N/A',
    Adults: b.numAdults || 0,
    Children: b.numChildren || 0,
    Status: b.status || 'Pending',
    Payment: b.paymentStatus || 'Pending',
    Total: b.totalPrice || 0,
    Created: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'
  })));

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Bookings');
  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function generateInvoicePDF(bookings: any[], dateStr: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      import('pdfkit').then(({ default: PDFDocument }) => {
        const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(20).text('Shailraj Travels Invoice Summary', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Date: ${dateStr}`, { align: 'center' });
      doc.moveDown(2);

      let totalPersons = 0;

      bookings.forEach((b, i) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`Booking #${i + 1} - ${b.name}`);
        doc.font('Helvetica').fontSize(10);
        doc.text(`Phone: ${b.phone || 'N/A'}`);
        doc.text(`Trip: ${b.tripName || b.customDestination || 'N/A'}`);
        doc.text(`Travel Date: ${b.travelDate || 'N/A'}`);
        doc.text(`Persons: ${b.persons || 1}`);
        doc.text(`Status: ${b.status || 'Pending'}`);
        doc.moveDown();

        totalPersons += Number(b.persons || 1);
      });

      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold').text(`Total Bookings: ${bookings.length}`);
      doc.text(`Total Persons: ${totalPersons}`);

        doc.end();
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}
