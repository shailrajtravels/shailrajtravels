import { MongoClient, Db } from 'mongodb';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ----------------------------------------------------
// Offline Fallback Support (From original db.ts)
// ----------------------------------------------------
function generateHexId(): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function matches(doc: any, filter: any): boolean {
  if (!filter) return true;
  for (const key of Object.keys(filter)) {
    const filterVal = filter[key];
    const docVal = doc[key];
    if (key === "_id") {
      if (filterVal?.toString() !== docVal?.toString()) return false;
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
  constructor(private collection: LocalCollection, private filter: any) {}
  sort(sortObj: any) {
    const key = Object.keys(sortObj)[0];
    const direction = sortObj[key];
    this._sortFn = (a: any, b: any) => {
      if (a[key] < b[key]) return direction === -1 ? 1 : -1;
      if (a[key] > b[key]) return direction === -1 ? -1 : 1;
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
    if (this._sortFn) matched.sort(this._sortFn);
    if (this._limit !== null) matched = matched.slice(0, this._limit);
    return matched;
  }
}

class LocalCollection {
  constructor(public dbName: string, public name: string) {}
  async _readData(): Promise<any> {
    if (typeof window !== "undefined") return {};
    try {
      const dbFilePath = path.join(process.cwd(), "local_db.json");
      const data = await fs.promises.readFile(dbFilePath, "utf8");
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  async _writeData(data: any): Promise<void> {
    if (typeof window !== "undefined") return;
    try {
      const dbFilePath = path.join(process.cwd(), "local_db.json");
      await fs.promises.writeFile(dbFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to write local DB file:", e);
    }
  }
  find(filter: any) { return new LocalCursor(this, filter); }
  async findOne(filter: any) {
    const dbData = await this._readData();
    const list = dbData[this.name] || [];
    return list.find((d: any) => matches(d, filter)) || null;
  }
  async insertOne(doc: any) {
    const dbData = await this._readData();
    if (!dbData[this.name]) dbData[this.name] = [];
    const id = doc._id ? doc._id.toString() : generateHexId();
    const newDoc = { ...doc, _id: id };
    dbData[this.name].push(newDoc);
    await this._writeData(dbData);
    return { acknowledged: true, insertedId: { toString: () => id, equals: (o: any) => o?.toString() === id } };
  }
  async updateOne(filter: any, update: any) {
    const dbData = await this._readData();
    const list = dbData[this.name] || [];
    const index = list.findIndex((d: any) => matches(d, filter));
    if (index !== -1) {
      let doc = list[index];
      if (update.$set) doc = { ...doc, ...update.$set, _id: doc._id?.toString() };
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
  async deleteMany(filter: any) {
    const dbData = await this._readData();
    const list = dbData[this.name] || [];
    const initialLen = list.length;
    const kept = list.filter((d: any) => !matches(d, filter));
    dbData[this.name] = kept;
    await this._writeData(dbData);
    return { deletedCount: initialLen - kept.length };
  }
}

class LocalDb {
  constructor(public databaseName: string) {}
  collection<T = any>(name: string): any { return new LocalCollection(this.databaseName, name); }
  command(cmd: any) { return { ok: 1, dataSize: 1024 * 1024 }; } // Fake 1MB stats
}


// ----------------------------------------------------
// Core MongoAdapter
// ----------------------------------------------------

export class MongoAdapter {
  private clients: Map<string, MongoClient> = new Map();
  private dbs: Map<string, Db | LocalDb> = new Map();
  private primaryClusterId: string = "cluster1";
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async init(configs: Record<string, string | undefined>) {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      for (const [clusterId, uri] of Object.entries(configs)) {
        if (uri && uri.startsWith("mongodb")) {
          try {
            const client = new MongoClient(uri, {
              serverSelectionTimeoutMS: 5000,
            });
            await client.connect();
            await client.db("admin").command({ ping: 1 });
            this.clients.set(clusterId, client);
            this.dbs.set(clusterId, client.db("shailraj"));
            console.log(`[MongoAdapter] Successfully connected to ${clusterId}`);
          } catch (error: any) {
            console.warn(`[MongoAdapter] Failed to connect to ${clusterId}:`, error.message);
          }
        }
      }

      // Fallback to offline local JSON DB if no clusters connected successfully
      if (this.clients.size === 0) {
        console.warn("[MongoAdapter] No MongoDB clusters connected. Falling back to local_db.json");
        this.dbs.set("cluster1", new LocalDb("shailraj"));
      }

      this.initialized = true;
    })();

    return this.initPromise;
  }

  async getDbAsync(clusterId: string): Promise<any> {
    if (this.initPromise) await this.initPromise;
    return this.getDb(clusterId);
  }

  getDb(clusterId: string): any {
    const db = this.dbs.get(clusterId);
    if (!db) {
      // Fallback to primary if the requested cluster is offline
      console.warn(`[MongoAdapter] Cluster ${clusterId} not found, falling back to primary`);
      const primaryDb = this.dbs.get(this.primaryClusterId);
      if (primaryDb) return primaryDb;
      
      console.warn(`[MongoAdapter] Primary cluster also not found. Using local_db.json fallback.`);
      return new LocalDb("shailraj");
    }
    return db;
  }

  getPrimaryClusterId(): string {
    return this.primaryClusterId;
  }

  getAvailableClusters(): string[] {
    return Array.from(this.dbs.keys());
  }

  async getStorageStats(clusterId: string) {
    const db = this.getDb(clusterId);
    if (!db) return null;
    try {
      return await db.command({ dbStats: 1 });
    } catch (e) {
      return null;
    }
  }
}

export const mongoAdapter = new MongoAdapter();

// Initialize the adapter automatically when this module is loaded
// We use process.env to grab the cluster URIs
let fallbackMongoUri = process.env.MONGO_URI;

if (!fallbackMongoUri) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/^MONGO_URI=["']?([^"'\n]+)["']?$/m);
    if (match) {
      fallbackMongoUri = match[1];
    }
  } catch (e) {
    // Ignore error if .env is missing
  }
}

const clusterConfigs = {
  cluster1: fallbackMongoUri,
  // Add other clusters here if needed
};

console.log("[MongoAdapter] Using MONGO_URI:", fallbackMongoUri ? "Yes (Masked)" : "No");

mongoAdapter.init(clusterConfigs).catch(err => {
  console.error("[MongoAdapter] Initialization failed:", err);
});
