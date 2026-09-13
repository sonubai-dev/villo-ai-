import { Avatar } from "@/lib/types";
import { AvatarProvider, AvatarGenerationInput, AvatarResult } from "../types";

export const MOCK_AVATARS: Avatar[] = [
  {
    id: "avatar-alex",
    name: "Alex",
    gender: "male",
    category: "Professional",
    role: "Senior Corporate Presenter",
    accent: "English (US)",
    previewImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    defaultVoiceId: "voice-daniel",
    tags: ["Business", "Keynote", "Finance", "B2B"],
  },
  {
    id: "avatar-emma",
    name: "Emma",
    gender: "female",
    category: "Creator",
    role: "Tech & Lifestyle Creator",
    accent: "English (US)",
    previewImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
    defaultVoiceId: "voice-emma",
    tags: ["Tech", "Reels", "Social", "Review"],
  },
  {
    id: "avatar-daniel",
    name: "Daniel",
    gender: "male",
    category: "Business",
    role: "Executive Consultant",
    accent: "English (US)",
    previewImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    defaultVoiceId: "voice-daniel",
    tags: ["Executive", "Sales", "Enterprise", "Pitch"],
  },
  {
    id: "avatar-sophia",
    name: "Sophia",
    gender: "female",
    category: "Real Estate",
    role: "Luxury Property Specialist",
    accent: "English (UK)",
    previewImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    defaultVoiceId: "voice-sofia",
    tags: ["Real Estate", "Architecture", "Luxury", "Walkthrough"],
  },
  {
    id: "avatar-arjun",
    name: "Arjun",
    gender: "male",
    category: "Teacher",
    role: "Education & Course Instructor",
    accent: "English (India)",
    previewImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
    defaultVoiceId: "voice-arjun",
    tags: ["Education", "Tutorial", "Explainer", "AI"],
  },
  {
    id: "avatar-maya",
    name: "Maya",
    gender: "female",
    category: "Presenter",
    role: "Product Evangelist",
    accent: "English (India)",
    previewImage: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=500&auto=format&fit=crop&q=80",
    defaultVoiceId: "voice-priya",
    tags: ["Product Demo", "SaaS", "Launch", "Commercial"],
  },
  {
    id: "avatar-ryan",
    name: "Ryan",
    gender: "male",
    category: "Casual",
    role: "Modern Startup Founder",
    accent: "English (US)",
    previewImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
    defaultVoiceId: "voice-daniel",
    tags: ["Startup", "Storytelling", "Casual", "YouTube"],
  },
  {
    id: "avatar-olivia",
    name: "Olivia",
    gender: "female",
    category: "Teacher",
    role: "Clinical & Training Specialist",
    accent: "English (US)",
    previewImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    defaultVoiceId: "voice-emma",
    tags: ["Medical", "Compliance", "Training", "Safety"],
  },
];

export class MockAvatarProvider implements AvatarProvider {
  async getAvatars(): Promise<Avatar[]> {
    // Simulate brief network delay
    await new Promise((r) => setTimeout(r, 100));
    return MOCK_AVATARS;
  }

  async getAvatarById(id: string): Promise<Avatar | null> {
    return MOCK_AVATARS.find((a) => a.id === id) || null;
  }

  async generateAvatarPreview(input: AvatarGenerationInput): Promise<AvatarResult> {
    const avatar = await this.getAvatarById(input.avatarId);
    return {
      avatarId: input.avatarId,
      previewUrl: avatar?.previewImage || MOCK_AVATARS[0].previewImage,
      talkingAnimationUrl: avatar?.previewImage || MOCK_AVATARS[0].previewImage,
      duration: Math.max(5, Math.ceil(input.script.split(" ").length / 2.5)),
    };
  }
}
