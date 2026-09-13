/**
 * AI Result Cache & In-Flight Request Coalescing Engine
 * Uses deterministic SHA-256 hashing to eliminate duplicate AI calls,
 * saving LLM API costs and reducing response latency to <1ms.
 */

import crypto from "crypto";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

export interface CachedAIResult<T = any> {
  cacheKey: string;
  taskType: string;
  result: T;
  modelTier: string;
  tokenCount: number;
  createdAt: string;
}

export interface AICacheStats {
  hits: number;
  misses: number;
  coalescedRequests: number;
  savedCostUsd: number;
}

export class AICacheManager {
  private static instance: AICacheManager;
  private memoryCache = new Map<string, CachedAIResult>();
  private inFlightRequests = new Map<string, Promise<any>>();
  private stats: AICacheStats = {
    hits: 0,
    misses: 0,
    coalescedRequests: 0,
    savedCostUsd: 0,
  };

  public static getInstance(): AICacheManager {
    if (!AICacheManager.instance) {
      AICacheManager.instance = new AICacheManager();
    }
    return AICacheManager.instance;
  }

  /**
   * Generates a deterministic SHA-256 key based on task type, input parameters, and model tier.
   */
  public computeCacheKey(taskType: string, input: any, modelTier: string): string {
    const payload = JSON.stringify({
      t: taskType,
      i: input,
      m: modelTier,
    });
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  /**
   * Wraps an AI generation execution with caching & in-flight deduplication.
   */
  public async getOrExecute<T>(
    taskType: string,
    input: any,
    modelTier: string,
    executor: () => Promise<T>,
    tokenEstimator?: (res: T) => number
  ): Promise<{ data: T; cached: boolean; latencyMs: number }> {
    const startTime = Date.now();
    const cacheKey = this.computeCacheKey(taskType, input, modelTier);

    // 1. Check In-Memory Cache
    if (this.memoryCache.has(cacheKey)) {
      this.stats.hits++;
      const cached = this.memoryCache.get(cacheKey)!;
      this.stats.savedCostUsd += (cached.tokenCount / 1000) * 0.000075;
      return {
        data: cached.result as T,
        cached: true,
        latencyMs: Date.now() - startTime,
      };
    }

    // 2. Check Firestore Cache (if configured)
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "aiCache", cacheKey);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const record = snap.data() as CachedAIResult<T>;
          this.memoryCache.set(cacheKey, record);
          this.stats.hits++;
          this.stats.savedCostUsd += (record.tokenCount / 1000) * 0.000075;
          return {
            data: record.result,
            cached: true,
            latencyMs: Date.now() - startTime,
          };
        }
      } catch (err) {
        // Non-blocking firestore lookup error
        console.warn("[AICacheManager] Firestore lookup warning:", err);
      }
    }

    // 3. In-Flight Request Coalescing: If an identical request is already running, reuse its promise
    if (this.inFlightRequests.has(cacheKey)) {
      this.stats.coalescedRequests++;
      const inFlightResult = await this.inFlightRequests.get(cacheKey)!;
      return {
        data: inFlightResult as T,
        cached: true,
        latencyMs: Date.now() - startTime,
      };
    }

    // 4. Execute AI Call
    this.stats.misses++;
    const executionPromise = (async () => {
      try {
        const result = await executor();
        const tokens = tokenEstimator ? tokenEstimator(result) : 500;

        const record: CachedAIResult<T> = {
          cacheKey,
          taskType,
          result,
          modelTier,
          tokenCount: tokens,
          createdAt: new Date().toISOString(),
        };

        this.memoryCache.set(cacheKey, record);

        // Save to Firestore asynchronously
        if (db && isFirebaseConfigured()) {
          const ref = doc(db, "aiCache", cacheKey);
          setDoc(ref, record).catch((e) => console.warn("[AICacheManager] Firestore setDoc error:", e));
        }

        return result;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, executionPromise);
    const data = await executionPromise;

    return {
      data,
      cached: false,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Return cache statistics for observability and reporting.
   */
  public getStats(): AICacheStats {
    return { ...this.stats };
  }

  /**
   * Clear cache (useful for testing).
   */
  public clear(): void {
    this.memoryCache.clear();
    this.inFlightRequests.clear();
    this.stats = { hits: 0, misses: 0, coalescedRequests: 0, savedCostUsd: 0 };
  }
}

export const aiCacheManager = AICacheManager.getInstance();
