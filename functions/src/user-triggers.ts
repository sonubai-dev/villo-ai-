/**
 * Cloud Functions User Triggers
 * Automatically initializes Firestore user documents upon Firebase Auth registration.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(user.uid);

  const initialProfile = {
    id: user.uid,
    name: user.displayName || "Creator",
    email: user.email || "",
    avatar: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    credits: 100,
    tier: "creator",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await userRef.set(initialProfile, { merge: true });
    functions.logger.info(`Initialized Firestore profile for user: ${user.uid}`);
  } catch (err) {
    functions.logger.error(`Error creating profile for user ${user.uid}:`, err);
  }
});
