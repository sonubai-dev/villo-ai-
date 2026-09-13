import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  Project, 
  Scene, 
  User, 
  Template, 
  AspectRatio, 
  CaptionSettings,
  CreationType,
  MotionPreset 
} from "./types";
import { MOCK_AVATARS } from "./providers/mock/mock-avatar";
import { MOCK_VOICES } from "./providers/mock/mock-voice";
import { MOCK_MEDIA_ITEMS } from "./mock-media";
import { saveFirestoreProject, deleteFirestoreProject } from "./firebase/firestore";
import { isFirebaseConfigured } from "./firebase/client";

const DEFAULT_CAPTIONS: CaptionSettings = {
  enabled: true,
  style: "creator",
  position: "bottom",
  fontSize: "medium",
  highlightColor: "#38bdf8",
  textColor: "#ffffff",
  backgroundColor: "rgba(0, 0, 0, 0.75)",
};

export const SEED_TEMPLATES: Template[] = [
  {
    id: "tpl-realestate",
    title: "Luxury Property Showcase",
    category: "Real Estate",
    duration: 24,
    aspectRatio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
    description: "High-end real estate listing video with cinematic camera pans and an AI estate agent.",
    scenes: [
      {
        order: 0,
        title: "Exterior Grand Entrance",
        script: "Welcome to 42 Horizon Crest, an ultra-modern architectural masterpiece with panoramic ocean vistas.",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
        prompt: "Ultra-luxurious modern villa with glass facade at dusk, infinity pool reflecting sunset sky, 8k architectural photo",
        motionPreset: "cinematic-push",
        cameraEffect: "cinematic-push",
        motionSpeed: 1.0,
        motionStrength: 80,
        zoom: 1.15,
        panX: 0,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-sophia",
        avatarLayout: "circle-bottom-right",
        showAvatar: true,
        voiceId: "voice-sofia",
        duration: 8,
        transition: "fade",
        transitionDuration: 0.6,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
        backgroundMusicTitle: "Ambient Future Chillwave",
        backgroundMusicVolume: 0.35,
        voiceVolume: 1.0,
        textOverlay: {
          content: "42 Horizon Crest — $12,500,000",
          fontSize: "medium",
          textColor: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.7)",
          position: "top",
          animation: "slide-up"
        }
      },
      {
        order: 1,
        title: "Italian Chef Kitchen & Lounge",
        script: "Step inside to double-height ceilings and a custom Italian chef's kitchen designed for world-class entertaining.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
        prompt: "Open concept luxury kitchen with marble waterfall island, designer pendant lighting, minimalist interior",
        motionPreset: "pan-right",
        cameraEffect: "pan-right",
        motionSpeed: 1.0,
        motionStrength: 75,
        zoom: 1.05,
        panX: 10,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-sophia",
        avatarLayout: "circle-bottom-right",
        showAvatar: true,
        voiceId: "voice-sofia",
        duration: 8,
        transition: "slide-left",
        transitionDuration: 0.5,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
        backgroundMusicTitle: "Ambient Future Chillwave",
        backgroundMusicVolume: 0.35,
        voiceVolume: 1.0,
        textOverlay: {
          content: "Italian Calacatta Marble & Gaggenau",
          fontSize: "medium",
          textColor: "#38bdf8",
          backgroundColor: "rgba(0,0,0,0.7)",
          position: "top",
          animation: "fade"
        }
      },
      {
        order: 2,
        title: "Master Suite Sunset Balcony",
        script: "Featuring five private en-suite bedrooms and a sunset viewing terrace. Book your private VIP viewing tour today.",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
        prompt: "Master bedroom suite with floor-to-ceiling glass doors opening onto sunset ocean balcony, warm lighting",
        motionPreset: "slow-zoom",
        cameraEffect: "slow-zoom",
        motionSpeed: 1.0,
        motionStrength: 60,
        zoom: 1.08,
        panX: 0,
        panY: -5,
        rotation: 0,
        avatarId: "avatar-sophia",
        avatarLayout: "circle-bottom-right",
        showAvatar: true,
        voiceId: "voice-sofia",
        duration: 8,
        transition: "fade",
        transitionDuration: 0.8,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
        backgroundMusicTitle: "Ambient Future Chillwave",
        backgroundMusicVolume: 0.35,
        voiceVolume: 1.0,
        textOverlay: {
          content: "Private Viewings Available",
          fontSize: "large",
          textColor: "#ffffff",
          backgroundColor: "rgba(14,165,233,0.85)",
          position: "bottom",
          animation: "pop"
        }
      },
    ],
  },
  {
    id: "tpl-saas",
    title: "SaaS Product Demo & Launch",
    category: "Product",
    duration: 22,
    aspectRatio: "16:9",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    description: "Crisp, modern product walkthrough designed to explain complex features in under 30 seconds.",
    scenes: [
      {
        order: 0,
        title: "The Problem",
        script: "Still spending hours rendering video content manually? Meet Vilo AI, the visual creation operating system.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
        prompt: "Futuristic glowing SaaS dashboard UI on dark glass display, holographic graphs, 3d analytics visualization",
        motionPreset: "cinematic-push",
        cameraEffect: "cinematic-push",
        motionSpeed: 1.2,
        motionStrength: 85,
        zoom: 1.2,
        panX: 0,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-alex",
        avatarLayout: "side-by-side-left",
        showAvatar: true,
        voiceId: "voice-daniel",
        duration: 7,
        transition: "fade",
        transitionDuration: 0.5,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=corporate-motivational-background-music-111000.mp3",
        backgroundMusicTitle: "Upbeat Corporate Innovation",
        backgroundMusicVolume: 0.3,
        voiceVolume: 1.0,
      },
      {
        order: 1,
        title: "Workflow Automation",
        script: "Simply upload your scripts, slides, or photos. In seconds, Vilo turns your ideas into engaging video scenes.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
        prompt: "Modern tech workstation with multiple glowing monitors showing automated generative AI video workflow",
        motionPreset: "pan-left",
        cameraEffect: "pan-left",
        motionSpeed: 1.0,
        motionStrength: 75,
        zoom: 1.1,
        panX: -8,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-alex",
        avatarLayout: "side-by-side-left",
        showAvatar: true,
        voiceId: "voice-daniel",
        duration: 8,
        transition: "slide-left",
        transitionDuration: 0.5,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=corporate-motivational-background-music-111000.mp3",
        backgroundMusicTitle: "Upbeat Corporate Innovation",
        backgroundMusicVolume: 0.3,
        voiceVolume: 1.0,
      },
      {
        order: 2,
        title: "Call to Action",
        script: "Join over 10,000 creators and high-growth businesses. Start your free trial today at vilo.ai.",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80",
        prompt: "Inspiring digital workspace with neon lighting accents, creative startup atmosphere",
        motionPreset: "zoom-in",
        cameraEffect: "zoom-in",
        motionSpeed: 1.0,
        motionStrength: 70,
        zoom: 1.12,
        panX: 0,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-alex",
        avatarLayout: "circle-bottom-right",
        showAvatar: true,
        voiceId: "voice-daniel",
        duration: 7,
        transition: "zoom",
        transitionDuration: 0.6,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=corporate-motivational-background-music-111000.mp3",
        backgroundMusicTitle: "Upbeat Corporate Innovation",
        backgroundMusicVolume: 0.3,
        voiceVolume: 1.0,
      },
    ],
  },
  {
    id: "tpl-social",
    title: "Viral TikTok / Reel Hook",
    category: "Instagram",
    duration: 15,
    aspectRatio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    description: "High-retention vertical format with dynamic captions and engaging presenter head.",
    scenes: [
      {
        order: 0,
        title: "The Hook",
        script: "Stop scrolling! Here are 3 secret AI motion tools that will save you 10 hours this week.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        prompt: "Vibrant neon abstract 3D artwork with purple and sky blue fluid waves",
        motionPreset: "cinematic-pull",
        cameraEffect: "cinematic-pull",
        motionSpeed: 1.2,
        motionStrength: 90,
        zoom: 1.25,
        panX: 0,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-emma",
        avatarLayout: "circle-bottom-right",
        showAvatar: true,
        voiceId: "voice-emma",
        duration: 7,
        transition: "zoom",
        transitionDuration: 0.5,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3",
        backgroundMusicTitle: "Lo-Fi Midnight Study Beat",
        backgroundMusicVolume: 0.4,
        voiceVolume: 1.0,
      },
      {
        order: 1,
        title: "The Breakdown",
        script: "Number one is automated scripting, number two is instant motion camera paths, and three is auto-captions!",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
        prompt: "Futuristic retro-wave computer aesthetic with glowing neon elements",
        motionPreset: "pan-up",
        cameraEffect: "pan-up",
        motionSpeed: 1.1,
        motionStrength: 80,
        zoom: 1.1,
        panX: 0,
        panY: -10,
        rotation: 0,
        avatarId: "avatar-emma",
        avatarLayout: "fullscreen-presenter",
        showAvatar: true,
        voiceId: "voice-emma",
        duration: 8,
        transition: "slide-left",
        transitionDuration: 0.5,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3",
        backgroundMusicTitle: "Lo-Fi Midnight Study Beat",
        backgroundMusicVolume: 0.4,
        voiceVolume: 1.0,
      },
    ],
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-real-estate-1",
    userId: "demo-user-1",
    title: "Luxury Horizon Penthouse Tour",
    type: "avatar",
    status: "completed",
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
    duration: 24,
    aspectRatio: "9:16",
    globalCaptions: DEFAULT_CAPTIONS,
    createdAt: "2026-08-20T10:30:00Z",
    updatedAt: "2026-08-22T14:15:00Z",
    exportVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-circuit-board-micro-controller-view-41738-large.mp4",
    scenes: [
      {
        id: "sc-1",
        projectId: "proj-real-estate-1",
        order: 0,
        title: "Exterior Grand Entrance",
        script: "Welcome to 42 Horizon Crest, an ultra-modern architectural masterpiece with panoramic ocean vistas.",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
        prompt: "Ultra-luxurious modern villa with glass facade at dusk, infinity pool reflecting sunset sky, 8k photo",
        motionPreset: "cinematic-push",
        cameraEffect: "cinematic-push",
        motionSpeed: 1.0,
        motionStrength: 80,
        zoom: 1.15,
        panX: 0,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-sophia",
        avatarLayout: "circle-bottom-right",
        showAvatar: true,
        voiceId: "voice-sofia",
        duration: 8,
        transition: "fade",
        transitionDuration: 0.6,
        captions: DEFAULT_CAPTIONS,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
        backgroundMusicTitle: "Ambient Future Chillwave",
        backgroundMusicVolume: 0.35,
        voiceVolume: 1.0,
        textOverlay: {
          content: "42 Horizon Crest — $12,500,000",
          fontSize: "medium",
          textColor: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.7)",
          position: "top",
          animation: "slide-up"
        }
      },
      {
        id: "sc-2",
        projectId: "proj-real-estate-1",
        order: 1,
        title: "Gourmet Kitchen & Lounge",
        script: "Step inside to double-height ceilings and a custom Italian chef's kitchen designed for world-class entertaining.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
        prompt: "Open concept luxury kitchen with marble waterfall island, designer pendant lighting",
        motionPreset: "pan-right",
        cameraEffect: "pan-right",
        motionSpeed: 1.0,
        motionStrength: 75,
        zoom: 1.05,
        panX: 8,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-sophia",
        avatarLayout: "circle-bottom-right",
        showAvatar: true,
        voiceId: "voice-sofia",
        duration: 8,
        transition: "slide-left",
        transitionDuration: 0.5,
        captions: DEFAULT_CAPTIONS,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
        backgroundMusicTitle: "Ambient Future Chillwave",
        backgroundMusicVolume: 0.35,
        voiceVolume: 1.0,
        textOverlay: {
          content: "Italian Calacatta Marble & Gaggenau",
          fontSize: "medium",
          textColor: "#38bdf8",
          backgroundColor: "rgba(0,0,0,0.7)",
          position: "top",
          animation: "fade"
        }
      },
      {
        id: "sc-3",
        projectId: "proj-real-estate-1",
        order: 2,
        title: "Private Sunset Balcony",
        script: "Featuring five private suites and sunset viewing terrace. Book your private VIP viewing tour today.",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
        prompt: "Master bedroom suite with floor-to-ceiling glass doors opening onto sunset ocean balcony",
        motionPreset: "slow-zoom",
        cameraEffect: "slow-zoom",
        motionSpeed: 1.0,
        motionStrength: 60,
        zoom: 1.08,
        panX: 0,
        panY: -4,
        rotation: 0,
        avatarId: "avatar-sophia",
        avatarLayout: "circle-bottom-right",
        showAvatar: true,
        voiceId: "voice-sofia",
        duration: 8,
        transition: "fade",
        transitionDuration: 0.8,
        captions: DEFAULT_CAPTIONS,
        backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
        backgroundMusicTitle: "Ambient Future Chillwave",
        backgroundMusicVolume: 0.35,
        voiceVolume: 1.0,
        textOverlay: {
          content: "Private Viewings Available",
          fontSize: "large",
          textColor: "#ffffff",
          backgroundColor: "rgba(14,165,233,0.85)",
          position: "bottom",
          animation: "pop"
        }
      },
    ],
  },
  {
    id: "proj-saas-intro",
    userId: "demo-user-1",
    title: "Vilo AI Product Launch Explainer",
    type: "script",
    status: "completed",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    duration: 22,
    aspectRatio: "16:9",
    globalCaptions: DEFAULT_CAPTIONS,
    createdAt: "2026-08-21T09:00:00Z",
    updatedAt: "2026-08-23T11:45:00Z",
    exportVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-buildings-in-a-financial-district-41444-large.mp4",
    scenes: [
      {
        id: "sc-saas-1",
        projectId: "proj-saas-intro",
        order: 0,
        title: "Introduction",
        script: "Are you tired of spending days producing video presentations? Introducing Vilo AI.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
        prompt: "Futuristic glowing SaaS dashboard UI on dark glass display",
        motionPreset: "cinematic-push",
        cameraEffect: "cinematic-push",
        motionSpeed: 1.2,
        motionStrength: 85,
        zoom: 1.2,
        panX: 0,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-alex",
        avatarLayout: "side-by-side-left",
        showAvatar: true,
        voiceId: "voice-daniel",
        duration: 7,
        transition: "fade",
        transitionDuration: 0.5,
        captions: DEFAULT_CAPTIONS,
      },
      {
        id: "sc-saas-2",
        projectId: "proj-saas-intro",
        order: 1,
        title: "Creation Engine",
        script: "Turn your ideas, images, and documents into high-converting videos in just a few clicks.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
        prompt: "Modern tech workstation showing automated AI video workflow",
        motionPreset: "pan-left",
        cameraEffect: "pan-left",
        motionSpeed: 1.0,
        motionStrength: 75,
        zoom: 1.1,
        panX: -8,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-alex",
        avatarLayout: "side-by-side-left",
        showAvatar: true,
        voiceId: "voice-daniel",
        duration: 8,
        transition: "slide-left",
        transitionDuration: 0.5,
        captions: DEFAULT_CAPTIONS,
      },
      {
        id: "sc-saas-3",
        projectId: "proj-saas-intro",
        order: 2,
        title: "Call To Action",
        script: "Experience the future of video creation today at vilo.ai.",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80",
        prompt: "Inspiring digital workspace with neon lighting accents",
        motionPreset: "zoom-in",
        cameraEffect: "zoom-in",
        motionSpeed: 1.0,
        motionStrength: 70,
        zoom: 1.12,
        panX: 0,
        panY: 0,
        rotation: 0,
        avatarId: "avatar-alex",
        avatarLayout: "circle-bottom-right",
        showAvatar: true,
        voiceId: "voice-daniel",
        duration: 7,
        transition: "zoom",
        transitionDuration: 0.6,
        captions: DEFAULT_CAPTIONS,
      },
    ],
  },
  {
    id: "proj-motion-city",
    userId: "demo-user-1",
    title: "Cyberpunk Neo-Tokyo Motion Reel",
    type: "image-video",
    status: "draft",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    duration: 18,
    aspectRatio: "16:9",
    globalCaptions: DEFAULT_CAPTIONS,
    createdAt: "2026-08-24T14:00:00Z",
    updatedAt: "2026-08-25T16:20:00Z",
    scenes: [
      {
        id: "sc-cyber-1",
        projectId: "proj-motion-city",
        order: 0,
        title: "Neon Streets",
        script: "Entering Neo-Tokyo sector seven. Autonomous drones patrol the rain-slicked neon avenues.",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
        prompt: "Cyberpunk alley with towering holographic advertisements, neon reflections in puddles",
        motionPreset: "cinematic-push",
        cameraEffect: "cinematic-push",
        motionSpeed: 1.3,
        motionStrength: 95,
        zoom: 1.3,
        panX: 0,
        panY: 0,
        rotation: 2,
        avatarId: "avatar-marcus",
        avatarLayout: "circle-bottom-right",
        showAvatar: false,
        voiceId: "voice-marcus",
        duration: 9,
        transition: "glitch",
        transitionDuration: 0.5,
        captions: DEFAULT_CAPTIONS,
      },
      {
        id: "sc-cyber-2",
        projectId: "proj-motion-city",
        order: 1,
        title: "Neural Core",
        script: "Deep within the server vaults, quantum matrices process petabytes of synthetic memories.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        prompt: "Abstract fluid neon sphere glowing in deep space, hyper-detailed render",
        motionPreset: "slow-zoom",
        cameraEffect: "slow-zoom",
        motionSpeed: 0.8,
        motionStrength: 65,
        zoom: 1.1,
        panX: 0,
        panY: 0,
        rotation: -2,
        avatarId: "avatar-marcus",
        avatarLayout: "circle-bottom-right",
        showAvatar: false,
        voiceId: "voice-marcus",
        duration: 9,
        transition: "fade",
        transitionDuration: 0.8,
        captions: DEFAULT_CAPTIONS,
      },
    ],
  },
];


export const DEMO_USER: User = {
  id: "demo-user-1",
  name: "Alex Rivera",
  email: "alex.rivera@vilo.ai",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  credits: 85,
  tier: "creator",
};

interface AppState {
  user: User | null;
  projects: Project[];
  templates: Template[];
  currentProjectId: string | null;
  
  // Auth actions
  loginAsDemo: () => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  deductCredits: (amount: number) => boolean;

  // Project actions
  createProject: (params: {
    title: string;
    type: CreationType;
    sourceType?: import("./types").SourceType;
    sourceFile?: import("./types").ProjectSourceFile;
    script?: string;
    avatar?: import("./types").ProjectPresenterMeta;
    voice?: import("./types").ProjectVoiceMeta;
    aspectRatio?: AspectRatio;
    scenes?: Partial<Scene>[];
    brandKitId?: string;
  }) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;
  setCurrentProjectId: (id: string | null) => void;
  getProjectById: (id: string) => Project | undefined;

  // Scene actions
  addScene: (projectId: string, sceneData?: Partial<Scene>) => Scene;
  updateScene: (projectId: string, sceneId: string, updates: Partial<Scene>) => void;
  deleteScene: (projectId: string, sceneId: string) => void;
  duplicateScene: (projectId: string, sceneId: string) => Scene | null;
  splitScene: (projectId: string, sceneId: string) => void;
  reorderScenes: (projectId: string, activeIndex: number, overIndex: number) => void;


  
  // Template actions
  useTemplate: (templateId: string) => Project | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: DEMO_USER,
      projects: INITIAL_PROJECTS,
      
      templates: SEED_TEMPLATES,
      mediaItems: MOCK_MEDIA_ITEMS,
      currentProjectId: "proj-real-estate-1",

      loginAsDemo: () => {
        set({ user: DEMO_USER });
      },

      logout: () => {
        set({ user: null });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      deductCredits: (amount) => {
        const currentUser = get().user;
        if (!currentUser || currentUser.credits < amount) {
          return false;
        }
        set({
          user: { ...currentUser, credits: currentUser.credits - amount },
        });
        return true;
      },

      createProject: ({ title, type, sourceType, sourceFile, script, avatar, voice, aspectRatio = "16:9", scenes = [], brandKitId }) => {
        const defaultAvatar = MOCK_AVATARS[0];
        const defaultVoice = MOCK_VOICES[0];
        const projectId = `proj-${Date.now()}`;

        const constructedScenes: Scene[] = scenes.length > 0
          ? scenes.map((s, idx) => {
              const preset = s.motionPreset || (s.cameraEffect as MotionPreset) || "zoom-in";
              return {
                id: s.id || `sc-${Date.now()}-${idx}`,
                projectId,
                order: idx,
                title: s.title || `Scene ${idx + 1}`,
                script: s.script || "Enter your narration script here...",
                image: s.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
                prompt: s.prompt || "Photorealistic high-resolution modern visual scene, 8k resolution",
                negativePrompt: s.negativePrompt || "blurry, low quality, distorted, artifacts",
                cameraPrompt: s.cameraPrompt || "Cinematic camera movement",
                stylePreset: s.stylePreset || "cinematic",
                motionPreset: preset,
                cameraEffect: preset,
                motionSpeed: s.motionSpeed || 1.0,
                motionStrength: s.motionStrength || 75,
                zoom: s.zoom || 1.0,
                panX: s.panX || 0,
                panY: s.panY || 0,
                rotation: s.rotation || 0,
                avatarId: s.avatarId || defaultAvatar.id,
                avatarLayout: s.avatarLayout || "circle-bottom-right",
                showAvatar: s.showAvatar ?? true,
                voiceId: s.voiceId || defaultVoice.id,
                duration: s.duration || 6,
                transition: s.transition || "fade",
                transitionDuration: s.transitionDuration || 0.5,
                captions: s.captions || DEFAULT_CAPTIONS,
                textOverlay: s.textOverlay,
                backgroundMusic: s.backgroundMusic,
                backgroundMusicTitle: s.backgroundMusicTitle,
                backgroundMusicVolume: s.backgroundMusicVolume ?? 0.35,
                voiceVolume: s.voiceVolume ?? 1.0,
              };
            })
          : [
              {
                id: `sc-${Date.now()}-0`,
                projectId,
                order: 0,
                title: "Scene 1",
                script: "Welcome to Vilo AI. Generate structured scenes with AI narration, avatars, and animations.",
                image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
                prompt: "Futuristic digital studio with neon lighting, ultra sharp 8k",
                negativePrompt: "blurry, low quality, distorted",
                cameraPrompt: "Slow cinematic zoom in",
                stylePreset: "cinematic",
                motionPreset: "zoom-in",
                cameraEffect: "zoom-in",
                motionSpeed: 1.0,
                motionStrength: 75,
                zoom: 1.05,
                panX: 0,
                panY: 0,
                rotation: 0,
                avatarId: defaultAvatar.id,
                avatarLayout: "circle-bottom-right",
                showAvatar: true,
                voiceId: defaultVoice.id,
                duration: 6,
                transition: "fade",
                transitionDuration: 0.5,
                captions: DEFAULT_CAPTIONS,
                backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
                backgroundMusicTitle: "Ambient Future Chillwave",
                backgroundMusicVolume: 0.35,
                voiceVolume: 1.0,
              },
            ];

        const totalDuration = constructedScenes.reduce((acc, sc) => acc + sc.duration, 0);

        const newProject: Project = {
          id: projectId,
          userId: get().user?.id || "demo-user-1",
          title: title || "Untitled Project",
          type,
          sourceType,
          sourceFile,
          script,
          avatar,
          voice,
          status: "draft",
          thumbnail: constructedScenes[0].image,
          duration: totalDuration,
          aspectRatio,
          scenes: constructedScenes,
          globalCaptions: DEFAULT_CAPTIONS,
          brandKitId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [newProject, ...state.projects],
          currentProjectId: newProject.id,
        }));

        if (isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          saveFirestoreProject(newProject);
        }

        return newProject;
      },

      updateProject: (id, updates) => {
        let updatedProject: Project | null = null;
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id) return p;
            const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
            if (updates.scenes) {
              updated.duration = updates.scenes.reduce((sum, s) => sum + s.duration, 0);
              if (updates.scenes[0]?.image) {
                updated.thumbnail = updates.scenes[0].image;
              }
            }
            updatedProject = updated;
            return updated;
          }),
        }));

        if (updatedProject && isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          saveFirestoreProject(updatedProject);
        }
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        }));

        if (isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          deleteFirestoreProject(id);
        }
      },

      duplicateProject: (id) => {
        const target = get().projects.find((p) => p.id === id);
        if (!target) return null;

        const newId = `proj-${Date.now()}`;
        const duplicatedScenes = target.scenes.map((s, idx) => ({
          ...s,
          id: `sc-${Date.now()}-${idx}`,
          projectId: newId,
        }));

        const duplicated: Project = {
          ...target,
          id: newId,
          title: `${target.title} (Copy)`,
          scenes: duplicatedScenes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [duplicated, ...state.projects],
        }));

        if (isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          saveFirestoreProject(duplicated);
        }

        return duplicated;
      },

      setCurrentProjectId: (id) => {
        set({ currentProjectId: id });
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      addScene: (projectId, sceneData) => {
        const defaultAvatar = MOCK_AVATARS[0];
        const defaultVoice = MOCK_VOICES[0];
        const project = get().projects.find((p) => p.id === projectId);
        const order = project ? project.scenes.length : 0;
        const preset = sceneData?.motionPreset || (sceneData?.cameraEffect as MotionPreset) || "zoom-in";

        const newScene: Scene = {
          id: `sc-${Date.now()}`,
          projectId,
          order,
          title: sceneData?.title || `Scene ${order + 1}`,
          script: sceneData?.script || "Add scene narration text here...",
          image: sceneData?.image || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80",
          prompt: sceneData?.prompt || "Photorealistic high-definition scene visual",
          negativePrompt: sceneData?.negativePrompt || "blurry, low quality",
          cameraPrompt: sceneData?.cameraPrompt || "Cinematic camera movement",
          stylePreset: sceneData?.stylePreset || "cinematic",
          motionPreset: preset,
          cameraEffect: preset,
          motionSpeed: sceneData?.motionSpeed || 1.0,
          motionStrength: sceneData?.motionStrength || 75,
          zoom: sceneData?.zoom || 1.0,
          panX: sceneData?.panX || 0,
          panY: sceneData?.panY || 0,
          rotation: sceneData?.rotation || 0,
          avatarId: sceneData?.avatarId || defaultAvatar.id,
          avatarLayout: sceneData?.avatarLayout || "circle-bottom-right",
          showAvatar: sceneData?.showAvatar ?? true,
          voiceId: sceneData?.voiceId || defaultVoice.id,
          duration: sceneData?.duration || 6,
          transition: sceneData?.transition || "fade",
          transitionDuration: sceneData?.transitionDuration || 0.5,
          captions: sceneData?.captions || DEFAULT_CAPTIONS,
          textOverlay: sceneData?.textOverlay,
          backgroundMusic: sceneData?.backgroundMusic,
          backgroundMusicTitle: sceneData?.backgroundMusicTitle,
          backgroundMusicVolume: sceneData?.backgroundMusicVolume ?? 0.35,
          voiceVolume: sceneData?.voiceVolume ?? 1.0,
        };

        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const scenes = [...p.scenes, newScene];
            return {
              ...p,
              scenes,
              duration: scenes.reduce((sum, s) => sum + s.duration, 0),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));

        if (isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          const updated = get().projects.find((p) => p.id === projectId);
          if (updated) saveFirestoreProject(updated);
        }

        return newScene;
      },

      updateScene: (projectId, sceneId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const updatedScenes = p.scenes.map((s) => {
              if (s.id !== sceneId) return s;
              const merged = { ...s, ...updates };
              if (updates.motionPreset && !updates.cameraEffect) {
                merged.cameraEffect = updates.motionPreset;
              }
              if (updates.cameraEffect && !updates.motionPreset) {
                merged.motionPreset = updates.cameraEffect;
              }
              return merged;
            });
            return {
              ...p,
              scenes: updatedScenes,
              duration: updatedScenes.reduce((sum, s) => sum + s.duration, 0),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));

        if (isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          const updated = get().projects.find((p) => p.id === projectId);
          if (updated) saveFirestoreProject(updated);
        }
      },

      deleteScene: (projectId, sceneId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const remaining = p.scenes
              .filter((s) => s.id !== sceneId)
              .map((s, idx) => ({ ...s, order: idx }));
            return {
              ...p,
              scenes: remaining,
              duration: remaining.reduce((sum, s) => sum + s.duration, 0),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));

        if (isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          const updated = get().projects.find((p) => p.id === projectId);
          if (updated) saveFirestoreProject(updated);
        }
      },

      duplicateScene: (projectId, sceneId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return null;
        const targetScene = project.scenes.find((s) => s.id === sceneId);
        if (!targetScene) return null;

        const newScene: Scene = {
          ...targetScene,
          id: `sc-${Date.now()}`,
          order: targetScene.order + 1,
          title: `${targetScene.title || "Scene"} (Copy)`,
        };

        const newScenes = [...project.scenes];
        newScenes.splice(targetScene.order + 1, 0, newScene);
        const reindexed = newScenes.map((s, idx) => ({ ...s, order: idx }));

        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              scenes: reindexed,
              duration: reindexed.reduce((sum, s) => sum + s.duration, 0),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));

        if (isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          const updated = get().projects.find((p) => p.id === projectId);
          if (updated) saveFirestoreProject(updated);
        }

        return newScene;
      },

      splitScene: (projectId, sceneId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        const target = project.scenes.find((s) => s.id === sceneId);
        if (!target) return;

        const halfDuration = Math.max(3, Math.floor(target.duration / 2));
        const words = target.script.split(/\s+/).filter(Boolean);
        const halfWords = Math.ceil(words.length / 2);
        const scriptPart1 = words.slice(0, halfWords).join(" ") || target.script;
        const scriptPart2 = words.slice(halfWords).join(" ") || "Continued narration in scene part 2...";

        const updatedPart1: Scene = {
          ...target,
          duration: halfDuration,
          script: scriptPart1,
          title: `${target.title || "Scene"} (Part 1)`,
        };

        const newPart2: Scene = {
          ...target,
          id: `sc-${Date.now()}`,
          order: target.order + 1,
          duration: Math.max(3, target.duration - halfDuration),
          script: scriptPart2,
          title: `${target.title || "Scene"} (Part 2)`,
          transition: "fade",
        };

        const newScenes = [...project.scenes];
        const targetIdx = newScenes.findIndex((s) => s.id === sceneId);
        newScenes.splice(targetIdx, 1, updatedPart1, newPart2);
        const reindexed = newScenes.map((s, idx) => ({ ...s, order: idx }));

        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              scenes: reindexed,
              duration: reindexed.reduce((sum, s) => sum + s.duration, 0),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));

        if (isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          const updated = get().projects.find((p) => p.id === projectId);
          if (updated) saveFirestoreProject(updated);
        }
      },

      reorderScenes: (projectId, activeIndex, overIndex) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const scenes = [...p.scenes];
            const [moved] = scenes.splice(activeIndex, 1);
            scenes.splice(overIndex, 0, moved);
            const reindexed = scenes.map((s, idx) => ({ ...s, order: idx }));
            return {
              ...p,
              scenes: reindexed,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));

        if (isFirebaseConfigured() && process.env.NEXT_PUBLIC_BACKEND_MODE === "firebase") {
          const updated = get().projects.find((p) => p.id === projectId);
          if (updated) saveFirestoreProject(updated);
        }
      },

      useTemplate: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return null;

        const newProject = get().createProject({
          title: `${template.title}`,
          type: "avatar",
          aspectRatio: template.aspectRatio,
          scenes: template.scenes,
        });

        return newProject;
      },
    }),
    {
      name: "vilo-ai-storage-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

