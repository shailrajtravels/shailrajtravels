import { Collection, Document, ObjectId } from "mongodb";
import { storageManager } from "../database/StorageManager";

export abstract class BaseRepository<T extends Document> {
  protected abstract entityType: string;
  protected abstract baseCollectionName: string;
  protected abstract isPartitioned: boolean;

  /**
   * Retrieves the correct MongoDB Collection to use for this operation.
   * If partitioned, it checks routing or storage capacity.
   */
  protected async getCollectionForWrite(id: string): Promise<Collection<T>> {
    if (!this.isPartitioned) {
      return storageManager.getGlobalCollection<T>(this.baseCollectionName);
    }
    return storageManager.getCollectionForWrite<T>(this.entityType, id, this.baseCollectionName);
  }

  protected async getCollectionForRead(id: string): Promise<Collection<T>> {
    if (!this.isPartitioned) {
      return storageManager.getGlobalCollection<T>(this.baseCollectionName);
    }
    return storageManager.getCollectionForRead<T>(this.entityType, id, this.baseCollectionName);
  }

  // --- Common CRUD Operations ---

  async findById(id: string): Promise<T | null> {
    const col = await this.getCollectionForRead(id);
    return col.findOne({ _id: new ObjectId(id) } as any) as unknown as Promise<T | null>;
  }

  async insertOne(doc: any, id?: string): Promise<string> {
    const docId = id || new ObjectId().toString();
    const col = await this.getCollectionForWrite(docId);
    
    // Ensure _id is an ObjectId
    const insertDoc = { ...doc };
    if (!insertDoc._id) insertDoc._id = new ObjectId(docId);
    
    await col.insertOne(insertDoc);
    return docId;
  }

  async updateOne(id: string, updateData: any): Promise<void> {
    const col = await this.getCollectionForRead(id); // Use Read route to find where it is currently stored
    await col.updateOne({ _id: new ObjectId(id) } as any, { $set: updateData });
  }

  async deleteOne(id: string): Promise<void> {
    const col = await this.getCollectionForRead(id);
    await col.deleteOne({ _id: new ObjectId(id) } as any);
  }
}
