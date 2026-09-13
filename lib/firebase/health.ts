/**
 * Firebase Connection Health Check Utility
 * Diagnoses connectivity status across Auth, Firestore, and Cloud Storage.
 */

import { isFirebaseConfigured, auth, db, storage } from "./client";
import { doc, getDoc } from "firebase/firestore";

export interface FirebaseHealthStatus {
  isConfigured: boolean;
  mode: "production-firebase" | "local-mock";
  authReady: boolean;
  firestoreReady: boolean;
  storageReady: boolean;
  latencyMs: number;
  message: string;
  details: {
    projectId: string | null;
    authDomain: string | null;
    storageBucket: string | null;
  };
}

export async function checkFirebaseHealth(): Promise<FirebaseHealthStatus> {
  const startTime = Date.now();
  const configured = isFirebaseConfigured();

  const details = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || null,
  };

  if (!configured) {
    return {
      isConfigured: false,
      mode: "local-mock",
      authReady: false,
      firestoreReady: false,
      storageReady: false,
      latencyMs: Date.now() - startTime,
      message: "Running in Local Mock Mode (Firebase environment credentials not detected).",
      details,
    };
  }

  let authReady = Boolean(auth);
  let firestoreReady = false;
  let storageReady = Boolean(storage);

  try {
    if (db) {
      // Non-destructive probe: read healthcheck ping document
      const testRef = doc(db, "_healthcheck", "ping");
      await getDoc(testRef);
      firestoreReady = true;
    }
  } catch (err: any) {
    // If permission-denied or document missing, connection was still established
    if (err?.code === "permission-denied" || err?.code === "not-found") {
      firestoreReady = true;
    } else {
      console.warn("[Firebase Health Check] Firestore probe warning:", err);
    }
  }

  const latencyMs = Date.now() - startTime;

  return {
    isConfigured: true,
    mode: "production-firebase",
    authReady,
    firestoreReady,
    storageReady,
    latencyMs,
    message: firestoreReady
      ? `Firebase is connected and healthy (${latencyMs}ms).`
      : `Firebase client initialized (${latencyMs}ms).`,
    details,
  };
}
