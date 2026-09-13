/**
 * Firebase Authentication Modular Layer
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged, 
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser 
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./client";
import { User } from "@/lib/types";

const googleProvider = new GoogleAuthProvider();

export function mapFirebaseUserToViloUser(fbUser: FirebaseUser, extraData?: Partial<User>): User {
  const displayName = fbUser.displayName || extraData?.displayName || extraData?.name || "Creator";
  const photoURL = fbUser.photoURL || extraData?.photoURL || extraData?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
  const plan = extraData?.plan || extraData?.tier || "free";
  const credits = extraData?.credits ?? 50;

  return {
    id: fbUser.uid,
    name: displayName,
    displayName,
    email: fbUser.email || "user@vilo.ai",
    avatar: photoURL,
    photoURL,
    credits,
    tier: plan,
    plan,
    createdAt: extraData?.createdAt || new Date().toISOString(),
    updatedAt: extraData?.updatedAt || new Date().toISOString(),
    onboardingCompleted: extraData?.onboardingCompleted ?? false,
  };
}

export async function loginWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
  if (!auth || !isFirebaseConfigured()) {
    throw new Error("Firebase Auth is not configured. Running in Mock/Demo mode.");
  }
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {}
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string, displayName?: string): Promise<FirebaseUser | null> {
  if (!auth || !isFirebaseConfigured()) {
    throw new Error("Firebase Auth is not configured. Running in Mock/Demo mode.");
  }
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {}
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  if (!auth || !isFirebaseConfigured()) {
    throw new Error("Firebase Auth is not configured. Running in Mock/Demo mode.");
  }
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {}
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  if (!auth || !isFirebaseConfigured()) {
    return;
  }
  await signOut(auth);
}

export async function resetUserPassword(email: string): Promise<void> {
  if (!auth || !isFirebaseConfigured()) {
    throw new Error("Firebase Auth is not configured. Running in Mock/Demo mode.");
  }
  await sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth || !isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth?.currentUser || null;
}
