import { BaseRepository } from '@/backend/shared/repositories/BaseRepository';
import { storageManager } from '@/backend/shared/database/StorageManager';

export class ReviewRepository extends BaseRepository<any> {
  protected entityType = "review";
  protected baseCollectionName = "reviews";
  protected isPartitioned = false;

  async findAllSorted(query: any = {}): Promise<any[]> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.find(query).sort({ createdAt: -1 }).toArray();
  }
}

export const reviewRepository = new ReviewRepository();
