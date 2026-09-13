/**
 * Scene Service
 * Manages scene-level operations and debounced Firestore synchronization.
 */

import { saveFirestoreProject } from "@/lib/firebase/firestore";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { useAppStore } from "@/lib/store";
import { Scene } from "@/lib/types";

export class SceneService {
  private static instance: SceneService;
  private syncTimeouts: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): SceneService {
    if (!SceneService.instance) {
      SceneService.instance = new SceneService();
    }
    return SceneService.instance;
  }

  public updateScene(projectId: string, sceneId: string, updates: Partial<Scene>): void {
    // 1. Instant optimistic update in Zustand store
    useAppStore.getState().updateScene(projectId, sceneId, updates);

    // 2. Debounced save to Firestore (prevents high-frequency write quota exhaustion on sliders)
    if (isFirebaseConfigured()) {
      this.debounceSyncProject(projectId);
    }
  }

  public addScene(projectId: string, sceneData?: Partial<Scene>): Scene {
    const newScene = useAppStore.getState().addScene(projectId, sceneData);

    if (isFirebaseConfigured()) {
      this.debounceSyncProject(projectId, 100);
    }

    return newScene;
  }

  public deleteScene(projectId: string, sceneId: string): void {
    useAppStore.getState().deleteScene(projectId, sceneId);

    if (isFirebaseConfigured()) {
      this.debounceSyncProject(projectId, 100);
    }
  }

  public splitScene(projectId: string, sceneId: string): void {
    useAppStore.getState().splitScene(projectId, sceneId);

    if (isFirebaseConfigured()) {
      this.debounceSyncProject(projectId, 100);
    }
  }

  public duplicateScene(projectId: string, sceneId: string): Scene | null {
    const dup = useAppStore.getState().duplicateScene(projectId, sceneId);

    if (dup && isFirebaseConfigured()) {
      this.debounceSyncProject(projectId, 100);
    }

    return dup;
  }

  public reorderScenes(projectId: string, activeIndex: number, overIndex: number): void {
    useAppStore.getState().reorderScenes(projectId, activeIndex, overIndex);

    if (isFirebaseConfigured()) {
      this.debounceSyncProject(projectId, 200);
    }
  }

  private debounceSyncProject(projectId: string, delayMs: number = 800): void {
    const existing = this.syncTimeouts.get(projectId);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(async () => {
      const project = useAppStore.getState().getProjectById(projectId);
      if (project) {
        try {
          await saveFirestoreProject(project);
        } catch (err) {
          console.error("[SceneService] Debounced sync failed:", err);
        }
      }
      this.syncTimeouts.delete(projectId);
    }, delayMs);

    this.syncTimeouts.set(projectId, timeout);
  }
}

export const sceneService = SceneService.getInstance();
