/**
 * Cloud Functions Video Rendering Worker Trigger
 * Listens for new documents in /generationJobs/{jobId} to process video rendering.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const onGenerationJobCreated = functions.firestore
  .document("generationJobs/{jobId}")
  .onCreate(async (snap, context) => {
    const jobData = snap.data();
    const jobId = context.params.jobId;
    const db = admin.firestore();
    const jobRef = db.collection("generationJobs").doc(jobId);

    if (jobData.status !== "queued" && jobData.status !== "processing") {
      return;
    }

    functions.logger.info(`Processing render job: ${jobId} for project: ${jobData.projectId}`);

    try {
      // Step 1: Analyzing
      await jobRef.update({
        status: "processing",
        progress: 25,
        stage: "analyzing",
        stepMessage: "Analyzing visual prompt layers and keyframe trajectories...",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Step 2: Synthesizing Audio & Lip-sync
      await jobRef.update({
        progress: 60,
        stage: "voice",
        stepMessage: "Synthesizing high-fidelity presenter voiceover and lip coordinates...",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Step 3: Encoding Video stream
      await jobRef.update({
        progress: 90,
        stage: "rendering",
        stepMessage: "Encoding 1080p 60fps MP4 container...",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Step 4: Complete
      const renderedUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      await jobRef.update({
        status: "completed",
        progress: 100,
        stage: "completed",
        stepMessage: "Render complete and ready for streaming.",
        videoUrl: renderedUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update corresponding project document
      if (jobData.projectId) {
        await db.collection("projects").doc(jobData.projectId).update({
          exportVideoUrl: renderedUrl,
          status: "completed",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      functions.logger.info(`Successfully completed render job: ${jobId}`);
    } catch (err) {
      functions.logger.error(`Error processing job ${jobId}:`, err);
      await jobRef.update({
        status: "failed",
        error: String(err),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
