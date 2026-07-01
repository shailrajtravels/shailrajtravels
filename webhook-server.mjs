import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env manually (no dependency needed)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const OPENWA_API_URL = process.env.OPENWA_API_URL || "http://localhost:2785";
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || "";
const SESSION_NAME = "shailraj-bot";
const PORT = 3001;

let activeSessionId = null;
const processedMessageIds = new Set();

/** Resolve the session UUID once at startup */
async function resolveSessionId() {
  try {
    const res = await fetch(`${OPENWA_API_URL}/api/sessions`, {
      headers: OPENWA_API_KEY ? { "X-API-Key": OPENWA_API_KEY } : {},
    });
    const sessions = await res.json();
    const session = sessions.find((s) => s.name === SESSION_NAME);
    if (session) {
      activeSessionId = session.id;
      console.log(`[Webhook] Resolved session UUID: ${activeSessionId}`);
    } else {
      console.warn("[Webhook] Session not found. Will retry on next request.");
    }
  } catch (err) {
    console.warn("[Webhook] Could not resolve session yet:", err.message);
  }
}

/** Send a text message via OpenWA REST API */
async function sendReply(chatId, text) {
  if (!activeSessionId) await resolveSessionId();
  if (!activeSessionId) {
    console.error("[Webhook] No active session — cannot send reply");
    return;
  }

  console.log(`[Webhook] Sending reply to chatId: ${chatId}`);
  const res = await fetch(
    `${OPENWA_API_URL}/api/sessions/${activeSessionId}/messages/send-text`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(OPENWA_API_KEY ? { "X-API-Key": OPENWA_API_KEY } : {}),
      },
      body: JSON.stringify({ chatId, text }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Webhook] Send failed (${res.status}): ${errText}`);
  } else {
    console.log(`[Webhook] ✅ Replied to ${chatId}`);
  }
}

/** Process an incoming message and auto-reply if matched */
function handleMessage(msg) {
  // 1. Skip messages sent BY the bot (outgoing messages)
  if (msg.fromMe || (msg.id && msg.id.fromMe)) {
    return;
  }

  const senderId = msg.from; // e.g. 919876543210@c.us or @lid

  // 2. Only respond to standard individual chats (ends with @c.us or @lid)
  const isIndividual = senderId && (senderId.endsWith("@c.us") || senderId.endsWith("@lid"));
  if (!isIndividual) {
    console.log(`[Webhook] ℹ️ Skipping non-individual chat or newsletter: ${senderId}`);
    return;
  }

  // 3. Prevent duplicate processing of the same message ID (webhook retries)
  const msgId = msg.id && (typeof msg.id === "object" ? (msg.id._serialized || msg.id.id) : msg.id);
  if (msgId) {
    if (processedMessageIds.has(msgId)) {
      console.log(`[Webhook] ℹ️ Skipping duplicate message ID: ${msgId}`);
      return;
    }
    processedMessageIds.add(msgId);
    if (processedMessageIds.size > 1000) {
      const firstVal = processedMessageIds.values().next().value;
      processedMessageIds.delete(firstVal);
    }
  }

  const text = (msg.body || "").toLowerCase().trim();
  if (!text) return;

  console.log(`[Webhook] 📩 From ${senderId}: "${text}"`);

  let reply = "";

  try {
    const rulesPath = path.join(__dirname, "chatbot-rules.json");
    if (fs.existsSync(rulesPath)) {
      const rulesData = JSON.parse(fs.readFileSync(rulesPath, "utf-8"));
      if (Array.isArray(rulesData.rules)) {
        for (const rule of rulesData.rules) {
          // Exact match on the keyword (trimmed, case-insensitive)
          const match = rule.keywords.some(keyword => text === keyword.trim().toLowerCase());
          if (match) {
            reply = rule.reply;
            break;
          }
        }
      }
    }
  } catch (err) {
    console.error("[Webhook] Error reading chatbot-rules.json:", err.message);
  }

  // Fallback exact matches in case JSON read fails or doesn't match
  if (!reply) {
    if (text === "ujjain" || text === "mahakal") {
      reply = "🙏 *Ujjain Package Details* 🙏\n\nExperience the spiritual bliss of Ujjain Mahakaleshwar!\n\n*Duration:* 2 Nights / 3 Days\n*Price:* Starting from ₹4,999 per person.\n\nReply with 'BOOK UJJAIN' to confirm your trip!";
    } else if (text === "kedarnath" || text === "chardham") {
      reply = "🚩 *Kedarnath Yatra Details* 🚩\n\nJoin our premium Kedarnath Yatra!\n\n*Duration:* 4 Nights / 5 Days\n*Price:* Starting from ₹9,500 per person.\n\nReply with 'BOOK KEDARNATH' for availability!";
    } else if (["inquiry", "hello", "hii"].includes(text)) {
      reply = "Welcome to *Shailraj Travels Pune*! 🌍\n\nHow can we help you today?\n\nAvailable Commands:\n- Type *Ujjain* for Ujjain package details.\n- Type *Kedarnath* for Kedarnath Yatra details.\n- Or just type your question and our agent will reply shortly!";
    }
  }

  if (reply) {
    sendReply(senderId, reply).catch((err) =>
      console.error("[Webhook] Reply error:", err)
    );
  }
}

/** HTTP server */
const server = http.createServer((req, res) => {
  // Health check for GET / HEAD
  if (req.method === "GET" || req.method === "HEAD") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
    return;
  }

  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const eventType =
          req.headers["x-openwa-event"] || payload.event || "";

        console.log(`[Webhook] ========== INCOMING EVENT ==========`);
        console.log(`[Webhook] Event type: ${eventType}`);
        console.log(`[Webhook] Full payload keys: ${Object.keys(payload).join(', ')}`);
        console.log(`[Webhook] Full payload: ${JSON.stringify(payload).substring(0, 500)}`);

        if (eventType === "message.received" && payload.data) {
          handleMessage(payload.data);
        } else if (payload.data) {
          // Try handling even without exact event match
          console.log(`[Webhook] Data found but event mismatch. Trying anyway...`);
          handleMessage(payload.data);
        } else if (payload.body || payload.from) {
          // Maybe the payload IS the message directly
          console.log(`[Webhook] Payload appears to be message directly`);
          handleMessage(payload);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error("[Webhook] Parse error:", err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Bad request" }));
      }
    });
    return;
  }

  res.writeHead(405);
  res.end("Method Not Allowed");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🤖 WhatsApp Webhook Server running on http://127.0.0.1:${PORT}\n`);
  // Resolve session ID at startup
  resolveSessionId();
});
