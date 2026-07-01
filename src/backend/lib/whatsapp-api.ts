import { createServerFn } from "@tanstack/react-start";
import { getAdminToken } from "./token";
import { getStatus, initWhatsApp, restartWhatsApp, logoutWhatsApp } from "./whatsapp";
import fs from "fs";
import path from "path";

export const getWhatsAppStatusFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    return getStatus();
  });

export const restartWhatsAppFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

    // Asynchronously restart so we don't block the request if it takes time
    restartWhatsApp().catch((err) => console.error("WhatsApp Restart Error:", err));

    return { success: true };
  });

export const logoutWhatsAppFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    // Asynchronously log out so we don't block the request if it takes time
    logoutWhatsApp().catch(err => console.error("WhatsApp Logout Error:", err));
    return { success: true };
  });

export const getChatbotRulesFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    try {
      const rulesPath = path.join(process.cwd(), "chatbot-rules.json");
      if (fs.existsSync(rulesPath)) {
        const rulesData = fs.readFileSync(rulesPath, "utf-8");
        return JSON.parse(rulesData);
      }
      return { rules: [] };
    } catch (e) {
      console.error("Error reading chatbot rules", e);
      return { rules: [] };
    }
  });

export const saveChatbotRulesFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; rules: any[] }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    try {
      const rulesPath = path.join(process.cwd(), "chatbot-rules.json");
      fs.writeFileSync(rulesPath, JSON.stringify({ rules: data.rules }, null, 2), "utf-8");
      
      // Attempt to restart WhatsApp so it picks up new rules, or hot-reload if possible
      // Actually whatsapp.ts reads the file on every incoming message! So no restart needed.
      return { success: true };
    } catch (e) {
      console.error("Error saving chatbot rules", e);
      return { success: false };
    }
  });
