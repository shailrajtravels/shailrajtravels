import { BaseRepository } from '@/backend/shared/repositories/BaseRepository';
import { storageManager } from '@/backend/shared/database/StorageManager';

export class GalleryRepository extends BaseRepository<any> {
  protected entityType = "gallery";
  protected baseCollectionName = "gallery";
  protected isPartitioned = false;

  async findAllSorted(query: any = {}): Promise<any[]> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.find(query).sort({ createdAt: -1 }).toArray();
  }
}

export const galleryRepository = new GalleryRepository();
