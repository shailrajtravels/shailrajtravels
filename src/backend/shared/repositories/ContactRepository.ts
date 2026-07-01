import { BaseRepository } from '@/backend/shared/repositories/BaseRepository';
import { storageManager } from '@/backend/shared/database/StorageManager';

export class ContactRepository extends BaseRepository<any> {
  protected entityType = "contact";
  protected baseCollectionName = "contacts";
  protected isPartitioned = false;

  // Insert is inherited from BaseRepository
}

export const contactRepository = new ContactRepository();
