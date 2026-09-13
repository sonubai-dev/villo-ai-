"use client";

import React, { useState } from "react";
import { RenderableSceneUnit, SceneProcessingStatus } from "@/services/scene-pipeline/types";
import { sceneProvider } from "@/services/scene-pipeline/scene-provider";
import {
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SceneGeneratorPanelProps {
  scene: RenderableSceneUnit;
  onSceneUpdated: (scene: RenderableSceneUnit) => void;
  className?: string;
}

export function SceneGeneratorPanel({
  scene,
  onSceneUpdated,
  className = "",
}: SceneGeneratorPanelProps) {
  const [status, setStatus] = useState<SceneProcessingStatus>(scene.status || "completed");
  const [progressPercent, setProgressPercent] = useState<number>(scene.progressPercent || 100);
  const [statusMessage, setStatusMessage] = useState<string>(scene.statusMessage || "Scene ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(scene.error || null);

  const handleGenerate = async () => {
    setStatus("processing");
    setProgressPercent(10);
    setStatusMessage("Starting scene generation...");
    setErrorMessage(null);

    try {
      const generated = await sceneProvider.generateScene(
        {
          scene,
          idempotencyKey: `manual-${Date.now()}`,
        },
        (progress, stage) => {
          setProgressPercent(progress);
          setStatusMessage(stage);
        }
      );

      setStatus("completed");
      setProgressPercent(100);
      setStatusMessage("Scene generated successfully");
      onSceneUpdated(generated);
    } catch (err: any) {
      setStatus("failed");
      setErrorMessage(err.message || "Failed to generate scene");
      setStatusMessage("Generation failed");
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 backdrop-blur ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-sky-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scene Processing Status</h4>
        </div>

        {status === "completed" && (
          <Badge variant="glow" className="text-[10px] gap-1 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            <span>Ready</span>
          </Badge>
        )}

        {status === "processing" && (
          <Badge variant="glow" className="text-[10px] gap-1 text-sky-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing ({progressPercent}%)</span>
          </Badge>
        )}

        {status === "queued" && (
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Clock className="h-3 w-3" />
            <span>Queued</span>
          </Badge>
        )}

        {status === "failed" && (
          <Badge variant="destructive" className="text-[10px] gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        )}
      </div>

      {/* Progress Message */}
      <p className="text-xs text-slate-300">{statusMessage}</p>

      {/* Linear Progress Bar during processing */}
      {status === "processing" && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Error Message & Retry */}
      {status === "failed" && errorMessage && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300 flex items-center justify-between gap-2">
          <span>{errorMessage}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            className="h-7 px-2 text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* Manual Generate Action */}
      {status !== "processing" && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleGenerate}
          className="w-full text-xs gap-1.5 font-semibold text-slate-200 hover:text-white"
        >
          <Wand2 className="h-3.5 w-3.5 text-sky-400" />
          <span>Regenerate Scene Audio &amp; Layers</span>
        </Button>
      )}
    </div>
  );
}
