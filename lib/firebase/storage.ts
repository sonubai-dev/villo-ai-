/**
 * Firebase Cloud Storage Modular Layer
 */

import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  UploadTask 
} from "firebase/storage";
import { storage, isFirebaseConfigured } from "./client";

export interface UploadProgressCallback {
  (progressPercent: number, bytesTransferred: number, totalBytes: number): void;
}

/**
 * Uploads a browser File to Firebase Cloud Storage with progress tracking.
 */
export async function uploadFileToStorage(
  storagePath: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!storage || !isFirebaseConfigured()) {
    // Graceful fallback for mock mode: create local object URL or return mock string
    console.info("[Storage Mock] Simulating file upload to:", storagePath);
    if (typeof window !== "undefined") {
      onProgress?.(100, file.size, file.size);
      return URL.createObjectURL(file);
    }
    return "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=80";
  }

  const storageRef = ref(storage, storagePath);
  const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(progress, snapshot.bytesTransferred, snapshot.totalBytes);
      },
      (error) => {
        console.error("[Storage] Upload failed:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Uploads a Blob / Buffer to Firebase Cloud Storage.
 */
export async function uploadBlobToStorage(
  storagePath: string,
  blob: Blob,
  contentType: string = "image/jpeg",
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!storage || !isFirebaseConfigured()) {
    console.info("[Storage Mock] Simulating blob upload to:", storagePath);
    onProgress?.(100, blob.size, blob.size);
    if (typeof window !== "undefined") {
      return URL.createObjectURL(blob);
    }
    return `https://firebasestorage.googleapis.com/v0/b/vilo-ai.appspot.com/o/${encodeURIComponent(storagePath)}?alt=media`;
  }

  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, blob, { contentType });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(progress, snapshot.bytesTransferred, snapshot.totalBytes);
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

/**
 * Deletes a file from Firebase Cloud Storage.
 */
export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  if (!storage || !isFirebaseConfigured()) {
    return;
  }
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("[Storage] Delete error:", err);
  }
}
