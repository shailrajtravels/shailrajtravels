import { createServerFn } from '@tanstack/react-start';
import clientPromise from './db';

export interface AuditLogEntry {
  _id?: string;
  action: string;
  entityType: 'System' | 'Package' | 'Gallery' | 'Booking' | 'Review' | 'TripOption' | 'Room';
  entityId?: string;
  details: string;
  createdAt: Date;
}

// Internal helper for logging actions from other backend functions
export const logAuditAction = createServerFn({ method: 'POST' })
  .validator((data: { action: string, entityType: AuditLogEntry['entityType'], details: string, entityId?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const client = await clientPromise;
      const db = client.db('shailraj');
      
      const entry: Omit<AuditLogEntry, '_id'> = {
        action: data.action,
        entityType: data.entityType,
        details: data.details,
        createdAt: new Date(),
      };
      if (data.entityId) entry.entityId = data.entityId;

      await db.collection('audit_logs').insertOne(entry);
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  });

// API endpoint for the Admin panel to fetch logs
export const getAuditLogsFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string }) => data)
  .handler(async ({ data }) => {
    const pwd = process.env.ADMIN_PASSWORD;
    const email = process.env.ADMIN_EMAIL || 'khudeshivam@gmail.com';
    const validToken = pwd ? Buffer.from(email + ":" + pwd + "_ADMIN_SALT").toString('base64') : null;

    if (!validToken || data.adminToken !== validToken) throw new Error("Unauthorized");
    
    try {
      const client = await clientPromise;
      const db = client.db('shailraj');
      
      const logs = await db.collection('audit_logs')
        .find({})
        .sort({ createdAt: -1 })
        .limit(100) // Keep it fast, return last 100 actions
        .toArray();
      
      return logs.map(l => ({
        ...l,
        _id: l._id.toString()
      }));
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
      return [];
    }
  });
