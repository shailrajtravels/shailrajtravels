import { mongoAdapter } from '@/backend/shared/database/MongoAdapter';
import { storageManager } from '@/backend/shared/database/StorageManager';

export async function initializeDatabase() {
  console.log("[Init-DB] Starting MongoDB initialization...");
  
  // Ensure connection is up
  const clusterId = mongoAdapter.getPrimaryClusterId();
  const db = mongoAdapter.getDb(clusterId);
  
  if (!db) {
    console.error("[Init-DB] No database available to initialize.");
    return;
  }

  try {
    console.log("[Init-DB] Creating Indexes...");
    
    // Tours
    const toursCol = await storageManager.getGlobalCollection("tours");
    await toursCol.createIndex({ slug: 1, lang: 1 }, { unique: true });
    await toursCol.createIndex({ lang: 1, createdAt: -1 });

    // Blogs
    const blogsCol = await storageManager.getGlobalCollection("custom_blogs");
    await blogsCol.createIndex({ slug: 1 }, { unique: true });
    await blogsCol.createIndex({ createdAt: -1 });

    // Reviews
    const reviewsCol = await storageManager.getGlobalCollection("reviews");
    await reviewsCol.createIndex({ date: -1 });

    // Packages
    const packagesCol = await storageManager.getGlobalCollection("packages");
    await packagesCol.createIndex({ title: 1 }, { unique: true });

    // Trip Options
    const tripsCol = await storageManager.getGlobalCollection("trip_options");
    await tripsCol.createIndex({ name: 1 }, { unique: true });

    // Partitioned Collections: Bookings & Audit
    // Since we dynamically create these, we need to apply indexes to the *current* partition
    // In a fully robust system, this script would run on new year rollover as well.
    const bookingsCol = await storageManager.getCollectionForWrite("booking", "init", "bookings");
    await bookingsCol.createIndex({ createdAt: -1 });
    await bookingsCol.createIndex({ tripName: 1, createdAt: -1 });
    await bookingsCol.createIndex({ customerPhone: 1 });
    await bookingsCol.createIndex({ customerEmail: 1 });
    await bookingsCol.createIndex({ paymentStatus: 1 });
    await bookingsCol.createIndex({ bookingStatus: 1 });
    await bookingsCol.createIndex({ travelDate: 1 });

    // Audit Logs (with TTL)
    const auditCol = await storageManager.getCollectionForWrite("audit", "init", "audit_logs");
    await auditCol.createIndex({ timestamp: -1 });
    // TTL Index: Expire after 6 months (15552000 seconds)
    await auditCol.createIndex({ timestamp: 1 }, { expireAfterSeconds: 15552000 });

    console.log("[Init-DB] Indexes created successfully.");

    // ---- Schema Validations ----
    console.log("[Init-DB] Applying Schema Validations...");
    
    // Applying to current bookings partition
    await db.command({
      collMod: bookingsCol.collectionName,
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["tripName", "customerName", "customerPhone", "createdAt"],
          properties: {
            tripName: { bsonType: "string", description: "must be a string and is required" },
            customerName: { bsonType: "string", description: "must be a string and is required" },
            customerPhone: { bsonType: "string", description: "must be a string and is required" },
            createdAt: { bsonType: ["date", "string"], description: "must be a date or string and is required" }
          }
        }
      },
      validationLevel: "moderate" // moderate allows existing invalid docs, blocks new invalid docs
    }).catch((e: any) => {
      // If collection doesn't exist yet, command fails.
      console.warn(`[Init-DB] Validation warning for ${bookingsCol.collectionName}: ${e.message}`);
    });

    console.log("[Init-DB] MongoDB Initialization Complete!");
  } catch (error) {
    console.error("[Init-DB] Failed to initialize database:", error);
  }
}
