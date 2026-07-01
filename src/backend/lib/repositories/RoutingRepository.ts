import { mongoAdapter } from "../database/MongoAdapter";
import { Db } from "mongodb";

export interface RoutingMetadata {
  entityType: string;
  entityId: string;
  cluster: string;
  collection: string;
}

export class RoutingRepository {
  // Configurable: always store routing on the primary cluster for now
  private getRoutingDb() {
    return mongoAdapter.getDb(mongoAdapter.getPrimaryClusterId());
  }

  async getRoute(entityType: string, entityId: string): Promise<RoutingMetadata | null> {
    const db = this.getRoutingDb();
    const doc = await (db as unknown as Db).collection("routing_metadata").findOne({ entityType, entityId });
    if (!doc) return null;
    
    return {
      entityType: doc.entityType,
      entityId: doc.entityId,
      cluster: doc.cluster,
      collection: doc.collection
    };
  }

  async saveRoute(route: RoutingMetadata): Promise<void> {
    const db = this.getRoutingDb();
    await (db as unknown as Db).collection("routing_metadata").updateOne(
      { entityType: route.entityType, entityId: route.entityId },
      { $set: route },
      { upsert: true }
    );
  }
  
  async deleteRoute(entityType: string, entityId: string): Promise<void> {
    const db = this.getRoutingDb();
    await (db as unknown as Db).collection("routing_metadata").deleteOne({ entityType, entityId });
  }
}

export const routingRepository = new RoutingRepository();
