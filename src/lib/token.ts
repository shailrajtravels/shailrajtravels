export function getAdminToken() {
  const pwd = process.env.ADMIN_PASSWORD;
  const email = process.env.ADMIN_EMAIL || 'khudeshivam@gmail.com';
  if (!pwd) return null;
  return Buffer.from(email + ":" + pwd + "_ADMIN_SALT").toString('base64');
}
