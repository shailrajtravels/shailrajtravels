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
  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      // Release any locks held by stale Chrome processes before starting
      await killStaleChrome();

      console.log('[WhatsApp] Initializing client...');
      import('whatsapp-web.js').then(async ({ default: pkg, Client, LocalAuth }) => {
        const C = Client || pkg?.Client;
        const LA = LocalAuth || pkg?.LocalAuth;

        const os = await import('os');
        const path = await import('path');
        const fs = await import('fs');

        const cachePath = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome', 'win64-149.0.7827.22', 'chrome-win64', 'chrome.exe');
        let executablePath: string | undefined = undefined;

        if (fs.existsSync(cachePath)) {
          executablePath = cachePath;
          console.log('[WhatsApp] Using cached Chrome:', executablePath);
        } else {
          const winChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
          const winChromePathX86 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
          if (fs.existsSync(winChromePath)) {
            executablePath = winChromePath;
            console.log('[WhatsApp] Using Windows system Chrome:', executablePath);
          } else if (fs.existsSync(winChromePathX86)) {
            executablePath = winChromePathX86;
            console.log('[WhatsApp] Using Windows x86 system Chrome:', executablePath);
          }
        }

        client = new C({
          authStrategy: new LA(),
          puppeteer: {
            headless: true,
            executablePath,
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

      client.on('auth_failure', async (msg: any) => {
        console.error('[WhatsApp] Authentication failure', msg);
        currentStatus = 'Error';
        await destroyWhatsApp();
        await clearAuthCache();
        reject(new Error(msg));
      });

      client.on('disconnected', async (reason: string) => {
        console.log('[WhatsApp] Client disconnected', reason);
        currentStatus = 'Disconnected';
        await destroyWhatsApp();
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

      client.initialize().catch(async (err: any) => {
        console.error('[WhatsApp] Initialization failed', err);
        currentStatus = 'Error';
        await destroyWhatsApp();
        await clearAuthCache();
        reject(err);
      });
      }).catch(async (err: any) => {
        console.error('[WhatsApp] import error', err);
        currentStatus = 'Error';
        await destroyWhatsApp();
        await clearAuthCache();
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

export async function destroyWhatsApp() {
  if (client) {
    try {
      console.log('[WhatsApp] Destroying existing client...');
      await client.destroy();
    } catch (e) {
      console.error('[WhatsApp] Error destroying client:', e);
    }
    client = null;
  }
  initializationPromise = null;
  currentQR = null;
}

export async function killStaleChrome() {
  try {
    const { execSync } = await import('child_process');
    const os = await import('os');
    if (os.platform() !== 'win32') return;

    console.log('[WhatsApp] Checking for stale Chrome processes to release locks...');
    const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = 'chrome.exe'\\" | ForEach-Object { if ($_.CommandLine -like '*\\.wwebjs_auth*') { Stop-Process -Id $_.ProcessId -Force; Write-Host $_.ProcessId } }"`;
    const output = execSync(cmd, { encoding: 'utf8' });
    if (output.trim()) {
      console.log('[WhatsApp] Killed stale Chrome instances PIDs:', output.trim().replace(/\r?\n/g, ', '));
      // Give the OS 1 second to release the locks completely
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log('[WhatsApp] No stale Chrome processes found.');
    }
  } catch (err: any) {
    console.warn('[WhatsApp] Warning: failed to kill stale Chrome processes:', err.message);
  }
}

export async function clearAuthCache() {
  // Terminate any locking Chrome processes first
  await killStaleChrome();

  try {
    const path = await import('path');
    const fs = await import('fs');
    const authDir = path.join(process.cwd(), '.wwebjs_auth');
    const cacheDir = path.join(process.cwd(), '.wwebjs_cache');
    
    if (fs.existsSync(authDir)) {
      console.log('[WhatsApp] Removing .wwebjs_auth directory...');
      fs.rmSync(authDir, { recursive: true, force: true });
    }
    if (fs.existsSync(cacheDir)) {
      console.log('[WhatsApp] Removing .wwebjs_cache directory...');
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error('[WhatsApp] Failed to clear session directories:', err);
  }
}

export async function restartWhatsApp() {
  console.log('[WhatsApp] Restarting WhatsApp client (reusing session)...');
  await destroyWhatsApp();
  currentStatus = 'Disconnected';
  return initWhatsApp();
}

export async function logoutWhatsApp() {
  console.log('[WhatsApp] Explicit logout requested, clearing session cache...');
  await destroyWhatsApp();
  await clearAuthCache();
  currentStatus = 'Disconnected';
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

export async function sendWhatsAppMessage(phone: string, message: string) {
  if (currentStatus !== 'Connected' || !client) {
    console.warn('[WhatsApp] Cannot send message, client not connected');
    return false;
  }
  try {
    // Sanitize the phone number
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    let targetId = `${cleaned}@c.us`;
    try {
      const numberId = await client.getNumberId(cleaned);
      if (numberId && numberId._serialized) {
        targetId = numberId._serialized;
      }
    } catch (e) {
      console.warn('[WhatsApp] getNumberId failed, falling back to raw JID:', e);
    }
    
    await client.sendMessage(targetId, message);
    console.log(`[WhatsApp] Sent notification to ${targetId}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Failed to send message:', error);
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

function extractInvoiceData(b: any) {
  const custom = b.invoiceCustomData || {};
  const safeDate = (dateStr: any) => {
    if (!dateStr) return new Date();
    let d = new Date(dateStr);
    if (isNaN(d.getTime()) && typeof dateStr === 'string') {
      const cleaned = dateStr.replace(/\s*\(.*\)\s*/g, '');
      d = new Date(cleaned);
    }
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const invoiceYear = safeDate(b.createdAt).getFullYear();
  const invoiceSuffix = b._id ? b._id.toString().slice(-6).toUpperCase() : '0001';
  const defaultInvoiceNo = `INV-${invoiceYear}-${invoiceSuffix}`;
  
  const createdDate = safeDate(b.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const bId = b.generatedBookingId || b.bookingId || (b._id ? b._id.toString().slice(-8).toUpperCase() : '');
  
  let formattedTravelDate = '';
  let formattedTravelDateTime = '';
  try {
    const tDate = safeDate(b.travelDate);
    const pad = (n: number) => String(n).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    formattedTravelDate = `${pad(tDate.getDate())} ${months[tDate.getMonth()]} ${tDate.getFullYear()}`;
    formattedTravelDateTime = `${pad(tDate.getDate())} ${months[tDate.getMonth()]} ${tDate.getFullYear()}, ${pad(tDate.getHours())}:${pad(tDate.getMinutes())}`;
  } catch (err) {
    formattedTravelDate = String(b.travelDate || '');
    formattedTravelDateTime = String(b.travelDate || '');
  }

  return {
    invoiceNo: custom.invoiceNo || b.generatedInvoiceNo || defaultInvoiceNo,
    invoiceDate: custom.invoiceDate || createdDate,
    bookingId: custom.bookingId || bId,
    travelDate: custom.travelDate || formattedTravelDate,
    customerName: custom.customerName || b.customerName || b.name || '',
    customerPhone: custom.customerPhone || b.customerPhone || b.phone || '',
    packageName: custom.packageName || b.packageName || b.tripName || 'Custom Trip',
    travelDateTime: custom.travelDateTime || formattedTravelDateTime,
    pickupPoint: custom.pickupPoint || b.pickupPoint || 'Pune',
    rate: custom.rate !== undefined ? Number(custom.rate) : (b.tripName === 'custom' ? 0 : (b.defaultRate || 6000)),
    persons: custom.persons !== undefined ? Number(custom.persons) : (b.persons || 1),
    paymentStatus: custom.paymentStatus || b.paymentStatus || 'PENDING'
  };
}

export async function generateSingleInvoicePDF(booking: any): Promise<Buffer> {
  const { default: PDFDocument } = await import('pdfkit');
  const path = await import('path');
  const fs = await import('fs');

  const data = extractInvoiceData(booking);
  const totalAmount = data.rate * data.persons;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Primary Color
      const primaryColor = '#082F70';
      const borderBlue = '#1E4D9E';
      const textDark = '#222222';
      const textGrey = '#555555';
      const successGreen = '#1E8E3E';

      // Register custom fonts to support Rupee symbol (₹) and give a premium feel
      const fontsDir = path.join(process.cwd(), 'src', 'backend', 'assets', 'fonts');
      const regularFontPath = path.join(fontsDir, 'Roboto-Regular.ttf');
      const boldFontPath = path.join(fontsDir, 'Roboto-Bold.ttf');

      const hasCustomFonts = fs.existsSync(regularFontPath) && fs.existsSync(boldFontPath);
      if (hasCustomFonts) {
        doc.registerFont('Roboto', regularFontPath);
        doc.registerFont('Roboto-Bold', boldFontPath);
      }

      const fontRegular = hasCustomFonts ? 'Roboto' : 'Helvetica';
      const fontBold = hasCustomFonts ? 'Roboto-Bold' : 'Helvetica-Bold';

      // 1. Draw Page Border
      doc.lineWidth(1)
         .rect(20, 20, 555.28, 801.89)
         .strokeColor(borderBlue)
         .stroke();

      // 2. Add Logos
      const assetsDir = path.join(process.cwd(), 'src', 'frontend', 'assets');
      const logoPath = path.join(assetsDir, 'Shailraj travels-Punelogo.png');
      const onlyNameLogoPath = path.join(assetsDir, 'only-name-logo.png');
      const stampPath = path.join(assetsDir, 'stamp1.png');

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 35, 30, { width: 90 });
      }

      if (fs.existsSync(onlyNameLogoPath)) {
        doc.image(onlyNameLogoPath, 107.6, 15, { width: 380 });
      } else {
        // Fallback text
        doc.fillColor(primaryColor)
           .fontSize(22)
           .font(fontBold)
           .text('SHAILRAJ TRAVELS', 35, 45, { align: 'center', width: 525 });
      }

      // Centered Business Contact Info under the center logo (shifted down to prevent overlap with larger logo)
      doc.fillColor(textGrey)
         .fontSize(9)
         .font(fontRegular)
         .text('Pune, Maharashtra, India   |   Mob: +91 97634 33556', 35, 140, { align: 'center', width: 525 })
         .text('shailrajtravels9999@gmail.com   |   www.shailrajtravels.com', 35, 153, { align: 'center', width: 525 });

      // Separator Line
      doc.moveTo(35, 175)
         .lineTo(560, 175)
         .lineWidth(1)
         .strokeColor(borderBlue)
         .stroke();

      // 3. Centered Invoice Badge
      doc.fillColor(primaryColor)
         .rect(210, 190, 175, 25)
         .fill();

      doc.fillColor('#FFFFFF')
         .fontSize(14)
         .font(fontBold)
         .text('INVOICE', 210, 197, { align: 'center', width: 175 });

      // 4. Invoice Info Box
      doc.fillColor(textDark)
         .rect(35, 230, 525, 50)
         .lineWidth(1)
         .strokeColor(borderBlue)
         .stroke();

      // Draw middle vertical line divider in Info Box
      doc.moveTo(297.5, 230)
         .lineTo(297.5, 280)
         .lineWidth(1)
         .strokeColor(borderBlue)
         .stroke();

      // Left Column Info
      doc.fillColor(textGrey)
         .fontSize(10)
         .font(fontBold)
         .text('Invoice No.', 45, 240)
         .font(fontRegular)
         .text(`:  ${data.invoiceNo}`, 120, 240)
         
         .font(fontBold)
         .text('Invoice Date', 45, 260)
         .font(fontRegular)
         .text(`:  ${data.invoiceDate}`, 120, 260);

      // Right Column Info
      doc.font(fontBold)
         .text('Booking ID', 310, 240)
         .font(fontRegular)
         .text(`:  ${data.bookingId}`, 385, 240)
         
         .font(fontBold)
         .text('Travel Date', 310, 260)
         .font(fontRegular)
         .text(`:  ${data.travelDate}`, 385, 260);

      // 5. Bill To & Trip Details (Side by Side Cards)
      // Card 1: Bill To
      doc.fillColor(primaryColor)
         .rect(35, 295, 250, 20)
         .fill();
      doc.fillColor('#FFFFFF')
         .fontSize(10)
         .font(fontBold)
         .text('BILL TO', 45, 300);
      
      doc.fillColor(textDark)
         .rect(35, 315, 250, 75)
         .strokeColor(borderBlue)
         .stroke();

      doc.fillColor(textGrey)
         .fontSize(9)
         .font(fontBold)
         .text('Name', 45, 327)
         .font(fontRegular)
         .text(`:  ${data.customerName}`, 110, 327)
         
         .font(fontBold)
         .text('Mobile', 45, 347)
         .font(fontRegular)
         .text(`:  ${data.customerPhone}`, 110, 347);

      // Card 2: Trip Details
      doc.fillColor(primaryColor)
         .rect(310, 295, 250, 20)
         .fill();
      doc.fillColor('#FFFFFF')
         .fontSize(10)
         .font(fontBold)
         .text('TRIP DETAILS', 320, 300);
      
      doc.fillColor(textDark)
         .rect(310, 315, 250, 75)
         .strokeColor(borderBlue)
         .stroke();

      doc.fillColor(textGrey)
         .fontSize(9)
         .font(fontBold)
         .text('Package Name', 320, 327)
         .font(fontRegular)
         .text(`:  ${data.packageName}`, 410, 327)
         
         .font(fontBold)
         .text('Travel Date', 320, 347)
         .font(fontRegular)
         .text(`:  ${data.travelDateTime}`, 410, 347)
         
         .font(fontBold)
         .text('Pickup Point', 320, 367)
         .font(fontRegular)
         .text(`:  ${data.pickupPoint}`, 410, 367);

      // 6. Table
      doc.fillColor(primaryColor)
         .rect(35, 410, 525, 25)
         .fill();

      doc.fillColor('#FFFFFF')
         .fontSize(10)
         .font(fontBold)
         .text('Description', 45, 418)
         .text('Qty', 300, 418, { width: 50, align: 'center' })
         .text('Rate (\u20B9)', 370, 418, { width: 80, align: 'center' })
         .text('Amount (\u20B9)', 465, 418, { width: 85, align: 'center' });

      // Table Row Box
      doc.fillColor(textDark)
         .rect(35, 435, 525, 40)
         .strokeColor(borderBlue)
         .stroke();

      doc.fillColor(textDark)
         .fontSize(10)
         .font(fontRegular)
         .text('Package Price (Per Person)', 45, 450)
         .text(String(data.persons), 300, 450, { width: 50, align: 'center' })
         .text(data.rate.toLocaleString('en-IN'), 370, 450, { width: 80, align: 'center' })
         .text(totalAmount.toLocaleString('en-IN'), 465, 450, { width: 85, align: 'center' });

      // Table Footer Row
      doc.fillColor('#F9FAFB')
         .rect(35, 475, 525, 35)
         .fill();
      doc.fillColor(textDark)
         .rect(35, 475, 525, 35)
         .strokeColor(borderBlue)
         .stroke();

      doc.fillColor(textDark)
         .fontSize(11)
         .font(fontBold)
         .text('TOTAL', 370, 487, { width: 80, align: 'center' })
         .fontSize(14)
         .fillColor(primaryColor)
         .text(hasCustomFonts ? `\u20B9 ${totalAmount.toLocaleString('en-IN')}` : `Rs. ${totalAmount.toLocaleString('en-IN')}`, 450, 485, { width: 100, align: 'center' });

      // 7. Payment Details & Stamp
      // Left Box: Payment Details
      doc.fillColor(primaryColor)
         .rect(35, 530, 250, 20)
         .fill();
      doc.fillColor('#FFFFFF')
         .fontSize(10)
         .font(fontBold)
         .text('PAYMENT DETAILS', 45, 535);
      
      doc.fillColor(textDark)
         .rect(35, 550, 250, 85)
         .strokeColor(borderBlue)
         .stroke();

      doc.fillColor(textGrey)
         .fontSize(9)
         .font(fontBold)
         .text('Payment Mode', 45, 562)
         .font(fontRegular)
         .text(':  Cash / Online', 120, 562)
         
         .font(fontBold)
         .text('Paid Amount', 45, 582)
         .font(fontRegular)
         .text(hasCustomFonts ? `:  \u20B9 ${totalAmount.toLocaleString('en-IN')}` : `:  Rs. ${totalAmount.toLocaleString('en-IN')}`, 120, 582)
         
         .font(fontBold)
         .text('Payment Status', 45, 602)
         .font(fontBold)
         .fillColor(successGreen)
         .text(`:  ${data.paymentStatus.toUpperCase()}`, 120, 602);

      // Right Box: Authorized Signature
      doc.fillColor(primaryColor)
         .rect(310, 530, 250, 20)
         .fill();
      doc.fillColor('#FFFFFF')
         .fontSize(10)
         .font(fontBold)
         .text('AUTHORIZED SIGNATURE', 320, 535);
      
      doc.fillColor(textDark)
         .rect(310, 550, 250, 85)
         .strokeColor(borderBlue)
         .stroke();

      // Embed Stamp Image centered in the signature box
      if (fs.existsSync(stampPath)) {
        doc.image(stampPath, 397.5, 555, { width: 75 });
      }

      // Horizontal black line representing signature line
      doc.moveTo(341.25, 615)
         .lineTo(528.75, 615)
         .lineWidth(0.5)
         .strokeColor('#555555')
         .stroke();

      doc.fillColor(textGrey)
         .fontSize(8)
         .font(fontRegular)
         .text('Authorized Signatory', 310, 621, { align: 'center', width: 250 });

      // Thank You Message
      doc.fillColor(primaryColor)
         .fontSize(18)
         .font('Helvetica-Oblique') // Keep Helvetica-Oblique for italic styling
         .text('Thank You!', 35, 665, { align: 'center', width: 525 });

      // Powered By Info
      doc.fillColor(primaryColor)
         .fontSize(11)
         .font(fontBold)
         .text('Wings_of_mayur_9999', 35, 695, { align: 'center', width: 525 });

      doc.fillColor(textGrey)
         .fontSize(7)
         .font(fontRegular)
         .text('POWERED BY', 35, 710, { align: 'center', width: 525 });

      doc.fillColor(textDark)
         .fontSize(10)
         .font(fontBold)
         .text('Shailraj Travels,Pune', 35, 720, { align: 'center', width: 525 });

      // Bottom Footer Bar
      doc.rect(20, 782, 555.28, 25)
         .fillColor(primaryColor)
         .fill();

      doc.fillColor('#FFFFFF')
         .fontSize(8)
         .font(fontRegular)
         .text('Mob: +91 97634 33556  |  Email: shailrajtravels9999@gmail.com  |  Web: www.shailrajtravels.com', 20, 791, { align: 'center', width: 555.28 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function sendBookingInvoicePDF(booking: any): Promise<boolean> {
  if (currentStatus !== 'Connected' || !client) {
    console.warn('[WhatsApp] Cannot send invoice, client not connected');
    return false;
  }
  try {
    const pdfBuffer = await generateSingleInvoicePDF(booking);
    
    // Create WhatsApp media
    const { default: pkg, MessageMedia } = await import('whatsapp-web.js');
    const MM = MessageMedia || pkg?.MessageMedia;
    
    const invoiceNo = booking.invoiceCustomData?.invoiceNo || booking.generatedInvoiceNo || `INV-${new Date(booking.createdAt || Date.now()).getFullYear()}-${booking._id ? booking._id.toString().slice(-6).toUpperCase() : '0001'}`;
    const media = new MM('application/pdf', pdfBuffer.toString('base64'), `Invoice_${invoiceNo}.pdf`);
    
    // Sanitize phone number
    let cleaned = booking.phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    let targetId = `${cleaned}@c.us`;
    try {
      const numberId = await client.getNumberId(cleaned);
      if (numberId && numberId._serialized) {
        targetId = numberId._serialized;
      }
    } catch (e) {
      console.warn('[WhatsApp] getNumberId failed, falling back to raw JID:', e);
    }
    
    await client.sendMessage(targetId, media);
    
    // Send standard WhatsApp details text along with it
    const msg = `🙏 *Shailraj Travels Pune* 🙏\n\nHello *${booking.name || 'Customer'}*,\n\nWe have received your payment for the trip *${booking.packageName || booking.tripName || 'Custom Trip'}* (Date: ${booking.travelDate || 'N/A'}).\n\nPlease find attached the official invoice for your booking.\n\nThank you for choosing us for your spiritual journey! Have a blessed trip! 🚩`;
    await client.sendMessage(targetId, msg);
    
    console.log(`[WhatsApp] Sent invoice PDF and confirmation message to ${targetId}`);
    return true;
  } catch (err) {
    console.error('[WhatsApp] Failed to send booking invoice PDF:', err);
    return false;
  }
}

