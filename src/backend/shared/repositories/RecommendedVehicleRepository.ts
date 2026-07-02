import { BaseRepository } from './BaseRepository';
import { Document, ObjectId } from 'mongodb';
import { storageManager } from '@/backend/shared/database/StorageManager';

export interface RecommendedVehicle extends Document {
  id: string; // The text id used in frontend (e.g. 'swift-dzire')
  name: string;
  capacityStr: string;
  minCap: number;
  maxCap: number;
  description: string;
  amenities: string[];
  image: string;
  badge?: string;
  order: number;
}

export class RecommendedVehicleRepository extends BaseRepository<RecommendedVehicle> {
  protected entityType = 'vehicle';
  protected baseCollectionName = 'recommended_vehicles';
  protected isPartitioned = false;

  async findAllSorted(): Promise<RecommendedVehicle[]> {
    const col = await storageManager.getGlobalCollection<RecommendedVehicle>(this.baseCollectionName);
    return col.find().sort({ order: 1 }).toArray();
  }

  async replaceAll(vehicles: Omit<RecommendedVehicle, '_id'>[]): Promise<void> {
    const col = await storageManager.getGlobalCollection<RecommendedVehicle>(this.baseCollectionName);
    await col.deleteMany({});
    
    const docs: any[] = vehicles.map((v, i) => ({
      ...v,
      order: typeof v.order === 'number' ? v.order : i,
      _id: new ObjectId()
    }));
    
    if (docs.length > 0) {
      await col.insertMany(docs);
    }
  }
}

export const recommendedVehicleRepository = new RecommendedVehicleRepository();
