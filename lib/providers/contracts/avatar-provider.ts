/**
 * Avatar Provider Interface for Vilo V1
 * Decouples avatar catalogs and talking presenter previews from vendor APIs.
 */

import { Avatar } from "@/lib/types";
import { MOCK_AVATARS } from "@/lib/providers/mock/mock-avatar";

export interface AvatarFilterOptions {
  gender?: "male" | "female" | "all";
  category?: string;
  searchQuery?: string;
}

export interface IAvatarProvider {
  readonly name: string;
  listAvatars(options?: AvatarFilterOptions): Promise<Avatar[]>;
  getAvatar(id: string): Promise<Avatar | null>;
  generateTalkingPreview(avatarId: string, audioUrl: string): Promise<{ videoUrl: string; duration: number }>;
}

export class MockAvatarProvider implements IAvatarProvider {
  readonly name = "MockAvatarProvider";

  async listAvatars(options?: AvatarFilterOptions): Promise<Avatar[]> {
    let list = [...MOCK_AVATARS];

    if (options?.gender && options.gender !== "all") {
      list = list.filter((a) => a.gender === options.gender);
    }
    if (options?.category && options.category !== "All") {
      list = list.filter((a) => a.category.toLowerCase() === options.category?.toLowerCase());
    }
    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }

  async getAvatar(id: string): Promise<Avatar | null> {
    const found = MOCK_AVATARS.find((a) => a.id === id);
    return found || MOCK_AVATARS[0] || null;
  }

  async generateTalkingPreview(
    avatarId: string,
    audioUrl: string
  ): Promise<{ videoUrl: string; duration: number }> {
    await new Promise((r) => setTimeout(r, 600));
    return {
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-camera-close-up-50586-large.mp4",
      duration: 10,
    };
  }
}
