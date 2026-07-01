import { BaseRepository } from '@/backend/shared/repositories/BaseRepository';
import { storageManager } from '@/backend/shared/database/StorageManager';

export class TourRepository extends BaseRepository<any> {
  protected entityType = "tour";
  protected baseCollectionName = "tours";
  protected isPartitioned = false; // Config collection, no partition

  async findAllSorted(query: any = {}): Promise<any[]> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.find(query).sort({ createdAt: -1 }).toArray();
  }

  async findBySlug(slug: string, langQuery: any): Promise<any | null> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.findOne({ slug, ...langQuery });
  }

  async deleteManyBySlug(slug: string): Promise<void> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    await col.deleteMany({ slug } as any);
  }
}

export const tourRepository = new TourRepository();
