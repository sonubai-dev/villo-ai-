/**
 * Generation Observability & Telemetry Tracker for Vilo AI
 * Tracks full generation lifecycle events, provider latencies,
 * unit economics (costs per stage), and failure metrics.
 */

import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

export type TelemetryEventType =
  | "generation_started"
  | "voice_completed"
  | "avatar_completed"
  | "lip_sync_completed"
  | "render_started"
  | "render_completed"
  | "generation_failed"
  | "video_exported";

export interface GenerationMetricEvent {
  id: string;
  jobId: string;
  userId: string;
  projectId: string;
  eventType: TelemetryEventType;
  stageName?: string;
  durationMs?: number;
  providerName?: string;
  estimatedCostUsd?: number;
  creditsCost?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export class GenerationTracker {
  private static instance: GenerationTracker;
  private inMemoryEvents: GenerationMetricEvent[] = [];
  private jobStartTimes = new Map<string, number>();
  private stageStartTimes = new Map<string, number>();

  public static getInstance(): GenerationTracker {
    if (!GenerationTracker.instance) {
      GenerationTracker.instance = new GenerationTracker();
    }
    return GenerationTracker.instance;
  }

  /**
   * Start tracking a new generation job.
   */
  public trackJobStart(jobId: string, userId: string, projectId: string, creditsCost: number): GenerationMetricEvent {
    const now = Date.now();
    this.jobStartTimes.set(jobId, now);

    return this.recordEvent({
      jobId,
      userId,
      projectId,
      eventType: "generation_started",
      stageName: "queued",
      creditsCost,
      estimatedCostUsd: 0.02, // Base orchestrator cost
      metadata: { initiatedAt: new Date().toISOString() },
    });
  }

  /**
   * Mark the start of a specific pipeline stage to record provider latency.
   */
  public startStage(jobId: string, stageName: string): void {
    this.stageStartTimes.set(`${jobId}:${stageName}`, Date.now());
  }

  /**
   * Mark completion of a stage and compute latency.
   */
  public trackStageComplete(
    jobId: string,
    userId: string,
    projectId: string,
    eventType: TelemetryEventType,
    stageName: string,
    providerName: string,
    estimatedCostUsd: number = 0.01
  ): GenerationMetricEvent {
    const key = `${jobId}:${stageName}`;
    const start = this.stageStartTimes.get(key) || Date.now();
    const durationMs = Date.now() - start;
    this.stageStartTimes.delete(key);

    return this.recordEvent({
      jobId,
      userId,
      projectId,
      eventType,
      stageName,
      providerName,
      durationMs,
      estimatedCostUsd,
    });
  }

  /**
   * Record pipeline failure event.
   */
  public trackJobFailure(
    jobId: string,
    userId: string,
    projectId: string,
    error: string,
    failedStage?: string
  ): GenerationMetricEvent {
    const start = this.jobStartTimes.get(jobId) || Date.now();
    const totalDurationMs = Date.now() - start;

    return this.recordEvent({
      jobId,
      userId,
      projectId,
      eventType: "generation_failed",
      stageName: failedStage || "pipeline",
      durationMs: totalDurationMs,
      metadata: { error },
    });
  }

  /**
   * Record successful video generation completion.
   */
  public trackJobComplete(
    jobId: string,
    userId: string,
    projectId: string,
    videoUrl: string,
    durationSec: number
  ): GenerationMetricEvent {
    const start = this.jobStartTimes.get(jobId) || Date.now();
    const totalDurationMs = Date.now() - start;
    this.jobStartTimes.delete(jobId);

    return this.recordEvent({
      jobId,
      userId,
      projectId,
      eventType: "render_completed",
      stageName: "completed",
      durationMs: totalDurationMs,
      estimatedCostUsd: 0.08, // Total generation compute unit cost
      metadata: { videoUrl, durationSec },
    });
  }

  /**
   * Record export event when user downloads or exports.
   */
  public trackVideoExported(
    jobId: string,
    userId: string,
    projectId: string,
    format: string,
    resolution: string
  ): GenerationMetricEvent {
    return this.recordEvent({
      jobId,
      userId,
      projectId,
      eventType: "video_exported",
      metadata: { format, resolution },
    });
  }

  /**
   * Internal recorder that saves to memory and Firestore if available.
   */
  private recordEvent(
    params: Omit<GenerationMetricEvent, "id" | "timestamp">
  ): GenerationMetricEvent {
    const event: GenerationMetricEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...params,
    };

    this.inMemoryEvents.push(event);

    // Keep memory cache bounded
    if (this.inMemoryEvents.length > 500) {
      this.inMemoryEvents.splice(0, 100);
    }

    // Persist to Firestore asynchronously (fire-and-forget)
    if (db && isFirebaseConfigured()) {
      const ref = doc(db, "analyticsEvents", event.id);
      setDoc(ref, event).catch((err) => {
        // Non-blocking telemetry warning
        console.warn("[GenerationTracker] Firestore record warning:", err.message);
      });
    }

    return event;
  }

  /**
   * Query in-memory events for a specific job (useful for debugging/tests).
   */
  public getEventsForJob(jobId: string): GenerationMetricEvent[] {
    return this.inMemoryEvents.filter((e) => e.jobId === jobId);
  }
}

export const generationTracker = GenerationTracker.getInstance();
