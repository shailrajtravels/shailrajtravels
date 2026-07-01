import { BaseRepository } from '@/backend/shared/repositories/BaseRepository';
import { storageManager } from '@/backend/shared/database/StorageManager';

export class CustomBlogRepository extends BaseRepository<any> {
  protected entityType = "custom_blog";
  protected baseCollectionName = "custom_blogs";
  protected isPartitioned = false;

  async findAllSorted(query: any = {}): Promise<any[]> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.find(query).sort({ createdAt: -1 }).toArray();
  }
  
  async findBySlug(slug: string): Promise<any | null> {
    const col = await storageManager.getGlobalCollection(this.baseCollectionName);
    return col.findOne({ slug });
  }
}

export const customBlogRepository = new CustomBlogRepository();
