/**
 * Deterministic Avatar Video Cache Layer
 * Hashes (avatarId + audioUrl + resolution + aspectRatio) to eliminate redundant avatar generation costs.
 */

import crypto from "crypto";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { AvatarVideoInput, AvatarVideoOutput } from "./types";

export interface CachedAvatarRecord {
  cacheKey: string;
  avatarId: string;
  audioUrl: string;
  videoUrl: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  createdAt: string;
}

export class AvatarCacheManager {
  private static instance: AvatarCacheManager;
  private memoryCache = new Map<string, CachedAvatarRecord>();

  public static getInstance(): AvatarCacheManager {
    if (!AvatarCacheManager.instance) {
      AvatarCacheManager.instance = new AvatarCacheManager();
    }
    return AvatarCacheManager.instance;
  }

  /**
   * Computes a deterministic SHA-256 hash for avatar + audio + resolution + aspectRatio.
   */
  public computeCacheKey(input: AvatarVideoInput): string {
    const avatarId = input.avatarId || "avatar-sophia";
    const audioUrl = input.audioUrl || "default-audio";
    const resolution = input.resolution || "1080p";
    const aspectRatio = input.aspectRatio || "9:16";

    const payload = `${avatarId}|${audioUrl}|${resolution}|${aspectRatio}`;
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  /**
   * Checks if an avatar video is already cached.
   */
  public async getCachedAvatar(cacheKey: string): Promise<CachedAvatarRecord | null> {
    // 1. Check Memory Cache
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // 2. Check Firestore Cache Collection
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "avatarCache", cacheKey);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const record = snap.data() as CachedAvatarRecord;
          this.memoryCache.set(cacheKey, record);
          return record;
        }
      } catch (err) {
        console.warn("[AvatarCacheManager] Firestore lookup warning:", err);
      }
    }

    return null;
  }

  /**
   * Stores a new generated avatar video record in cache.
   */
  public async saveCachedAvatar(
    input: AvatarVideoInput,
    cacheKey: string,
    videoUrl: string,
    duration: number
  ): Promise<CachedAvatarRecord> {
    const record: CachedAvatarRecord = {
      cacheKey,
      avatarId: input.avatarId,
      audioUrl: input.audioUrl || "",
      videoUrl,
      duration,
      resolution: input.resolution || "1080p",
      aspectRatio: input.aspectRatio || "9:16",
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Memory
    this.memoryCache.set(cacheKey, record);

    // 2. Save to Firestore
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "avatarCache", cacheKey);
        await setDoc(ref, record);
      } catch (err) {
        console.warn("[AvatarCacheManager] Firestore save warning:", err);
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

export const avatarCacheManager = AvatarCacheManager.getInstance();
