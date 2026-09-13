/**
 * Deterministic Lip-Sync Video Cache Layer
 * Hashes (avatarVideoUrl + audioUrl + duration + modelType) to eliminate duplicate lip-sync compute costs.
 */

import crypto from "crypto";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { LipSyncInput, LipSyncResult } from "./types";

export interface CachedLipSyncRecord {
  cacheKey: string;
  avatarVideoUrl: string;
  audioUrl: string;
  syncedVideoUrl: string;
  duration: number;
  phonemeCount: number;
  syncAccuracy: number;
  providerUsed: "mock" | "remote" | "local";
  createdAt: string;
}

export class LipSyncCacheManager {
  private static instance: LipSyncCacheManager;
  private memoryCache = new Map<string, CachedLipSyncRecord>();

  public static getInstance(): LipSyncCacheManager {
    if (!LipSyncCacheManager.instance) {
      LipSyncCacheManager.instance = new LipSyncCacheManager();
    }
    return LipSyncCacheManager.instance;
  }

  /**
   * Computes deterministic SHA-256 hash from avatar + audio + duration + modelType.
   */
  public computeCacheKey(input: LipSyncInput): string {
    const avatarUrl = input.avatarVideoUrl || "default-avatar";
    const audioUrl = input.audioUrl || "default-audio";
    const duration = (input.duration || 10).toFixed(1);
    const modelType = input.modelType || "standard";

    const payload = `${avatarUrl}|${audioUrl}|${duration}|${modelType}`;
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  /**
   * Checks if synchronized lip-sync video already exists in cache.
   */
  public async getCachedLipSync(cacheKey: string): Promise<CachedLipSyncRecord | null> {
    // 1. Check Memory Cache
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // 2. Check Firestore Cache Collection
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "lipSyncCache", cacheKey);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const record = snap.data() as CachedLipSyncRecord;
          this.memoryCache.set(cacheKey, record);
          return record;
        }
      } catch (err) {
        console.warn("[LipSyncCacheManager] Firestore lookup warning:", err);
      }
    }

    return null;
  }

  /**
   * Stores a new synchronized lip-sync record in cache.
   */
  public async saveCachedLipSync(
    input: LipSyncInput,
    cacheKey: string,
    result: Omit<LipSyncResult, "cached">
  ): Promise<CachedLipSyncRecord> {
    const record: CachedLipSyncRecord = {
      cacheKey,
      avatarVideoUrl: input.avatarVideoUrl,
      audioUrl: input.audioUrl,
      syncedVideoUrl: result.syncedVideoUrl,
      duration: result.duration,
      phonemeCount: result.phonemeCount,
      syncAccuracy: result.syncAccuracy,
      providerUsed: result.providerUsed,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Memory
    this.memoryCache.set(cacheKey, record);

    // 2. Save to Firestore
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "lipSyncCache", cacheKey);
        await setDoc(ref, record);
      } catch (err) {
        console.warn("[LipSyncCacheManager] Firestore save warning:", err);
      }
    }

    return record;
  }

  /**
   * Clear cache (useful for testing).
   */
  public clear(): void {
    this.memoryCache.clear();
  }
}

export const lipSyncCacheManager = LipSyncCacheManager.getInstance();
