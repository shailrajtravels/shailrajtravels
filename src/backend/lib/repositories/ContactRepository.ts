import { BaseRepository } from "./BaseRepository";
import { storageManager } from "../database/StorageManager";

export class ContactRepository extends BaseRepository<any> {
  protected entityType = "contact";
  protected baseCollectionName = "contacts";
  protected isPartitioned = false;

  // Insert is inherited from BaseRepository
}

export const contactRepository = new ContactRepository();
