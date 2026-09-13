/**
 * Vilo V1 Script Provider Architecture
 * Decoupled provider layer supporting server-side LLM calls (Gemini/OpenAI)
 * and intelligent deterministic generation for development and offline resiliency.
 */

import {
  StructuredScript,
  StructuredScene,
  ContentGenerationRequest,
  ProgressState,
  ScriptTone,
} from "./types";

export interface IScriptProvider {
  readonly name: string;
  generateScript(
    request: ContentGenerationRequest,
    onProgress?: (progress: ProgressState) => void,
    abortSignal?: AbortSignal
  ): Promise<StructuredScript>;
  regenerateScene(
    currentScript: StructuredScript,
    sceneId: number,
    instructions?: string
  ): Promise<StructuredScene>;
  regenerateScript(
    currentScript: StructuredScript,
    options?: { tone?: ScriptTone; targetDurationSeconds?: number }
  ): Promise<StructuredScript>;
}

/**
 * Deterministic Development Script Provider
 * Produces structured, context-aware scripts with hooks, key points, CTAs, and scene breakdowns.
 */
export class DeterministicScriptProvider implements IScriptProvider {
  readonly name = "DeterministicScriptProvider";

  private stockImages = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80",
  ];

  async generateScript(
    request: ContentGenerationRequest,
    onProgress?: (progress: ProgressState) => void,
    abortSignal?: AbortSignal
  ): Promise<StructuredScript> {
    if (abortSignal?.aborted) throw new Error("Script generation cancelled.");

    onProgress?.({
      stage: "preparing",
      percent: 20,
      message: "Analyzing topic & content guidelines...",
      detail: `Configuring tone: ${request.tone || "Professional"}`,
    });

    await new Promise((r) => setTimeout(r, 250));
    if (abortSignal?.aborted) throw new Error("Script generation cancelled.");

    onProgress?.({
      stage: "generating",
      percent: 60,
      message: "Synthesizing hook, main points, and scenes...",
      detail: "Formulating narration, visual descriptions, and on-screen cues",
    });

    await new Promise((r) => setTimeout(r, 400));
    if (abortSignal?.aborted) throw new Error("Script generation cancelled.");

    // Extract core theme from request
    let title = "AI Video Showcase";
    let hook = "Are you ready to transform your content production?";
    let intro = "Welcome. Today we break down the critical insights you need to know.";
    let mainPoints: string[] = [
      "Streamlined automated workflows accelerate creative velocity.",
      "Engaging visual pacing and captions maximize viewer retention.",
      "Clear call-to-action drives immediate audience response.",
    ];
    let cta = "Get started today and scale your video publishing with Vilo.";

    if (request.mode === "pdf" && request.extractedDoc) {
      const doc = request.extractedDoc;
      title = doc.sections?.[0]?.heading || doc.fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      hook = `Did you know that ${title} contains essential strategies for your growth?`;
      intro = doc.summary || `In this summary, we examine the core takeaways from ${doc.fileName}.`;
      if (doc.sections && doc.sections.length > 0) {
        mainPoints = doc.sections.slice(0, 4).map((s) => s.heading);
      }
      cta = `Explore ${title} in depth and put these insights into practice today.`;
    } else if (request.prompt) {
      const p = request.prompt.trim();
      title = p.length > 40 ? p.slice(0, 38) + "..." : p;
      hook = `Stop scrolling! Here is what you need to know about ${title}.`;
      intro = `Let's dive into ${title} and explore the most important facts.`;
      cta = `Take action today and unlock the full potential of ${title}.`;
    } else if (request.pastedText) {
      const firstLine = request.pastedText.split("\n")[0]?.trim() || "Content Overview";
      title = firstLine.length > 40 ? firstLine.slice(0, 38) + "..." : firstLine;
      hook = `Here are the top takeaways you need to know right now.`;
      intro = request.pastedText.slice(0, 100) + "...";
      cta = `Follow for more insights and visit our website to learn more.`;
    }

    // Build modular scenes based on duration & scene count
    const targetDuration = request.targetDurationSeconds || 30;
    const sceneCount = request.sceneCount || Math.max(3, Math.min(6, Math.ceil(targetDuration / 7.5)));
    const perSceneDuration = Math.round(targetDuration / sceneCount);

    const scenes: StructuredScene[] = [];
    const motionPresets: StructuredScene["motionPreset"][] = [
      "cinematic-push",
      "pan-left",
      "zoom-in",
      "pan-right",
      "slow-zoom",
    ];

    // Scene 1: Hook & Introduction
    scenes.push({
      sceneId: 1,
      duration: perSceneDuration,
      narration: `${hook} ${intro}`,
      visualDescription: `Dynamic opening scene with high-impact visuals introducing ${title}`,
      onScreenText: title.toUpperCase(),
      transition: "fade",
      captionText: hook,
      suggestedImage: this.stockImages[0],
      motionPreset: "cinematic-push",
    });

    // Middle Scenes: Main Points
    for (let i = 1; i < sceneCount - 1; i++) {
      const point = mainPoints[(i - 1) % mainPoints.length] || `Key Benefit ${i}`;
      const sceneNarration = `Point ${i}: ${point}. Implementing this ensures consistent quality and measurable results.`;

      scenes.push({
        sceneId: i + 1,
        duration: perSceneDuration,
        narration: sceneNarration,
        visualDescription: `Clean modern presentation graphic illustrating ${point}`,
        onScreenText: point,
        transition: i % 2 === 0 ? "slide-left" : "zoom",
        captionText: `${point} - Essential Insight`,
        suggestedImage: this.stockImages[i % this.stockImages.length],
        motionPreset: motionPresets[i % motionPresets.length],
      });
    }

    // Final Scene: CTA
    if (sceneCount > 1) {
      scenes.push({
        sceneId: sceneCount,
        duration: perSceneDuration,
        narration: `In conclusion, ${cta}`,
        visualDescription: `Strong call-to-action outro screen with brand logo and next steps`,
        onScreenText: "GET STARTED TODAY",
        transition: "fade",
        captionText: cta,
        suggestedImage: this.stockImages[(sceneCount - 1) % this.stockImages.length],
        motionPreset: "slow-zoom",
      });
    }

    onProgress?.({
      stage: "finalizing",
      percent: 90,
      message: "Finalizing scene timings and word pacing...",
      detail: `Calculated total runtime: ${scenes.reduce((sum, s) => sum + s.duration, 0)}s`,
    });

    await new Promise((r) => setTimeout(r, 150));

    const totalWords = scenes
      .map((s) => s.narration)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;

    const fullScript: StructuredScript = {
      id: `script-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      topic: request.prompt || request.extractedDoc?.fileName || "Video",
      hook,
      introduction: intro,
      mainPoints,
      cta,
      scenes,
      targetDurationSeconds: targetDuration,
      totalWordCount: totalWords,
      tone: request.tone || "Professional",
      sourceType: request.mode,
      sourceFileName: request.extractedDoc?.fileName,
      createdAt: new Date().toISOString(),
    };

    onProgress?.({
      stage: "complete",
      percent: 100,
      message: "Script generated successfully",
      detail: `Created ${scenes.length} scenes (${totalWords} words)`,
    });

    return fullScript;
  }

  async regenerateScene(
    currentScript: StructuredScript,
    sceneId: number,
    instructions?: string
  ): Promise<StructuredScene> {
    await new Promise((r) => setTimeout(r, 450));
    const targetScene = currentScript.scenes.find((s) => s.sceneId === sceneId);
    const duration = targetScene?.duration || 7;
    const isFirst = sceneId === 1;
    const isLast = sceneId === currentScript.scenes.length;

    let newNarration = `Updated scene narration: ${instructions || "Highlighting the core advantages of this solution with engaging delivery."}`;
    let newOnScreen = "KEY HIGHLIGHT";

    if (isFirst) {
      newNarration = `Attention! Here is the revolutionary update you have been waiting for on ${currentScript.title}.`;
      newOnScreen = "EXCLUSIVE OVERVIEW";
    } else if (isLast) {
      newNarration = `Don't wait. Click the link below or reach out to get started with ${currentScript.title} right away!`;
      newOnScreen = "TAKE ACTION NOW";
    }

    return {
      sceneId,
      duration,
      narration: newNarration,
      visualDescription: `Refreshed scene composition matching updated instructions`,
      onScreenText: newOnScreen,
      transition: targetScene?.transition || "fade",
      captionText: newOnScreen,
      suggestedImage: this.stockImages[sceneId % this.stockImages.length],
      motionPreset: targetScene?.motionPreset || "cinematic-push",
    };
  }

  async regenerateScript(
    currentScript: StructuredScript,
    options?: { tone?: ScriptTone; targetDurationSeconds?: number }
  ): Promise<StructuredScript> {
    return this.generateScript({
      mode: currentScript.sourceType,
      prompt: currentScript.topic || currentScript.title,
      tone: options?.tone || currentScript.tone,
      targetDurationSeconds: options?.targetDurationSeconds || currentScript.targetDurationSeconds,
      sceneCount: currentScript.scenes.length,
    });
  }
}

/**
 * Server Script Provider
 * Executes AI generation via server-side Next.js API routes, keeping API keys private.
 */
export class ServerScriptProvider implements IScriptProvider {
  readonly name = "ServerScriptProvider";
  private fallback = new DeterministicScriptProvider();

  async generateScript(
    request: ContentGenerationRequest,
    onProgress?: (progress: ProgressState) => void,
    abortSignal?: AbortSignal
  ): Promise<StructuredScript> {
    onProgress?.({
      stage: "preparing",
      percent: 20,
      message: "Sending request to Vilo Content Generation Engine...",
    });

    try {
      const payload = {
        mode: request.mode,
        prompt: request.prompt,
        pastedText: request.pastedText,
        extractedDoc: request.extractedDoc,
        tone: request.tone || "Professional",
        targetDurationSeconds: request.targetDurationSeconds || 30,
        sceneCount: request.sceneCount,
      };

      onProgress?.({
        stage: "generating",
        percent: 60,
        message: "AI synthesizing structured narration & scenes...",
      });

      const res = await fetch("/api/ai/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortSignal,
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        onProgress?.({
          stage: "complete",
          percent: 100,
          message: "Script generated successfully",
        });
        return json.data;
      }
      throw new Error(json.error || "Generation returned invalid payload");
    } catch (err: any) {
      console.warn("[ServerScriptProvider] API route unavailable or failed; using deterministic engine:", err.message);
      return this.fallback.generateScript(request, onProgress, abortSignal);
    }
  }

  async regenerateScene(
    currentScript: StructuredScript,
    sceneId: number,
    instructions?: string
  ): Promise<StructuredScene> {
    try {
      const res = await fetch("/api/ai/script/regenerate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentScript, sceneId, instructions }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn("[ServerScriptProvider] Scene regen API route fallback:", err);
    }
    return this.fallback.regenerateScene(currentScript, sceneId, instructions);
  }

  async regenerateScript(
    currentScript: StructuredScript,
    options?: { tone?: ScriptTone; targetDurationSeconds?: number }
  ): Promise<StructuredScript> {
    return this.generateScript({
      mode: currentScript.sourceType,
      prompt: currentScript.topic || currentScript.title,
      tone: options?.tone || currentScript.tone,
      targetDurationSeconds: options?.targetDurationSeconds || currentScript.targetDurationSeconds,
      sceneCount: currentScript.scenes.length,
    });
  }
}

export const scriptProvider: IScriptProvider = new ServerScriptProvider();
