import fs from 'node:fs';
import path from 'node:path';

// Ensure .env is always loaded when this module is imported
if (typeof window === "undefined") {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      envContent.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEq = trimmed.indexOf("=");
          if (firstEq !== -1) {
            const key = trimmed.substring(0, firstEq).trim();
            let val = trimmed.substring(firstEq + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            process.env[key] = val;
          }
        }
      });
    }
  } catch (_) {}
}

export function getAdminToken() {
  const pwd = process.env.ADMIN_PASSWORD;
  const email = process.env.ADMIN_EMAIL || "khudeshivam@gmail.com";
  if (!pwd) {
    console.error("[Auth] ADMIN_PASSWORD not found in environment. cwd:", process.cwd());
    return null;
  }
  return Buffer.from(email + ":" + pwd + "_ADMIN_SALT").toString("base64");
}
