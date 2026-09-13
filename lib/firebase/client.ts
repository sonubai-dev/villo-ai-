/**
 * Firebase Client SDK Initialization
 * Provides singleton instances for Auth, Firestore, and Storage with graceful mock fallback.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Returns true if required Firebase credentials are set in environment variables.
 */
export function isFirebaseConfigured(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_PROVIDERS === "true") {
    return false;
  }
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.length > 5 &&
    !firebaseConfig.apiKey.includes("AIzaSy...")
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (typeof window !== "undefined" || process.env.NODE_ENV !== "test") {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    } catch (err) {
      console.warn("[Vilo Firebase] Failed to initialize Firebase client SDK. Falling back to local mock mode.", err);
      app = null;
      auth = null;
      db = null;
      storage = null;
    }
  }
}

export { app, auth, db, storage };
export default app;
