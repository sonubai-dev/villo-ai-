/**
 * Cloud Functions AI Script Generator (Callable Function)
 */

import * as functions from "firebase-functions";

export const generateVideoScript = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can request AI script generation."
    );
  }

  const { prompt, tone, duration } = data;

  if (!prompt || typeof prompt !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Prompt string is required."
    );
  }

  functions.logger.info(`Generating script for user ${context.auth.uid}: "${prompt.slice(0, 40)}..."`);

  return {
    title: prompt.slice(0, 36) || "Custom Video Story",
    summary: `Engaging multi-scene video presentation generated for: ${prompt}`,
    estimatedTotalDuration: duration || 24,
    scenes: [
      {
        sceneNumber: 1,
        duration: 8,
        script: `Welcome! In this video, we explore ${prompt.slice(0, 40)}. Let's look at the key highlights.`,
        visualPrompt: "Modern high-tech architectural backdrop, volumetric cinematic lighting",
        suggestedImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
        cameraEffect: "zoom-in",
        transition: "fade",
      },
      {
        sceneNumber: 2,
        duration: 8,
        script: "Notice the seamless motion transitions, high-contrast aesthetic, and dynamic presenter pacing.",
        visualPrompt: "Open-concept modern interior, ultra-clear 8k resolution",
        suggestedImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
        cameraEffect: "pan-right",
        transition: "slide-left",
      },
      {
        sceneNumber: 3,
        duration: 8,
        script: "Thank you for watching. Create your own videos with Vilo AI today.",
        visualPrompt: "Sunset ocean balcony view, luxury aesthetic",
        suggestedImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
        cameraEffect: "zoom-out",
        transition: "fade",
      },
    ],
  };
});
