import { BaseRepository } from '@/backend/shared/repositories/BaseRepository';
import { storageManager } from '@/backend/shared/database/StorageManager';

export class PackageRepository extends BaseRepository<any> {
  protected entityType = "package";
  protected baseCollectionName = "packages";
  protected isPartitioned = false; // Config collection

  async findAllSorted(query: any = {}): Promise<any[]> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.find(query).sort({ createdAt: -1 }).toArray();
  }

  async findByQuery(query: any): Promise<any[]> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.find(query).toArray();
  }
}

export const packageRepository = new PackageRepository();
