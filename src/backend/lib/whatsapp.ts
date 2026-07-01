import "dotenv/config";
import clientPromise from "./db";
import { ObjectId } from "mongodb";

// OpenWA standalone server configuration
const OPENWA_API_URL = process.env.OPENWA_API_URL || "http://localhost:2785";
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || ""; 
const SESSION_NAME = "shailraj-bot";
const ADMIN_PHONE = "919359570497"; // Admin number

export type WhatsAppStatus = "Disconnected" | "Awaiting QR" | "Connected" | "Error";

let currentStatus: WhatsAppStatus = "Disconnected";
let activeSessionId: string | null = null;

/** Helper for OpenWA REST API requests */
async function openwaRequest(endpoint: string, method: string = "GET", body?: any) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (OPENWA_API_KEY) {
    headers["X-API-Key"] = OPENWA_API_KEY;
  }
  
  const options: RequestInit = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${OPENWA_API_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenWA API Error (${response.status}): ${errorText}`);
  }
  
  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

/** Initialize session by ensuring it exists in the gateway */
export async function initWhatsApp(sessionName = SESSION_NAME) {
  try {
    console.log(`[WhatsApp] Checking OpenWA session: ${sessionName}`);
    
    // 1. Fetch all sessions to find the UUID
    const sessions = await openwaRequest('/api/sessions');
    let session = sessions.find((s: any) => s.name === sessionName);
    
    // 2. If it doesn't exist, create it
    if (!session) {
      session = await openwaRequest('/api/sessions', 'POST', { name: sessionName });
    }
    
    activeSessionId = session.id;
    
    if (!activeSessionId) throw new Error("Failed to obtain OpenWA session UUID");

    // 3. Start session
    try {
      await openwaRequest(`/api/sessions/${activeSessionId}/start`, 'POST');
    } catch (e: any) {
      if (!e.message.includes('409') && !e.message.includes('already running')) {
        console.warn("[WhatsApp] Start session returned:", e.message);
      }
    }
    
    // 4. Register Webhook for auto-responder chatbot
    try {
      console.log("[WhatsApp] Checking existing webhooks...");
      const webhooks = await openwaRequest(`/api/sessions/${activeSessionId}/webhooks`);
      const targetUrl = 'http://127.0.0.1:3001/';
      const exists = Array.isArray(webhooks) && webhooks.some((wh: any) => wh.url === targetUrl);
      
      if (!exists) {
        console.log("[WhatsApp] Registering webhook for incoming messages...");
        await openwaRequest(`/api/sessions/${activeSessionId}/webhooks`, 'POST', {
          url: targetUrl,
          events: ['message.received']
        });
        console.log("[WhatsApp] Webhook registered successfully!");
      } else {
        console.log("[WhatsApp] Webhook already registered.");
      }
    } catch (e: any) {
      // If it already exists or fails, just log it, don't crash
      console.warn("[WhatsApp] Webhook registration notice:", e.message);
    }
    
    currentStatus = "Connected";
    console.log(`[WhatsApp] Client is initialized via REST Gateway! (UUID: ${activeSessionId})`);
  } catch (error) {
    console.error("[WhatsApp] Setup error", error);
    currentStatus = "Error";
    throw error;
  }
}

export async function destroyWhatsApp() {
  currentStatus = "Disconnected";
  activeSessionId = null;
}

export async function clearAuthCache() {
  try {
    if (activeSessionId) {
      await openwaRequest(`/api/sessions/${activeSessionId}`, 'DELETE');
      console.log("[WhatsApp] Session deleted from OpenWA Gateway.");
      activeSessionId = null;
    }
  } catch (error) {
    console.error("[WhatsApp] Failed to clear session:", error);
  }
}

export async function restartWhatsApp(sessionName = SESSION_NAME) {
  console.log("[WhatsApp] Restarting WhatsApp client via Gateway...");
  try {
    if (activeSessionId) {
      await openwaRequest(`/api/sessions/${activeSessionId}/stop`, 'POST');
      await new Promise(r => setTimeout(r, 2000));
    }
    await initWhatsApp(sessionName);
  } catch (error) {
    console.error("[WhatsApp] Restart error:", error);
  }
}

export async function logoutWhatsApp() {
  console.log("[WhatsApp] Explicit logout requested...");
  await clearAuthCache();
  currentStatus = "Disconnected";
}

export function getStatus() {
  return { status: currentStatus, qr: null }; // Use the OpenWA Dashboard on port 2886 for QR
}

export async function sendAdminNotification(message: string) {
  if (!activeSessionId) return false;
  try {
    const adminId = `${ADMIN_PHONE}@c.us`;

    // Simulate typing indicator for anti-ban
    try {
      await openwaRequest(`/api/sessions/${activeSessionId}/chats/typing`, 'POST', { chatId: adminId });
    } catch (e) {}
    await new Promise(r => setTimeout(r, 2000));

    await openwaRequest(`/api/sessions/${activeSessionId}/messages/send-text`, 'POST', {
      chatId: adminId,
      text: message
    });
    return true;
  } catch (error) {
    console.error("[WhatsApp] Failed to send notification:", error);
    return false;
  }
}

/** Helper to resolve correct WhatsApp JID (c.us or lid) for a phone number */
async function resolveChatId(phone: string): Promise<string> {
  if (!activeSessionId) throw new Error("No active session");
  
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (cleaned.length === 10) cleaned = "91" + cleaned;
  
  try {
    const result = await openwaRequest(`/api/sessions/${activeSessionId}/contacts/check/${cleaned}`);
    if (result && result.exists && result.whatsappId) {
      console.log(`[WhatsApp] Resolved phone ${phone} to JID: ${result.whatsappId}`);
      return result.whatsappId;
    }
  } catch (err: any) {
    console.warn(`[WhatsApp] Failed to resolve JID for ${phone}:`, err.message);
  }
  
  return `${cleaned}@c.us`;
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  if (!activeSessionId) return false;
  try {
    const targetId = await resolveChatId(phone);

    // Simulate typing indicator for anti-ban
    try {
      await openwaRequest(`/api/sessions/${activeSessionId}/chats/typing`, 'POST', { chatId: targetId });
    } catch (e) {}
    await new Promise(r => setTimeout(r, 2000));

    await openwaRequest(`/api/sessions/${activeSessionId}/messages/send-text`, 'POST', {
      chatId: targetId,
      text: message
    });
    console.log(`[WhatsApp] Sent message to ${targetId}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Failed to send message:", error);
    return false;
  }
}

export async function sendWhatsAppImage(phone: string, base64Image: string, filename: string, caption?: string) {
  if (!activeSessionId) return false;
  try {
    const targetId = await resolveChatId(phone);
    
    let rawBase64 = base64Image;
    let mimeType = 'image/jpeg';
    if (base64Image.includes('base64,')) {
      const parts = base64Image.split('base64,');
      rawBase64 = parts[1];
      const match = parts[0].match(/data:(.*?);/);
      if (match) mimeType = match[1];
    }

    // Simulate typing indicator for anti-ban
    try {
      await openwaRequest(`/api/sessions/${activeSessionId}/chats/typing`, 'POST', { chatId: targetId });
    } catch (e) {}
    await new Promise(r => setTimeout(r, 2000));

    await openwaRequest(`/api/sessions/${activeSessionId}/messages/send-image`, 'POST', {
      chatId: targetId,
      base64: rawBase64,
      filename,
      caption: caption || "",
      mimetype: mimeType
    });
    
    console.log(`[WhatsApp] Sent image to ${targetId}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Failed to send image:", error);
    return false;
  }
}

// -------------------------
// Helpers & PDF Generation
// -------------------------

export async function generateSingleInvoicePDF(booking: any): Promise<Buffer> {
  const pkg: any = await import("pdfkit");
  const PDFDocument = pkg.default || pkg;
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text("Shailraj Travels Invoice Summary", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Name: ${booking.name || "N/A"}`);
      doc.text(`Phone: ${booking.phone || "N/A"}`);
      doc.text(`Trip: ${booking.tripName || "N/A"}`);
      doc.text(`Amount: Rs. ${booking.totalPrice || 0}`);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function sendBookingInvoicePDF(
  booking: any,
  adminToken?: string,
  generatedInvoiceNo?: string,
): Promise<boolean> {
  if (!activeSessionId) return false;
  try {
    let pdfBuffer: Buffer;
    const bookingIdStr = booking._id?.toString() || "";
    const invoiceNo = generatedInvoiceNo || booking.invoiceCustomData?.invoiceNo || booking.generatedInvoiceNo || `INV-${bookingIdStr.slice(-6).toUpperCase()}`;

    if (adminToken && bookingIdStr) {
      try {
        const { generateInvoicePDFViaPuppeteer } = await import("./invoice-pdf");
        pdfBuffer = await generateInvoicePDFViaPuppeteer(bookingIdStr, adminToken, invoiceNo);
      } catch (puppeteerErr) {
        console.warn("[WhatsApp] Puppeteer route capture failed, falling back to PDFKit");
        pdfBuffer = await generateSingleInvoicePDF(booking);
      }
    } else {
      pdfBuffer = await generateSingleInvoicePDF(booking);
    }

    const filename = `Invoice_${invoiceNo}.pdf`;
    const targetId = await resolveChatId(booking.phone || "");

    const pkgName = booking.invoiceCustomData?.packageName || booking.packageName || booking.tripName || "Custom Trip";
    const msg = `🙏 *Shailraj Travels Pune* 🙏\n\nHello *${booking.name || "Customer"}*,\n\nWe have received your payment for *${pkgName}*.\nPlease find the official invoice above. Thank you for choosing us! Have a blessed trip! 🚩`;

    // Simulate typing indicator for anti-ban
    try {
      await openwaRequest(`/api/sessions/${activeSessionId}/chats/typing`, 'POST', { chatId: targetId });
    } catch (e) {}
    await new Promise(r => setTimeout(r, 2000));

    await openwaRequest(`/api/sessions/${activeSessionId}/messages/send-document`, 'POST', {
      chatId: targetId,
      base64: pdfBuffer.toString("base64"),
      filename,
      caption: msg,
      mimetype: 'application/pdf'
    });
    
    console.log(`[WhatsApp] Invoice PDF + message sent to ${targetId}`);
    return true;
  } catch (err) {
    console.error("[WhatsApp] Failed to send booking invoice PDF:", err);
    return false;
  }
}

