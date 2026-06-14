import { createServerFn } from '@tanstack/react-start';
import { logAuditAction } from './audit';
import { getAdminToken } from './token';

export const verifyAdminFn = createServerFn({ method: 'POST' })
  .validator((data: { email?: string, password?: string, token?: string }) => data)
  .handler(async ({ data }) => {
    const validToken = getAdminToken();
    if (!validToken) throw new Error("Admin credentials not configured on server.");

    if (data.token) {
      if (data.token === validToken) return { success: true, token: validToken };
      return { success: false };
    }

    if (data.email && data.password) {
      const expectedEmail = process.env.ADMIN_EMAIL || 'khudeshivam@gmail.com';
      if (data.email === expectedEmail && data.password === process.env.ADMIN_PASSWORD) {
        await logAuditAction({ data: { action: "Admin Login", entityType: "System", details: `Successful login for ${data.email}` } });
        return { success: true, token: validToken };
      }
      return { success: false, message: "Invalid email or password" };
    }
    
    return { success: false };
  });
