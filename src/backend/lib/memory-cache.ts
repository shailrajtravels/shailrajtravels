type CacheItem<T> = {
  value: T;
  expiry: number;
};

export class L1Cache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly maxSize: number;
  private readonly defaultTTL: number; // in seconds

  constructor(maxSize: number = 500, defaultTTL: number = 60) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }
    
    // Optional: Reset TTL on read (LRU-like behavior), but for staleness 
    // it's better to stick to fixed expiry to ensure we eventually fetch fresh data.
    return item.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number = this.defaultTTL): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Prevent memory leak by removing the oldest entry (Map iterates in insertion order)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
          this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Export a singleton instance of the L1Cache
export const memoryCache = new L1Cache();
