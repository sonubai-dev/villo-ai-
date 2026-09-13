/**
 * Vilo V1 - Automatic Caption Pipeline & Synchronization
 * Transforms scene narration into timestamped word/sentence captions
 * with data-driven styling presets.
 */

export interface TimestampedCaptionSegment {
  id: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  text: string;
}

export type V1CaptionStyle = "creator" | "clean" | "bold" | "business";

export interface CaptionStylePreset {
  id: V1CaptionStyle;
  name: string;
  description: string;
  badgeClass: string;
  containerClass: string;
  textClass: string;
  highlightClass: string;
}

export const CAPTION_STYLE_PRESETS: Record<V1CaptionStyle, CaptionStylePreset> = {
  creator: {
    id: "creator",
    name: "Creator Neon",
    description: "High-retention social reel style with vibrant word popups",
    badgeClass: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    containerClass: "bg-black/80 backdrop-blur-md rounded-2xl px-4 py-2 border border-sky-500/30 shadow-2xl",
    textClass: "font-black tracking-tight text-white",
    highlightClass: "text-sky-400 scale-110 underline decoration-sky-400 underline-offset-4",
  },
  clean: {
    id: "clean",
    name: "Clean Minimal",
    description: "Subtle translucent dark pill for elegant presentations",
    badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
    containerClass: "bg-slate-950/80 backdrop-blur rounded-xl px-3 py-1.5 border border-slate-800",
    textClass: "font-medium text-slate-100",
    highlightClass: "text-white font-bold",
  },
  bold: {
    id: "bold",
    name: "Bold Impact",
    description: "All-caps high contrast punch for product advertisements",
    badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    containerClass: "bg-amber-400 text-black rounded-xl px-4 py-2 shadow-2xl font-black uppercase",
    textClass: "text-slate-950 font-black tracking-wider uppercase",
    highlightClass: "text-black bg-white/40 px-1 rounded",
  },
  business: {
    id: "business",
    name: "Corporate Subtitle",
    description: "Broadcast-standard crisp lower subtitle bar",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    containerClass: "bg-slate-900/90 rounded-lg px-4 py-1.5 border-l-4 border-emerald-400",
    textClass: "font-semibold text-slate-200 text-sm",
    highlightClass: "text-emerald-300 font-bold",
  },
};

export class CaptionPipeline {
  /**
   * Generates timestamped caption words from narration and target duration.
   */
  public static generateTimestampedCaptions(
    narration: string,
    durationSeconds: number,
    startOffset: number = 0
  ): TimestampedCaptionSegment[] {
    const words = narration.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    const duration = Math.max(1, durationSeconds);
    const wordsPerSecond = words.length / duration;

    return words.map((word, index) => {
      const start = startOffset + index / wordsPerSecond;
      const end = startOffset + (index + 1) / wordsPerSecond;
      return {
        id: `cap-${index}-${Date.now()}`,
        startTime: Math.round(start * 100) / 100,
        endTime: Math.round(end * 100) / 100,
        text: word,
      };
    });
  }

  /**
   * Finds the currently active caption segment at a given playback timestamp.
   */
  public static getActiveSegment(
    segments: TimestampedCaptionSegment[],
    currentTime: number
  ): { index: number; segment: TimestampedCaptionSegment | null } {
    const index = segments.findIndex(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );
    return {
      index,
      segment: index !== -1 ? segments[index] : null,
    };
  }
}
