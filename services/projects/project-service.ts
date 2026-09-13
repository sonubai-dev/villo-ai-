/**
 * Project Service
 * High-level orchestration for video projects, enforcing authenticated user validation,
 * optimistic state updates, and clean repository abstraction.
 */

import { projectRepository, IProjectRepository, getBackendMode } from "./project-repository";
import { Project, CreationType, AspectRatio, Scene } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { authService } from "@/services/auth";

export class ProjectService {
  private static instance: ProjectService;
  private repository: IProjectRepository = projectRepository;

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  public getMode(): "mock" | "firebase" {
    return getBackendMode();
  }

  private getCurrentUserId(): string {
    const currentUser = authService.getCurrentUser() || useAppStore.getState().user;
    return currentUser?.id || "demo-user-1";
  }

  /**
   * Fetch all projects belonging to the authenticated user.
   */
  public async listProjects(userId?: string): Promise<Project[]> {
    const targetUserId = userId || this.getCurrentUserId();
    return this.repository.list(targetUserId);
  }

  /**
   * Fetch a single project by ID.
   */
  public async getProject(projectId: string): Promise<Project | null> {
    return this.repository.getById(projectId);
  }

  /**
   * Create a new project.
   * 1. Verifies authenticated user
   * 2. Persists project & scenes to Firestore/Mock
   * 3. Returns project object and updates UI state
   */
  public async createProject(params: {
    title: string;
    type: CreationType;
    aspectRatio?: AspectRatio;
    scenes?: Partial<Scene>[];
    brandKitId?: string;
    userId?: string;
  }): Promise<Project> {
    const userId = params.userId || this.getCurrentUserId();

    return this.repository.create({
      title: params.title,
      type: params.type,
      aspectRatio: params.aspectRatio,
      scenes: params.scenes,
      brandKitId: params.brandKitId,
      userId,
    });
  }

  /**
   * Update project fields with optimistic state synchronization.
   */
  public async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    return this.repository.update(projectId, updates);
  }

  /**
   * Delete a project.
   */
  public async deleteProject(projectId: string): Promise<void> {
    return this.repository.delete(projectId);
  }

  /**
   * Duplicate a project with fresh IDs for project and scenes.
   */
  public async duplicateProject(projectId: string): Promise<Project> {
    const currentUserId = this.getCurrentUserId();
    return this.repository.duplicate(projectId, currentUserId);
  }

  /**
   * Real-time subscription to a single project document.
   */
  public subscribeToProject(projectId: string, callback: (project: Project | null) => void): () => void {
    return this.repository.subscribe(projectId, callback);
  }

  /**
   * Real-time subscription to all projects of a user.
   */
  public subscribeToUserProjects(userId: string, callback: (projects: Project[]) => void): () => void {
    return this.repository.subscribeUserProjects(userId, callback);
  }
}

export const projectService = ProjectService.getInstance();
