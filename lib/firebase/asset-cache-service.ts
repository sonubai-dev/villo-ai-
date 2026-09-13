/**
 * Unified Firebase Asset Cache Service
 * Persists and queries reusable media outputs under `generatedAssets/{hash}` in Firestore.
 * Ensures identical asset requests are retrieved in <1ms without calling external AI providers.
 */

import crypto from "crypto";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./client";
import { GeneratedAsset } from "./generation-job-types";

export class AssetCacheService {
  private static instance: AssetCacheService;
  private memoryCache = new Map<string, GeneratedAsset>();

  public static getInstance(): AssetCacheService {
    if (!AssetCacheService.instance) {
      AssetCacheService.instance = new AssetCacheService();
    }
    return AssetCacheService.instance;
  }

  /**
   * Generates a deterministic SHA-256 hash for an asset based on its type and input parameters.
   */
  public computeHash(type: GeneratedAsset["type"], source: Record<string, any>): string {
    const payload = JSON.stringify({
      t: type,
      s: source,
    });
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  /**
   * Retrieves a cached asset by hash from memory or Firestore.
   */
  public async getAsset(hash: string): Promise<GeneratedAsset | null> {
    // 1. Check in-memory cache
    if (this.memoryCache.has(hash)) {
      return this.memoryCache.get(hash)!;
    }

    // 2. Check Firestore generatedAssets collection
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "generatedAssets", hash);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as GeneratedAsset;
          this.memoryCache.set(hash, data);
          return data;
        }
      } catch (err) {
        console.warn("[AssetCacheService] Firestore lookup error:", err);
      }
    }

    return null;
  }

  /**
   * Helper to compute hash and check if asset exists in one call.
   */
  public async findAssetBySource(
    type: GeneratedAsset["type"],
    source: Record<string, any>
  ): Promise<GeneratedAsset | null> {
    const hash = this.computeHash(type, source);
    return this.getAsset(hash);
  }

  /**
   * Stores a generated asset record into memory and Firestore.
   */
  public async saveAsset(asset: GeneratedAsset): Promise<GeneratedAsset> {
    this.memoryCache.set(asset.hash, asset);

    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "generatedAssets", asset.hash);
        await setDoc(ref, asset);
      } catch (err) {
        console.warn("[AssetCacheService] Firestore save error:", err);
      }
    }

    return asset;
  }

  /**
   * Clear in-memory cache (for testing).
   */
  public clear(): void {
    this.memoryCache.clear();
  }
}

export const assetCacheService = AssetCacheService.getInstance();
