/**
 * Vilo V1 Avatar Library
 * Comprehensive catalog of avatars supporting photorealistic previews,
 * metadata, style filters, and provider decoupling.
 */

import { AvatarItem, AvatarStyle, AvatarGender } from "./types";

export const AVATAR_LIBRARY: AvatarItem[] = [
  {
    id: "avatar-alex",
    name: "Alex",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-camera-close-up-50586-large.mp4",
    gender: "male",
    style: "Professional",
    language: "English (US)",
    provider: "mock_studio",
    role: "Senior Corporate Presenter",
    tags: ["Business", "Enterprise", "Keynote", "B2B"],
    metadata: {
      resolution: "1080p",
      transparentBackground: true,
      aspectRatios: ["16:9", "9:16", "1:1"],
    },
  },
  {
    id: "avatar-emma",
    name: "Emma",
    thumbnail: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-42861-large.mp4",
    gender: "female",
    style: "Creator",
    language: "English (US)",
    provider: "mock_studio",
    role: "Tech & Lifestyle Creator",
    tags: ["Social", "TikTok", "Reels", "Product Review"],
    metadata: {
      resolution: "1080p",
      transparentBackground: true,
      aspectRatios: ["16:9", "9:16", "1:1"],
    },
  },
  {
    id: "avatar-daniel",
    name: "Daniel",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-video-conference-call-42862-large.mp4",
    gender: "male",
    style: "Executive",
    language: "English (US)",
    provider: "mock_studio",
    role: "Executive Consultant & Strategist",
    tags: ["Sales", "Finance", "Leadership", "Pitch"],
    metadata: {
      resolution: "1080p",
      transparentBackground: true,
      aspectRatios: ["16:9", "9:16", "1:1"],
    },
  },
  {
    id: "avatar-sophia",
    name: "Sophia",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-camera-close-up-50586-large.mp4",
    gender: "female",
    style: "Real Estate",
    language: "English (UK)",
    provider: "mock_studio",
    role: "Luxury Property & Architecture Specialist",
    tags: ["Real Estate", "Architecture", "Luxury", "Walkthrough"],
    metadata: {
      resolution: "1080p",
      transparentBackground: true,
      aspectRatios: ["16:9", "9:16", "1:1"],
    },
  },
  {
    id: "avatar-arjun",
    name: "Arjun",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-video-conference-call-42862-large.mp4",
    gender: "male",
    style: "Teacher",
    language: "English (India)",
    provider: "mock_studio",
    role: "Education & Course Instructor",
    tags: ["Education", "Course", "Tutorial", "Explainer"],
    metadata: {
      resolution: "1080p",
      transparentBackground: true,
      aspectRatios: ["16:9", "9:16", "1:1"],
    },
  },
  {
    id: "avatar-maya",
    name: "Maya",
    thumbnail: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=80",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-42861-large.mp4",
    gender: "female",
    style: "Presenter",
    language: "English (US)",
    provider: "mock_studio",
    role: "Product Evangelist & Demo Host",
    tags: ["SaaS", "Commercial", "Demo", "Marketing"],
    metadata: {
      resolution: "1080p",
      transparentBackground: true,
      aspectRatios: ["16:9", "9:16", "1:1"],
    },
  },
  {
    id: "avatar-lucas",
    name: "Lucas",
    thumbnail: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-video-conference-call-42862-large.mp4",
    gender: "male",
    style: "Casual",
    language: "English (AU)",
    provider: "mock_studio",
    role: "Community & Storytelling Host",
    tags: ["Casual", "Vlog", "Story", "Podcast"],
    metadata: {
      resolution: "1080p",
      transparentBackground: true,
      aspectRatios: ["16:9", "9:16", "1:1"],
    },
  },
  {
    id: "avatar-elena",
    name: "Elena",
    thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80",
    previewVideo: "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-camera-close-up-50586-large.mp4",
    gender: "female",
    style: "Executive",
    language: "Spanish",
    provider: "mock_studio",
    role: "International Business Director",
    tags: ["Multilingual", "Global", "Corporate", "Finance"],
    metadata: {
      resolution: "1080p",
      transparentBackground: true,
      aspectRatios: ["16:9", "9:16", "1:1"],
    },
  },
];

export interface AvatarFilterParams {
  style?: string;
  gender?: AvatarGender | "all";
  language?: string;
  searchQuery?: string;
}

export class AvatarLibraryService {
  private static instance: AvatarLibraryService;

  public static getInstance(): AvatarLibraryService {
    if (!AvatarLibraryService.instance) {
      AvatarLibraryService.instance = new AvatarLibraryService();
    }
    return AvatarLibraryService.instance;
  }

  public listAvatars(params?: AvatarFilterParams): AvatarItem[] {
    let list = [...AVATAR_LIBRARY];

    if (params?.gender && params.gender !== "all") {
      list = list.filter((a) => a.gender === params.gender);
    }
    if (params?.style && params.style !== "All") {
      list = list.filter((a) => a.style.toLowerCase() === params.style?.toLowerCase());
    }
    if (params?.language && params.language !== "All") {
      list = list.filter((a) => a.language.toLowerCase().includes(params.language!.toLowerCase()));
    }
    if (params?.searchQuery) {
      const q = params.searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.style.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public getAvatarById(id: string): AvatarItem {
    return AVATAR_LIBRARY.find((a) => a.id === id) || AVATAR_LIBRARY[0];
  }
}

export const avatarLibrary = AvatarLibraryService.getInstance();
