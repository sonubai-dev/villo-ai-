/**
 * Project Repository Interface and Implementations
 * Provides modular persistence switching between Cloud Firestore and Local/Mock storage.
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { Project, Scene, CreationType, AspectRatio } from "@/lib/types";
import { useAppStore } from "@/lib/store";

export type BackendMode = "mock" | "firebase";

export function getBackendMode(): BackendMode {
  const modeEnv = process.env.NEXT_PUBLIC_BACKEND_MODE?.toLowerCase();
  if (modeEnv === "firebase" && isFirebaseConfigured()) {
    return "firebase";
  }
  return "mock";
}

export interface CreateProjectDTO {
  title: string;
  type: CreationType;
  userId: string;
  aspectRatio?: AspectRatio;
  scenes?: Partial<Scene>[];
  brandKitId?: string;
}

export interface IProjectRepository {
  mode: BackendMode;
  list(userId: string): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  create(dto: CreateProjectDTO): Promise<Project>;
  update(id: string, updates: Partial<Project>): Promise<Project>;
  delete(id: string): Promise<void>;
  duplicate(id: string, currentUserId: string): Promise<Project>;
  subscribe(projectId: string, callback: (project: Project | null) => void): () => void;
  subscribeUserProjects(userId: string, callback: (projects: Project[]) => void): () => void;
}

/**
 * ============================================================================
 * FIRESTORE PROJECT REPOSITORY (Production Cloud Persistence)
 * ============================================================================
 */
export class FirestoreProjectRepository implements IProjectRepository {
  public mode: BackendMode = "firebase";

  async list(userId: string): Promise<Project[]> {
    if (!db || !isFirebaseConfigured()) {
      return useAppStore.getState().projects.filter((p) => p.userId === userId);
    }

    try {
      const q = query(
        collection(db, "projects"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc"),
        limit(25)
      );
      const snap = await getDocs(q);
      const remoteProjects = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
      
      // Update local store cache optimistically
      useAppStore.setState((state) => {
        const otherProjects = state.projects.filter((p) => p.userId !== userId);
        return { projects: [...remoteProjects, ...otherProjects] };
      });

      return remoteProjects;
    } catch (err) {
      console.warn("[FirestoreProjectRepository] list error, falling back to local store:", err);
      return useAppStore.getState().projects.filter((p) => p.userId === userId);
    }
  }

  async getById(id: string): Promise<Project | null> {
    if (!db || !isFirebaseConfigured()) {
      return useAppStore.getState().getProjectById(id) || null;
    }

    try {
      const ref = doc(db, "projects", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return useAppStore.getState().getProjectById(id) || null;
      }
      const remote = { id: snap.id, ...snap.data() } as Project;
      
      // Sync into local store cache
      useAppStore.getState().updateProject(remote.id, remote);
      return remote;
    } catch (err) {
      console.warn("[FirestoreProjectRepository] getById error:", err);
      return useAppStore.getState().getProjectById(id) || null;
    }
  }

  async create(dto: CreateProjectDTO): Promise<Project> {
    const projectId = `proj-${Date.now()}`;
    const now = new Date().toISOString();

    const initialScenes: Scene[] = dto.scenes && dto.scenes.length > 0
      ? dto.scenes.map((s, idx) => ({
          id: s.id || `sc-${Date.now()}-${idx}`,
          projectId,
          order: idx,
          title: s.title || `Scene ${idx + 1}`,
          script: s.script || "Welcome to this new video scene.",
          image: s.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80",
          imageFit: s.imageFit || "cover",
          prompt: s.prompt,
          motionPreset: s.motionPreset || "zoom-in",
          cameraEffect: s.cameraEffect || "zoom-in",
          motionSpeed: s.motionSpeed ?? 1.0,
          motionStrength: s.motionStrength ?? 75,
          avatarId: s.avatarId || "avatar-sophia",
          avatarLayout: s.avatarLayout || "circle-bottom-right",
          showAvatar: s.showAvatar ?? true,
          voiceId: s.voiceId || "voice-en-us-1",
          duration: s.duration || 6,
          transition: s.transition || "fade",
          captions: s.captions,
          textOverlay: s.textOverlay,
          backgroundMusic: s.backgroundMusic,
          backgroundMusicVolume: s.backgroundMusicVolume ?? 0.35,
          voiceVolume: s.voiceVolume ?? 1.0,
        }))
      : [
          {
            id: `sc-${Date.now()}-0`,
            projectId,
            order: 0,
            title: "Scene 1",
            script: "Welcome to Vilo AI. Create engaging visual videos from images, scripts and presentations.",
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=80",
            imageFit: "cover",
            motionPreset: "zoom-in",
            cameraEffect: "zoom-in",
            motionSpeed: 1.0,
            motionStrength: 75,
            avatarId: "avatar-sophia",
            avatarLayout: "circle-bottom-right",
            showAvatar: true,
            voiceId: "voice-en-us-1",
            duration: 6,
            transition: "fade",
          },
        ];

    const duration = initialScenes.reduce((acc, sc) => acc + (sc.duration || 5), 0);
    const thumbnail = initialScenes[0]?.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=80";

    const newProject: Project = {
      id: projectId,
      userId: dto.userId,
      title: dto.title,
      type: dto.type,
      status: "draft",
      thumbnail,
      duration,
      aspectRatio: dto.aspectRatio || "16:9",
      scenes: initialScenes,
      globalCaptions: {
        enabled: true,
        style: "creator",
        position: "bottom",
        fontSize: "medium",
        highlightColor: "#38bdf8",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
      },
      brandKitId: dto.brandKitId,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Optimistic update in UI store
    useAppStore.setState((state) => ({
      projects: [newProject, ...state.projects],
      currentProjectId: projectId,
    }));

    // 2. Persist to Firestore
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "projects", projectId);
        await setDoc(ref, newProject);
      } catch (err) {
        console.error("[FirestoreProjectRepository] create project error:", err);
      }
    }

    return newProject;
  }

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const existing = useAppStore.getState().getProjectById(id);
    const now = new Date().toISOString();

    const merged: Project = {
      ...(existing || ({} as Project)),
      ...updates,
      id,
      updatedAt: now,
    };

    if (updates.scenes) {
      merged.duration = updates.scenes.reduce((acc, sc) => acc + (sc.duration || 5), 0);
      if (updates.scenes[0]?.image) {
        merged.thumbnail = updates.scenes[0].image;
      }
    }

    // 1. Optimistic store update
    useAppStore.getState().updateProject(id, merged);

    // 2. Persist to Firestore
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "projects", id);
        await setDoc(ref, merged, { merge: true });
      } catch (err) {
        console.error("[FirestoreProjectRepository] update error:", err);
      }
    }

    return merged;
  }

  async delete(id: string): Promise<void> {
    // 1. Optimistic local removal
    useAppStore.getState().deleteProject(id);

    // 2. Remove from Firestore
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "projects", id);
        await deleteDoc(ref);
      } catch (err) {
        console.error("[FirestoreProjectRepository] delete error:", err);
      }
    }
  }

  async duplicate(id: string, currentUserId: string): Promise<Project> {
    const original = await this.getById(id);
    if (!original) throw new Error(`Project ${id} not found`);

    const newId = `proj-${Date.now()}`;
    const now = new Date().toISOString();

    const clonedScenes: Scene[] = original.scenes.map((sc, idx) => ({
      ...sc,
      id: `sc-${Date.now()}-${idx}`,
      projectId: newId,
    }));

    const duplicated: Project = {
      ...original,
      id: newId,
      userId: currentUserId,
      title: `${original.title} (Copy)`,
      status: "draft",
      scenes: clonedScenes,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Optimistic store update
    useAppStore.setState((state) => ({
      projects: [duplicated, ...state.projects],
      currentProjectId: newId,
    }));

    // 2. Persist to Firestore
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "projects", newId);
        await setDoc(ref, duplicated);
      } catch (err) {
        console.error("[FirestoreProjectRepository] duplicate error:", err);
      }
    }

    return duplicated;
  }

  subscribe(projectId: string, callback: (project: Project | null) => void): () => void {
    if (!db || !isFirebaseConfigured()) {
      const local = useAppStore.getState().getProjectById(projectId) || null;
      callback(local);
      return () => {};
    }

    const ref = doc(db, "projects", projectId);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const remote = { id: snap.id, ...snap.data() } as Project;
          useAppStore.getState().updateProject(remote.id, remote);
          callback(remote);
        } else {
          callback(null);
        }
      },
      (err) => {
        console.warn("[FirestoreProjectRepository] subscription warning:", err);
        const local = useAppStore.getState().getProjectById(projectId) || null;
        callback(local);
      }
    );
  }

  subscribeUserProjects(userId: string, callback: (projects: Project[]) => void): () => void {
    if (!db || !isFirebaseConfigured()) {
      const local = useAppStore.getState().projects.filter((p) => p.userId === userId);
      callback(local);
      return () => {};
    }

    const q = query(
      collection(db, "projects"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(
      q,
      (snap) => {
        const remoteList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
        callback(remoteList);
      },
      (err) => {
        console.warn("[FirestoreProjectRepository] user projects subscription warning:", err);
        const local = useAppStore.getState().projects.filter((p) => p.userId === userId);
        callback(local);
      }
    );
  }
}

/**
 * ============================================================================
 * MOCK PROJECT REPOSITORY (In-Memory & LocalStorage Development Mode)
 * ============================================================================
 */
export class MockProjectRepository implements IProjectRepository {
  public mode: BackendMode = "mock";

  async list(userId: string): Promise<Project[]> {
    return useAppStore.getState().projects;
  }

  async getById(id: string): Promise<Project | null> {
    return useAppStore.getState().getProjectById(id) || null;
  }

  async create(dto: CreateProjectDTO): Promise<Project> {
    return useAppStore.getState().createProject({
      title: dto.title,
      type: dto.type,
      aspectRatio: dto.aspectRatio,
      scenes: dto.scenes,
      brandKitId: dto.brandKitId,
    });
  }

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    useAppStore.getState().updateProject(id, updates);
    return useAppStore.getState().getProjectById(id)!;
  }

  async delete(id: string): Promise<void> {
    useAppStore.getState().deleteProject(id);
  }

  async duplicate(id: string, currentUserId: string): Promise<Project> {
    const dup = useAppStore.getState().duplicateProject(id);
    if (!dup) throw new Error("Could not duplicate project");
    return dup;
  }

  subscribe(projectId: string, callback: (project: Project | null) => void): () => void {
    const project = useAppStore.getState().getProjectById(projectId) || null;
    callback(project);
    return () => {};
  }

  subscribeUserProjects(userId: string, callback: (projects: Project[]) => void): () => void {
    callback(useAppStore.getState().projects);
    return () => {};
  }
}

/**
 * Project Repository Factory
 */
export function createProjectRepository(): IProjectRepository {
  const mode = getBackendMode();
  if (mode === "firebase") {
    return new FirestoreProjectRepository();
  }
  return new MockProjectRepository();
}

export const projectRepository = createProjectRepository();
