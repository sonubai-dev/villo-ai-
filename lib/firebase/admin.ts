/**
 * Firebase Admin SDK Structure (Server-Side Operations Only)
 * Used in Next.js API Route Handlers, Server Actions, and Cloud Functions.
 * Isolated from the client browser bundle.
 */

export interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  storageBucket?: string;
}

export function isAdminConfigured(): boolean {
  if (typeof window !== "undefined") {
    return false;
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  return Boolean(
    projectId &&
    clientEmail &&
    privateKey &&
    clientEmail.includes("@") &&
    privateKey.includes("BEGIN PRIVATE KEY")
  );
}

/**
 * Server-only helper to load Firebase Admin safely at runtime
 */
export async function getAdminApp(): Promise<any | null> {
  if (typeof window !== "undefined") {
    throw new Error("Firebase Admin SDK cannot be accessed on the client-side browser.");
  }

  if (!isAdminConfigured()) {
    return null;
  }

  try {
    // Dynamic node runtime loader to ensure complete browser isolation
    const adminModuleName = "firebase-admin";
    const admin = await (Function('moduleName', 'return import(moduleName)')(adminModuleName));
    if (admin.apps && admin.apps.length > 0 && admin.apps[0]) {
      return admin.apps[0];
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (err) {
    console.warn("[Vilo Firebase Admin] Optional server admin SDK not initialized:", err);
    return null;
  }
}
