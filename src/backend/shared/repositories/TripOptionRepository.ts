import { BaseRepository } from '@/backend/shared/repositories/BaseRepository';
import { storageManager } from '@/backend/shared/database/StorageManager';

export class TripOptionRepository extends BaseRepository<any> {
  protected entityType = "trip_option";
  protected baseCollectionName = "trip_options";
  protected isPartitioned = false; // Config collection

  async findAll(): Promise<any[]> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.find({}).toArray();
  }

  async findByQuery(query: any): Promise<any[]> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.find(query).toArray();
  }
}

export const tripOptionRepository = new TripOptionRepository();
