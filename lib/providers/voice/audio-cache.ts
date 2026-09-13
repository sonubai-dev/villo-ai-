/**
 * Deterministic Audio Cache Layer
 * Hashes (text + voiceId + settings) to eliminate redundant TTS generation costs.
 */

import crypto from "crypto";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { SpeechGenerationInput, SpeechGenerationOutput } from "./types";

export interface CachedAudioRecord {
  cacheKey: string;
  audioUrl: string;
  duration: number;
  storagePath: string;
  textSnippet: string;
  voiceId: string;
  language: string;
  speed: number;
  pitch: number;
  emotion: string;
  createdAt: string;
}

class AudioCacheManager {
  private static instance: AudioCacheManager;
  private memoryCache = new Map<string, CachedAudioRecord>();

  public static getInstance(): AudioCacheManager {
    if (!AudioCacheManager.instance) {
      AudioCacheManager.instance = new AudioCacheManager();
    }
    return AudioCacheManager.instance;
  }

  /**
   * Computes a deterministic SHA-256 hash for exact text + voice + settings.
   */
  public computeCacheKey(input: SpeechGenerationInput): string {
    const textNorm = input.text.trim().toLowerCase();
    const voiceId = input.voiceId || "voice-en-us-1";
    const language = input.language || "en-US";
    const speed = (input.speed ?? 1.0).toFixed(2);
    const pitch = (input.pitch ?? 1.0).toFixed(2);
    const emotion = input.emotion || "neutral";

    const payload = `${textNorm}|${voiceId}|${language}|${speed}|${pitch}|${emotion}`;
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  /**
   * Builds the Cloud Storage destination path.
   * Path: users/{userId}/projects/{projectId}/audio/{cacheKey}.mp3
   */
  public getStoragePath(input: SpeechGenerationInput, cacheKey: string): string {
    const userId = input.userId || "demo-user-1";
    const projectId = input.projectId || "general";
    return `users/${userId}/projects/${projectId}/audio/${cacheKey}.mp3`;
  }

  /**
   * Checks if audio is already cached.
   */
  public async getCachedAudio(cacheKey: string): Promise<CachedAudioRecord | null> {
    // 1. Check Memory Cache
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // 2. Check Firestore Cache Collection
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "audioCache", cacheKey);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const record = snap.data() as CachedAudioRecord;
          this.memoryCache.set(cacheKey, record);
          return record;
        }
      } catch (err) {
        console.warn("[AudioCacheManager] Firestore lookup warning:", err);
      }
    }

    return null;
  }

  /**
   * Stores a new generated audio record in cache.
   */
  public async saveCachedAudio(
    input: SpeechGenerationInput,
    cacheKey: string,
    audioUrl: string,
    duration: number,
    storagePath: string
  ): Promise<CachedAudioRecord> {
    const record: CachedAudioRecord = {
      cacheKey,
      audioUrl,
      duration,
      storagePath,
      textSnippet: input.text.slice(0, 120),
      voiceId: input.voiceId,
      language: input.language || "en-US",
      speed: input.speed ?? 1.0,
      pitch: input.pitch ?? 1.0,
      emotion: input.emotion || "neutral",
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Memory
    this.memoryCache.set(cacheKey, record);

    // 2. Save to Firestore
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "audioCache", cacheKey);
        await setDoc(ref, record);
      } catch (err) {
        console.warn("[AudioCacheManager] Firestore save warning:", err);
      }
    }

    return record;
  }
}

export const audioCacheManager = AudioCacheManager.getInstance();
