import { mongoAdapter } from '@/backend/shared/database/MongoAdapter';
import { routingRepository } from '@/backend/shared/repositories/RoutingRepository';
import { Collection, Document, ObjectId, Db } from 'mongodb';

const MAX_STORAGE_THRESHOLD_BYTES = 450 * 1024 * 1024; // 450MB (90% of 512MB free tier)

export class StorageManager {
  private activeWriteClusterId: string | null = null;

  /**
   * Determine which cluster should receive new writes based on storage usage.
   * Caches the result to avoid pinging dbStats on every insert.
   */
  private async getActiveWriteCluster(): Promise<string> {
    if (this.activeWriteClusterId) return this.activeWriteClusterId;

    const clusters = mongoAdapter.getAvailableClusters();
    let selectedCluster = mongoAdapter.getPrimaryClusterId();

    for (const clusterId of clusters) {
      const stats = await mongoAdapter.getStorageStats(clusterId);
      if (stats && stats.dataSize < MAX_STORAGE_THRESHOLD_BYTES) {
        selectedCluster = clusterId;
        break; // Found a cluster with space
      }
    }

    this.activeWriteClusterId = selectedCluster;
    return selectedCluster;
  }

  /**
   * Helper to determine the current year for collection partitioning
   */
  private getCurrentYearSuffix(): string {
    return new Date().getFullYear().toString();
  }

  /**
   * Gets a collection for generic (non-partitioned) configurations like 'tours' or 'packages'
   * These always reside on the primary cluster.
   */
  async getGlobalCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
    const db = await mongoAdapter.getDbAsync(mongoAdapter.getPrimaryClusterId());
    return (db as unknown as Db).collection<T>(collectionName);
  }

  /**
   * Resolves the correct collection for reading/updating an EXISTING partitioned document.
   * If not found in routing, falls back to the current year's collection on primary.
   */
  async getCollectionForRead<T extends Document>(
    entityType: string,
    entityId: string,
    baseCollectionName: string
  ): Promise<Collection<T>> {
    const route = await routingRepository.getRoute(entityType, entityId);
    
    if (route) {
      const db = await mongoAdapter.getDbAsync(route.cluster);
      return (db as unknown as Db).collection<T>(route.collection);
    }
    
    // Fallback: assume it's in the current year collection on primary cluster if no route exists yet
    // But for backward compatibility, check if it's in the base collection (unpartitioned) first
    const db = await mongoAdapter.getDbAsync(mongoAdapter.getPrimaryClusterId());
    
    // Quick check in base collection
    const baseCol = (db as unknown as Db).collection<T>(baseCollectionName);
    const inBase = await baseCol.findOne({ _id: new ObjectId(entityId) } as any);
    if (inBase) {
      return baseCol;
    }
    
    const collectionName = `${baseCollectionName}_${this.getCurrentYearSuffix()}`;
    return (db as unknown as Db).collection<T>(collectionName);
  }

  /**
   * Resolves the correct cluster and generates a new partitioned collection name for WRITING.
   * Also automatically saves the routing metadata.
   */
  async getCollectionForWrite<T extends Document>(
    entityType: string,
    entityId: string,
    baseCollectionName: string
  ): Promise<Collection<T>> {
    const clusterId = await this.getActiveWriteCluster();
    const db = await mongoAdapter.getDbAsync(clusterId);
    const collectionName = `${baseCollectionName}_${this.getCurrentYearSuffix()}`;
    
    // Save the routing lookup mapping
    await routingRepository.saveRoute({
      entityType,
      entityId,
      cluster: clusterId,
      collection: collectionName
    });

    return (db as unknown as Db).collection<T>(collectionName);
  }

  /**
   * Helper for queries that need to scan across all yearly partitioned collections (e.g., getting all bookings).
   * Note: For an admin panel, it might be better to just query the current and previous year to avoid full cluster scans.
   */
  async getAllPartitionedCollections<T extends Document>(baseCollectionName: string): Promise<Collection<T>[]> {
    const clusterId = mongoAdapter.getPrimaryClusterId();
    const db = await mongoAdapter.getDbAsync(clusterId);
    
    // Find all collections that match baseCollectionName or baseCollectionName_YYYY
    const cols = await (db as unknown as Db).listCollections().toArray();
    const matchingCols = cols.filter((c: any) => c.name === baseCollectionName || c.name.startsWith(`${baseCollectionName}_`));
    
    // If none exist yet, just return the current year one so we can write to it if needed (though writes usually don't use this method)
    if (matchingCols.length === 0) {
      const currentYearName = `${baseCollectionName}_${this.getCurrentYearSuffix()}`;
      return [(db as unknown as Db).collection<T>(currentYearName)];
    }
    
    return matchingCols.map((c: any) => (db as unknown as Db).collection<T>(c.name));
  }
}

export const storageManager = new StorageManager();
