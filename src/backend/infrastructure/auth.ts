import { createServerFn } from '@tanstack/react-start';
import { logAuditAction } from '@/backend/shared/audit';
import { getAdminToken } from '@/backend/infrastructure/token';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const adminAuthSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
  token: z.string().optional(),
});

export const verifyAdminFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => adminAuthSchema.parse(data))
  .handler(async ({ data }) => {
    const isDev = process.env.NODE_ENV === "development";

    const validToken = getAdminToken();
    if (!validToken) {
      console.error("[Auth] getAdminToken() returned null — ADMIN_PASSWORD is not set in .env");
      throw new Error("Admin credentials not configured on server.");
    }

    if (data.token) {
      if (data.token === validToken) return { success: true, token: validToken };
      return { success: false };
    }

    if (data.email && data.password) {
      const expectedEmail = process.env.ADMIN_EMAIL || "khudeshivam@gmail.com";
      const hash = process.env.ADMIN_PASSWORD_HASH;

      let isMatch = false;
      if (hash) {
        isMatch = bcrypt.compareSync(data.password, hash);
      } else if (process.env.ADMIN_PASSWORD) {
        isMatch = data.password === process.env.ADMIN_PASSWORD;
      }

      const emailMatch = data.email === expectedEmail;
      if (isDev) {
        console.log(`[Auth] Login attempt — emailMatch:${emailMatch} passwordMatch:${isMatch} hasPassword:${!!process.env.ADMIN_PASSWORD}`);
      }

      if (emailMatch && isMatch) {
        await logAuditAction({
          data: {
            action: "Admin Login",
            entityType: "System",
            details: `Successful login for ${data.email}`,
          },
        });
        return { success: true, token: validToken };
      }
      return { success: false, message: "Invalid email or password." };
    }

    return { success: false };
  });
