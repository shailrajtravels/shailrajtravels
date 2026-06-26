import { createServerFn } from "@tanstack/react-start";
import { getAdminToken } from "./token";
import { getStatus, initWhatsApp, restartWhatsApp, logoutWhatsApp } from "./whatsapp";

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
