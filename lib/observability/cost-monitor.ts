/**
 * Unit Economics & Cost Monitoring Telemetry Layer
 * Tracks real-time compute costs, external API spend, cache efficiency, and latency across providers.
 */

export interface OperationCostMetric {
  id: string;
  provider: string;
  operation: "ai_planning" | "voice_synthesis" | "avatar_generation" | "lip_sync" | "render_compositing";
  durationMs: number;
  creditsUsed: number;
  estimatedCostUsd: number;
  cacheHit: boolean;
  timestamp: string;
}

export interface UnitEconomicsReport {
  totalOperations: number;
  totalCostUsd: number;
  totalCreditsConsumed: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRatePercent: number;
  estimatedSavingsUsd: number;
  apiCallsSaved: number;
  costBreakdown: {
    aiPlanningCostUsd: number;
    voiceCostUsd: number;
    avatarCostUsd: number;
    lipSyncCostUsd: number;
    renderCostUsd: number;
  };
  providerUsageCount: Record<string, number>;
  averageLatencyMs: Record<string, number>;
}

export class CostMonitor {
  private static instance: CostMonitor;
  private metrics: OperationCostMetric[] = [];

  public static getInstance(): CostMonitor {
    if (!CostMonitor.instance) {
      CostMonitor.instance = new CostMonitor();
    }
    return CostMonitor.instance;
  }

  /**
   * Records a granular provider operation execution.
   */
  public recordOperation(metric: Omit<OperationCostMetric, "id" | "timestamp">): void {
    const record: OperationCostMetric = {
      id: `metric-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...metric,
    };
    this.metrics.push(record);
  }

  /**
   * Generates a comprehensive Unit Economics Analytics Report.
   */
  public generateReport(): UnitEconomicsReport {
    let totalCostUsd = 0;
    let totalCreditsConsumed = 0;
    let cacheHits = 0;
    let cacheMisses = 0;
    let estimatedSavingsUsd = 0;
    let apiCallsSaved = 0;

    let aiPlanningCostUsd = 0;
    let voiceCostUsd = 0;
    let avatarCostUsd = 0;
    let lipSyncCostUsd = 0;
    let renderCostUsd = 0;

    const providerUsageCount: Record<string, number> = {};
    const latencySums: Record<string, number> = {};
    const latencyCounts: Record<string, number> = {};

    for (const m of this.metrics) {
      if (m.cacheHit) {
        cacheHits++;
        apiCallsSaved++;
        // Benchmark external API baseline savings
        if (m.operation === "voice_synthesis") estimatedSavingsUsd += 0.006;
        if (m.operation === "avatar_generation") estimatedSavingsUsd += 0.02;
        if (m.operation === "lip_sync") estimatedSavingsUsd += 0.015;
        if (m.operation === "ai_planning") estimatedSavingsUsd += 0.002;
      } else {
        cacheMisses++;
        totalCostUsd += m.estimatedCostUsd;
        totalCreditsConsumed += m.creditsUsed;

        if (m.operation === "ai_planning") aiPlanningCostUsd += m.estimatedCostUsd;
        if (m.operation === "voice_synthesis") voiceCostUsd += m.estimatedCostUsd;
        if (m.operation === "avatar_generation") avatarCostUsd += m.estimatedCostUsd;
        if (m.operation === "lip_sync") lipSyncCostUsd += m.estimatedCostUsd;
        if (m.operation === "render_compositing") renderCostUsd += m.estimatedCostUsd;
      }

      providerUsageCount[m.provider] = (providerUsageCount[m.provider] || 0) + 1;
      latencySums[m.operation] = (latencySums[m.operation] || 0) + m.durationMs;
      latencyCounts[m.operation] = (latencyCounts[m.operation] || 0) + 1;
    }

    const averageLatencyMs: Record<string, number> = {};
    for (const op of Object.keys(latencySums)) {
      averageLatencyMs[op] = Math.round(latencySums[op] / (latencyCounts[op] || 1));
    }

    const totalOps = this.metrics.length;
    const cacheHitRatePercent = totalOps > 0 ? Math.round((cacheHits / totalOps) * 100) : 0;

    return {
      totalOperations: totalOps,
      totalCostUsd: Math.round(totalCostUsd * 1000) / 1000,
      totalCreditsConsumed,
      cacheHits,
      cacheMisses,
      cacheHitRatePercent,
      estimatedSavingsUsd: Math.round(estimatedSavingsUsd * 1000) / 1000,
      apiCallsSaved,
      costBreakdown: {
        aiPlanningCostUsd: Math.round(aiPlanningCostUsd * 1000) / 1000,
        voiceCostUsd: Math.round(voiceCostUsd * 1000) / 1000,
        avatarCostUsd: Math.round(avatarCostUsd * 1000) / 1000,
        lipSyncCostUsd: Math.round(lipSyncCostUsd * 1000) / 1000,
        renderCostUsd: Math.round(renderCostUsd * 1000) / 1000,
      },
      providerUsageCount,
      averageLatencyMs,
    };
  }

  public clear(): void {
    this.metrics = [];
  }
}

export const costMonitor = CostMonitor.getInstance();
