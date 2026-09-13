/**
 * Firebase Avatar Provider
 * Queries Firestore for avatars, falling back to built-in presets when offline or unconfigured.
 */

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { Avatar } from "@/lib/types";
import { AvatarProvider, AvatarGenerationInput, AvatarResult } from "../types";
import { MOCK_AVATARS, MockAvatarProvider } from "../mock/mock-avatar";

export class FirebaseAvatarProvider implements AvatarProvider {
  private fallback = new MockAvatarProvider();

  async getAvatars(): Promise<Avatar[]> {
    if (!db || !isFirebaseConfigured()) {
      return this.fallback.getAvatars();
    }
    try {
      const snap = await getDocs(collection(db, "avatars"));
      if (snap.empty) {
        return MOCK_AVATARS;
      }
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Avatar));
    } catch (err) {
      console.warn("[FirebaseAvatarProvider] Error fetching avatars, using fallback:", err);
      return this.fallback.getAvatars();
    }
  }

  async getAvatarById(id: string): Promise<Avatar | null> {
    if (!db || !isFirebaseConfigured()) {
      return this.fallback.getAvatarById(id);
    }
    try {
      const snap = await getDoc(doc(db, "avatars", id));
      if (!snap.exists()) {
        return this.fallback.getAvatarById(id);
      }
      return { id: snap.id, ...snap.data() } as Avatar;
    } catch (err) {
      return this.fallback.getAvatarById(id);
    }
  }

  async generateAvatarPreview(input: AvatarGenerationInput): Promise<AvatarResult> {
    return this.fallback.generateAvatarPreview(input);
  }
}
