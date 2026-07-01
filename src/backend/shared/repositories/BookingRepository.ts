import { BaseRepository } from '@/backend/shared/repositories/BaseRepository';
import { storageManager } from '@/backend/shared/database/StorageManager';

export class BookingRepository extends BaseRepository<any> {
  protected entityType = "booking";
  protected baseCollectionName = "bookings";
  protected isPartitioned = true; // High volume, partition by year

  async findAllSorted(): Promise<any[]> {
    // For queries across partitions, we retrieve all collections for this entity type.
    const collections = await storageManager.getAllPartitionedCollections(this.baseCollectionName);
    
    // In a simplified scenario for the admin panel, we fetch from the current active partition.
    // In a fully scaled system, we would aggregate across `collections`.
    const results = [];
    for (const col of collections) {
      const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
      results.push(...docs);
    }
    
    // Sort combined results
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findByQuery(query: any): Promise<any[]> {
    const collections = await storageManager.getAllPartitionedCollections(this.baseCollectionName);
    const results = [];
    for (const col of collections) {
      const docs = await col.find(query).toArray();
      results.push(...docs);
    }
    return results;
  }
}

export const bookingRepository = new BookingRepository();
