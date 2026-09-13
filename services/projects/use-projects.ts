/**
 * React Hooks for Project Data Management
 * Integrates with ProjectService and handles loading, empty, error, and retry states.
 */

import { useState, useEffect, useCallback } from "react";
import { Project, Scene, CreationType, AspectRatio } from "@/lib/types";
import { projectService } from "./project-service";
import { sceneService } from "@/services/scenes";
import { useAppStore } from "@/lib/store";
import { useUser } from "@clerk/nextjs";

export interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  mode: "mock" | "firebase";
  refresh: () => Promise<void>;
  createProject: (params: {
    title: string;
    type: CreationType;
    aspectRatio?: AspectRatio;
    scenes?: Partial<Scene>[];
    brandKitId?: string;
  }) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<Project>;
}

export function useProjects(): UseProjectsResult {
  const { user } = useUser();
  const storeProjects = useAppStore((s) => s.projects);
  const [projects, setProjects] = useState<Project[]>(storeProjects);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mode = projectService.getMode();

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.listProjects(user?.id);
      setProjects(data);
    } catch (err: any) {
      console.error("[useProjects] Error fetching projects:", err);
      setError(err?.message || "Failed to load projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProjects();

    // Real-time subscription if in Firebase mode
    if (mode === "firebase" && user?.id) {
      const unsubscribe = projectService.subscribeToUserProjects(user.id, (updated) => {
        setProjects(updated);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [fetchProjects, mode, user?.id]);

  const handleCreate = async (params: {
    title: string;
    type: CreationType;
    aspectRatio?: AspectRatio;
    scenes?: Partial<Scene>[];
    brandKitId?: string;
  }) => {
    const created = await projectService.createProject(params);
    setProjects((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    return created;
  };

  const handleUpdate = async (id: string, updates: Partial<Project>) => {
    const updated = await projectService.updateProject(id, updates);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const handleDelete = async (id: string) => {
    await projectService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicate = async (id: string) => {
    const duplicated = await projectService.duplicateProject(id);
    setProjects((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  return {
    projects: projects.length > 0 ? projects : storeProjects,
    isLoading,
    error,
    mode,
    refresh: fetchProjects,
    createProject: handleCreate,
    updateProject: handleUpdate,
    deleteProject: handleDelete,
    duplicateProject: handleDuplicate,
  };
}

export interface UseProjectResult {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProject: (updates: Partial<Project>) => Promise<Project | null>;
  addScene: (sceneData?: Partial<Scene>) => Scene;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  deleteScene: (sceneId: string) => void;
  duplicateScene: (sceneId: string) => Scene | null;
  splitScene: (sceneId: string) => void;
  reorderScenes: (activeIndex: number, overIndex: number) => void;
}

export function useProject(projectId: string): UseProjectResult {
  const storeProject = useAppStore((s) => s.getProjectById(projectId)) || null;
  const [project, setProject] = useState<Project | null>(storeProject);
  const [isLoading, setIsLoading] = useState<boolean>(!storeProject);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setError(null);
    try {
      const data = await projectService.getProject(projectId);
      if (data) {
        setProject(data);
      } else if (!storeProject) {
        setError("Project could not be found.");
      }
    } catch (err: any) {
      console.error("[useProject] Fetch error:", err);
      setError(err?.message || "Failed to load project.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, storeProject]);

  useEffect(() => {
    fetchProject();

    const unsubscribe = projectService.subscribeToProject(projectId, (updated) => {
      if (updated) {
        setProject(updated);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchProject, projectId]);

  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!projectId) return null;
    const updated = await projectService.updateProject(projectId, updates);
    setProject(updated);
    return updated;
  };

  const handleAddScene = (sceneData?: Partial<Scene>): Scene => {
    const newScene = sceneService.addScene(projectId, sceneData);
    setProject(useAppStore.getState().getProjectById(projectId) || null);
    return newScene;
  };

  const handleUpdateScene = (sceneId: string, updates: Partial<Scene>) => {
    sceneService.updateScene(projectId, sceneId, updates);
    setProject(useAppStore.getState().getProjectById(projectId) || null);
  };

  const handleDeleteScene = (sceneId: string) => {
    sceneService.deleteScene(projectId, sceneId);
    setProject(useAppStore.getState().getProjectById(projectId) || null);
  };

  const handleDuplicateScene = (sceneId: string) => {
    const dup = sceneService.duplicateScene(projectId, sceneId);
    setProject(useAppStore.getState().getProjectById(projectId) || null);
    return dup;
  };

  const handleSplitScene = (sceneId: string) => {
    sceneService.splitScene(projectId, sceneId);
    setProject(useAppStore.getState().getProjectById(projectId) || null);
  };

  const handleReorderScenes = (activeIndex: number, overIndex: number) => {
    sceneService.reorderScenes(projectId, activeIndex, overIndex);
    setProject(useAppStore.getState().getProjectById(projectId) || null);
  };

  return {
    project: project || storeProject,
    isLoading,
    error,
    refresh: fetchProject,
    updateProject: handleUpdateProject,
    addScene: handleAddScene,
    updateScene: handleUpdateScene,
    deleteScene: handleDeleteScene,
    duplicateScene: handleDuplicateScene,
    splitScene: handleSplitScene,
    reorderScenes: handleReorderScenes,
  };
}
