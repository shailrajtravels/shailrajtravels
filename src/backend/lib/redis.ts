import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import path from "path";
import fs from "fs";
import { memoryCache } from "./memory-cache";

// Load .env variables manually in Node environment if not loaded
if (typeof window === "undefined") {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      envContent.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEq = trimmed.indexOf("=");
          if (firstEq !== -1) {
            const key = trimmed.substring(0, firstEq).trim();
            let val = trimmed.substring(firstEq + 1).trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            } else if (val.startsWith("'") && val.endsWith("'")) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  } catch (e) {
    console.error("Error loading .env for Redis", e);
  }
}

let redisClient: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("Upstash Redis initialized successfully.");
  } else {
    console.warn("Upstash Redis credentials missing. Cache will be disabled.");
  }
} catch (e) {
  console.error("Failed to initialize Upstash Redis", e);
}

export const redis = redisClient;

// Define rate limiters
export const rateLimiters = {
  api: redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(50, "10 s"), // 50 requests per 10 seconds per IP
        analytics: true,
      })
    : null,
  login: redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes per IP
        analytics: true,
      })
    : null,
  booking: redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 bookings per hour per IP
        analytics: true,
      })
    : null,
};
export async function getCachedData<T>(key: string): Promise<T | null> {
  // 1. Check L1 Memory Cache (Fastest)
  const l1Data = memoryCache.get<T>(key);
  if (l1Data !== null) {
    return l1Data;
  }

  // 2. Check L2 Redis Cache
  if (!redis) return null;
  try {
    const data = await redis.get<T>(key);
    if (data !== null) {
      // Backfill L1 Cache from Redis
      memoryCache.set(key, data);
    }
    return data;
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
}

export async function setCachedData(key: string, data: any, ex: number = 300): Promise<void> {
  // Set in L1 Memory Cache (clamp TTL to 60s max to prevent severe cross-instance staleness)
  memoryCache.set(key, data, Math.min(ex, 60));

  if (!redis) return;
  try {
    await redis.set(key, data, { ex });
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  memoryCache.delete(key);

  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Redis DEL error for key ${key}:`, error);
  }
}
