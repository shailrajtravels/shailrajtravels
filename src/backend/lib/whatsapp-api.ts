import { createServerFn } from '@tanstack/react-start';
import { getAdminToken } from './token';
import { getStatus, initWhatsApp } from './whatsapp';

export const getWhatsAppStatusFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    return getStatus();
  });

export const restartWhatsAppFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    // Asynchronously init so we don't block the request if it takes time
    initWhatsApp().catch(err => console.error("WhatsApp Init Error:", err));
    
    return { success: true };
  });
