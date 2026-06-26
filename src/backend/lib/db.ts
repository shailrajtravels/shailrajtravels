import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";

// Load .env variables into process.env in Node.js environment
if (typeof window === "undefined") {
  try {
    const envPath = path.join(process.cwd(), ".env");
    console.log("[DB Env Debug] process.cwd():", process.cwd());
    console.log("[DB Env Debug] Expected .env path:", envPath);
    console.log("[DB Env Debug] .env file exists?:", fs.existsSync(envPath));

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      let loadedKeysCount = 0;
      envContent.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEq = trimmed.indexOf("=");
          if (firstEq !== -1) {
            const key = trimmed.substring(0, firstEq).trim();
            let val = trimmed.substring(firstEq + 1).trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            } else if (val.startsWith("'") && val.endsWith("'")) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
              loadedKeysCount++;
            }
          }
        }
      });
      console.log(
        `[DB Env Debug] Successfully loaded ${loadedKeysCount} environment variables from .env`,
      );
    } else {
      console.warn("[DB Env Debug] .env file was NOT found at", envPath);
    }
  } catch (e: any) {
    console.error("[DB Env Debug] Failed to load .env file manually:", e.message);
  }
}

const uri =
  process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shailraj";
console.log("[DB Env Debug] Final MongoDB URI resolved:", uri.replace(/:[^:@]+@/, ":***@"));
// Helper to generate a 24-character hex ID (similar to MongoDB ObjectId)
function generateHexId(): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Simple query matcher supporting exact match and $ne operator
function matches(doc: any, filter: any): boolean {
  if (!filter) return true;
  for (const key of Object.keys(filter)) {
    const filterVal = filter[key];
    const docVal = doc[key];

    if (key === "_id") {
      const filterIdStr = filterVal?.toString();
      const docIdStr = docVal?.toString();
      if (filterIdStr !== docIdStr) return false;
      continue;
    }

    if (filterVal && typeof filterVal === "object" && !Array.isArray(filterVal)) {
      if ("$ne" in filterVal) {
        if (docVal === filterVal.$ne) return false;
        continue;
      }
    }

    if (docVal !== filterVal) return false;
  }
  return true;
}

class LocalCursor {
  private _sortFn: any = null;
  private _limit: number | null = null;

  constructor(
    private collection: LocalCollection,
    private filter: any,
  ) {}

  sort(sortObj: any) {
    const key = Object.keys(sortObj)[0];
    const direction = sortObj[key];
    this._sortFn = (a: any, b: any) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return direction === -1 ? 1 : -1;
      if (aVal > bVal) return direction === -1 ? -1 : 1;
      return 0;
    };
    return this;
  }

  limit(n: number) {
    this._limit = n;
    return this;
  }

  async toArray() {
    const dbData = await this.collection._readData();
    const list = dbData[this.collection.name] || [];
    let matched = list.filter((doc: any) => matches(doc, this.filter));
    if (this._sortFn) {
      matched.sort(this._sortFn);
    }
    if (this._limit !== null) {
      matched = matched.slice(0, this._limit);
    }
    return matched;
  }
}

class LocalCollection {
  constructor(
    public dbName: string,
    public name: string,
  ) {}

  async _readData(): Promise<any> {
    if (typeof window !== "undefined") return {};
    try {
      const fs = await import("fs");
      const path = await import("path");
      const dbFilePath = path.join(process.cwd(), "local_db.json");
      const data = await fs.promises.readFile(dbFilePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  async _writeData(data: any): Promise<void> {
    if (typeof window !== "undefined") return;
    try {
      const fs = await import("fs");
      const path = await import("path");
      const dbFilePath = path.join(process.cwd(), "local_db.json");
      await fs.promises.writeFile(dbFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
      console.error("Failed to write to local DB file:", error);
    }
  }

  find(filter: any) {
    return new LocalCursor(this, filter);
  }

  async findOne(filter: any) {
    const dbData = await this._readData();
    const list = dbData[this.name] || [];
    const doc = list.find((d: any) => matches(d, filter));
    return doc || null;
  }

  async insertOne(doc: any) {
    const dbData = await this._readData();
    if (!dbData[this.name]) {
      dbData[this.name] = [];
    }

    const id = doc._id ? doc._id.toString() : generateHexId();
    const newDoc = { ...doc, _id: id };
    dbData[this.name].push(newDoc);

    await this._writeData(dbData);

    return {
      acknowledged: true,
      insertedId: {
        toString: () => id,
        equals: (other: any) => other?.toString() === id,
      },
    };
  }

  async updateOne(filter: any, update: any) {
    const dbData = await this._readData();
    const list = dbData[this.name] || [];
    const index = list.findIndex((d: any) => matches(d, filter));

    if (index !== -1) {
      let doc = list[index];
      if (update.$set) {
        doc = { ...doc, ...update.$set };
        if (doc._id) {
          doc._id = doc._id.toString();
        }
      }
      list[index] = doc;
      dbData[this.name] = list;
      await this._writeData(dbData);
      return { matchedCount: 1, modifiedCount: 1 };
    }
    return { matchedCount: 0, modifiedCount: 0 };
  }

  async deleteOne(filter: any) {
    const dbData = await this._readData();
    const list = dbData[this.name] || [];
    const index = list.findIndex((d: any) => matches(d, filter));

    if (index !== -1) {
      list.splice(index, 1);
      dbData[this.name] = list;
      await this._writeData(dbData);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

class LocalDb {
  constructor(public databaseName: string) {}

  collection(name: string) {
    return new LocalCollection(this.databaseName, name);
  }
}

class LocalMongoClient {
  db(name: string) {
    return new LocalDb(name);
  }
}

let clientPromise: Promise<any>;

async function initClient() {
  const connectionUri =
    process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shailraj";

  try {
    const client = new MongoClient(connectionUri, {
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_TIMEOUT || "10000", 10),
    });
    await client.connect();
    // Ping the server to verify it is actually online
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB server");
    return client;
  } catch (err: any) {
    console.warn(
      "MongoDB connection failed, falling back to local JSON database. Error:",
      err.message,
    );
    return new LocalMongoClient();
  }
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<any>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = initClient();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = initClient();
}

export default clientPromise;
