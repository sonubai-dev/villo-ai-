/**
 * Firebase Voice Provider
 * Queries Firestore for voice models, falling back to built-in presets when offline or unconfigured.
 */

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { Voice } from "@/lib/types";
import { VoiceProvider, VoiceInput, AudioResult } from "../types";
import { MOCK_VOICES, MockVoiceProvider } from "../mock/mock-voice";

export class FirebaseVoiceProvider implements VoiceProvider {
  private fallback = new MockVoiceProvider();

  async getVoices(): Promise<Voice[]> {
    if (!db || !isFirebaseConfigured()) {
      return this.fallback.getVoices();
    }
    try {
      const snap = await getDocs(collection(db, "voices"));
      if (snap.empty) {
        return MOCK_VOICES;
      }
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Voice));
    } catch (err) {
      console.warn("[FirebaseVoiceProvider] Error fetching voices, using fallback:", err);
      return this.fallback.getVoices();
    }
  }

  async getVoiceById(id: string): Promise<Voice | null> {
    if (!db || !isFirebaseConfigured()) {
      return this.fallback.getVoiceById(id);
    }
    try {
      const snap = await getDoc(doc(db, "voices", id));
      if (!snap.exists()) {
        return this.fallback.getVoiceById(id);
      }
      return { id: snap.id, ...snap.data() } as Voice;
    } catch (err) {
      return this.fallback.getVoiceById(id);
    }
  }

  async generateSpeech(input: VoiceInput): Promise<AudioResult> {
    return this.fallback.generateSpeech(input);
  }
}
