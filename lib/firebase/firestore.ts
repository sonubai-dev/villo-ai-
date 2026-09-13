/**
 * Firebase Firestore Modular Data Layer
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
  onSnapshot, 
  serverTimestamp,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./client";
import { Project, Scene, User } from "@/lib/types";

export const COLLECTIONS = {
  USERS: "users",
  PROJECTS: "projects",
  SCENES: "scenes",
  BRAND_KITS: "brandKits",
  MEDIA_ASSETS: "mediaAssets",
  GENERATION_JOBS: "generationJobs",
  TEMPLATES: "templates",
} as const;

export interface GenerationJobDoc {
  id: string;
  userId: string;
  projectId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  stage: string;
  stepMessage: string;
  logs: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function getFirestoreUser(userId: string): Promise<User | null> {
  if (!db || !isFirebaseConfigured()) return null;
  try {
    const ref = doc(db, COLLECTIONS.USERS, userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as User;
  } catch (err) {
    console.error("[Firestore] getFirestoreUser error:", err);
    return null;
  }
}

export async function saveFirestoreUser(user: User): Promise<void> {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const ref = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(ref, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error("[Firestore] saveFirestoreUser error:", err);
  }
}

// -------------------------------------------------------------
// PROJECT OPERATIONS
// -------------------------------------------------------------
export async function getFirestoreProjects(userId: string): Promise<Project[]> {
  if (!db || !isFirebaseConfigured()) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(25)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Project);
  } catch (err) {
    console.error("[Firestore] getFirestoreProjects error:", err);
    return [];
  }
}

export async function getFirestoreProjectById(projectId: string): Promise<Project | null> {
  if (!db || !isFirebaseConfigured()) return null;
  try {
    const ref = doc(db, COLLECTIONS.PROJECTS, projectId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as Project;
  } catch (err) {
    console.error("[Firestore] getFirestoreProjectById error:", err);
    return null;
  }
}

export async function saveFirestoreProject(project: Project): Promise<void> {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const ref = doc(db, COLLECTIONS.PROJECTS, project.id);
    await setDoc(ref, {
      ...project,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error("[Firestore] saveFirestoreProject error:", err);
  }
}

export async function deleteFirestoreProject(projectId: string): Promise<void> {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const ref = doc(db, COLLECTIONS.PROJECTS, projectId);
    await deleteDoc(ref);
  } catch (err) {
    console.error("[Firestore] deleteFirestoreProject error:", err);
  }
}

export function subscribeToFirestoreProject(
  projectId: string,
  callback: (project: Project | null) => void
): () => void {
  if (!db || !isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }
  const ref = doc(db, COLLECTIONS.PROJECTS, projectId);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as Project);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn("[Firestore] subscribeToFirestoreProject error:", err);
      callback(null);
    }
  );
}


// GENERATION JOBS OPERATIONS
// -------------------------------------------------------------
export async function createFirestoreJob(job: GenerationJobDoc): Promise<void> {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const ref = doc(db, COLLECTIONS.GENERATION_JOBS, job.id);
    await setDoc(ref, job);
  } catch (err) {
    console.error("[Firestore] createFirestoreJob error:", err);
  }
}

export function subscribeToFirestoreJob(
  jobId: string,
  callback: (job: GenerationJobDoc | null) => void
): () => void {
  if (!db || !isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }
  const ref = doc(db, COLLECTIONS.GENERATION_JOBS, jobId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as GenerationJobDoc);
    } else {
      callback(null);
    }
  });
}
