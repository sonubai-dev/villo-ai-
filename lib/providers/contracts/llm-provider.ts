/**
 * LLM Provider Interface for Vilo V1
 * Decouples AI script generation, script rewriting, and scene segmentation from specific LLM vendors.
 */

export interface ScriptGenerationInput {
  prompt: string;
  topic?: string;
  sourceText?: string;
  tone?: "Professional" | "Enthusiastic" | "Warm" | "Authoritative" | "Conversational" | "Calm" | "Direct";
  targetDurationSeconds?: number; // e.g. 15, 30, 60
  aspectRatio?: "16:9" | "9:16" | "1:1";
  language?: string;
}

export interface GeneratedSceneBlueprint {
  order: number;
  title: string;
  script: string;
  visualPrompt: string;
  suggestedImage?: string;
  motionPreset: "none" | "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "cinematic-push" | "cinematic-pull" | "slow-zoom";
  duration: number; // in seconds
}

export interface ScriptGenerationResult {
  title: string;
  summary: string;
  script: string;
  scenes: GeneratedSceneBlueprint[];
  targetDuration: number;
  wordCount: number;
}

export interface ILLMProvider {
  readonly name: string;
  generateScript(input: ScriptGenerationInput): Promise<ScriptGenerationResult>;
  rewriteScript(
    script: string,
    mode: "polish" | "shorten" | "expand" | "professional" | "viral" | "bullet_points"
  ): Promise<{ script: string; wordCount: number; estimatedDuration: number }>;
  segmentIntoScenes(
    script: string,
    targetDuration?: number
  ): Promise<GeneratedSceneBlueprint[]>;
}

export class MockLLMProvider implements ILLMProvider {
  readonly name = "MockLLMProvider";

  async generateScript(input: ScriptGenerationInput): Promise<ScriptGenerationResult> {
    // Simulate slight processing delay for realistic UX state
    await new Promise((r) => setTimeout(r, 600));

    const topic = input.topic || input.prompt || (input.sourceText ? input.sourceText.slice(0, 50) : "AI Presenter Video");
    const duration = input.targetDurationSeconds || 30;
    const sceneCount = Math.max(2, Math.min(6, Math.ceil(duration / 7.5)));
    const sceneDuration = Math.round(duration / sceneCount);

    const stockImages = [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
    ];

    const motionOptions: GeneratedSceneBlueprint["motionPreset"][] = [
      "cinematic-push",
      "pan-left",
      "zoom-in",
      "pan-right",
      "slow-zoom",
    ];

    const scenes: GeneratedSceneBlueprint[] = [];
    let fullScript = "";

    const scriptsByScene = [
      `Welcome! Today we are exploring ${topic}. Let's break down the essential points you need to know.`,
      `First, modern AI workflows empower creators to turn documents and ideas into studio-grade videos in minutes.`,
      `Next, with automated avatars, voice synthesis, and dynamic camera movements, your audience stays engaged from start to finish.`,
      `Finally, take action today. Get started and elevate your content production with Vilo.`,
    ];

    for (let i = 0; i < sceneCount; i++) {
      const sceneScript = scriptsByScene[i % scriptsByScene.length];
      fullScript += (fullScript ? " " : "") + sceneScript;

      scenes.push({
        order: i,
        title: `Scene ${i + 1}`,
        script: sceneScript,
        visualPrompt: `High quality professional visual representation of ${topic}, scene ${i + 1}`,
        suggestedImage: stockImages[i % stockImages.length],
        motionPreset: motionOptions[i % motionOptions.length],
        duration: sceneDuration,
      });
    }

    return {
      title: `${topic} - Overview`,
      summary: `Engaging ${duration}s overview video covering ${topic}.`,
      script: fullScript,
      scenes,
      targetDuration: duration,
      wordCount: fullScript.split(/\s+/).filter(Boolean).length,
    };
  }

  async rewriteScript(
    script: string,
    mode: "polish" | "shorten" | "expand" | "professional" | "viral" | "bullet_points"
  ): Promise<{ script: string; wordCount: number; estimatedDuration: number }> {
    await new Promise((r) => setTimeout(r, 450));
    let result = script;

    if (mode === "polish") {
      result = script
        .trim()
        .replace(/\b(um|uh|like|you know)\b/gi, "")
        .replace(/\s+/g, " ");
      if (!result.endsWith(".") && !result.endsWith("!")) result += ".";
    } else if (mode === "shorten") {
      const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      result = sentences.slice(0, Math.max(1, Math.ceil(sentences.length * 0.65))).join(". ") + ".";
    } else if (mode === "expand") {
      result = `${script} Furthermore, this streamlined approach ensures measurable results with zero technical friction.`;
    } else if (mode === "professional") {
      result = `In summary: ${script} This structured workflow provides seamless execution across all organizational channels.`;
    } else if (mode === "viral") {
      result = `Stop scrolling! ${script} Share this with someone who needs to see it!`;
    }

    const words = result.split(/\s+/).filter(Boolean).length;
    return {
      script: result,
      wordCount: words,
      estimatedDuration: Math.max(3, Math.ceil(words / 2.5)),
    };
  }

  async segmentIntoScenes(
    script: string,
    targetDuration: number = 30
  ): Promise<GeneratedSceneBlueprint[]> {
    await new Promise((r) => setTimeout(r, 400));
    const sentences = script.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    const count = Math.max(1, Math.min(6, sentences.length || 3));
    const sceneDur = Math.max(4, Math.round(targetDuration / count));

    const stockImages = [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    ];

    const motionOptions: GeneratedSceneBlueprint["motionPreset"][] = [
      "cinematic-push",
      "pan-left",
      "zoom-in",
      "pan-right",
    ];

    const scenes: GeneratedSceneBlueprint[] = [];
    const perScene = Math.ceil(sentences.length / count) || 1;

    for (let i = 0; i < count; i++) {
      const startIdx = i * perScene;
      const sceneSentences = sentences.slice(startIdx, startIdx + perScene);
      const text = sceneSentences.join(". ") + (sceneSentences.length ? "." : "");

      scenes.push({
        order: i,
        title: `Scene ${i + 1}`,
        script: text || `Scene ${i + 1} narration script.`,
        visualPrompt: `Scene ${i + 1} visual environment`,
        suggestedImage: stockImages[i % stockImages.length],
        motionPreset: motionOptions[i % motionOptions.length],
        duration: sceneDur,
      });
    }

    return scenes;
  }
}
