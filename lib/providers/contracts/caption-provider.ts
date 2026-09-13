/**
 * Caption Provider Interface for Vilo V1
 * Formats synchronized captions and exports SRT/VTT subtitle files.
 */

import { WordTiming } from "./tts-provider";
import { CaptionSettings } from "@/lib/types";

export interface FormattedCaption {
  index: number;
  text: string;
  start: number;
  end: number;
  words: WordTiming[];
}

export interface ICaptionProvider {
  readonly name: string;
  generateCaptions(
    script: string,
    wordTimings: WordTiming[],
    mode?: "word" | "sentence"
  ): FormattedCaption[];
  exportSRT(captions: FormattedCaption[]): string;
  exportVTT(captions: FormattedCaption[]): string;
}

export class DeterministicCaptionProvider implements ICaptionProvider {
  readonly name = "DeterministicCaptionProvider";

  generateCaptions(
    script: string,
    wordTimings: WordTiming[],
    mode: "word" | "sentence" = "sentence"
  ): FormattedCaption[] {
    if (wordTimings.length === 0) {
      const words = script.trim().split(/\s+/).filter(Boolean);
      let t = 0;
      for (const w of words) {
        wordTimings.push({ word: w, start: t, end: t + 0.4 });
        t += 0.45;
      }
    }

    if (mode === "word") {
      return wordTimings.map((wt, idx) => ({
        index: idx + 1,
        text: wt.word,
        start: wt.start,
        end: wt.end,
        words: [wt],
      }));
    }

    // Sentence level grouping (3-6 words per chunk)
    const chunkSize = 5;
    const captions: FormattedCaption[] = [];
    for (let i = 0; i < wordTimings.length; i += chunkSize) {
      const chunk = wordTimings.slice(i, i + chunkSize);
      const text = chunk.map((w) => w.word).join(" ");
      captions.push({
        index: captions.length + 1,
        text,
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end,
        words: chunk,
      });
    }

    return captions;
  }

  exportSRT(captions: FormattedCaption[]): string {
    return captions
      .map((c) => {
        const start = this.formatSRTTime(c.start);
        const end = this.formatSRTTime(c.end);
        return `${c.index}\n${start} --> ${end}\n${c.text}\n`;
      })
      .join("\n");
  }

  exportVTT(captions: FormattedCaption[]): string {
    const body = captions
      .map((c) => {
        const start = this.formatVTTTime(c.start);
        const end = this.formatVTTTime(c.end);
        return `${start} --> ${end}\n${c.text}\n`;
      })
      .join("\n");
    return `WEBVTT\n\n${body}`;
  }

  private formatSRTTime(seconds: number): string {
    const pad = (n: number, z = 2) => String(Math.floor(n)).padStart(z, "0");
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
  }

  private formatVTTTime(seconds: number): string {
    const pad = (n: number, z = 2) => String(Math.floor(n)).padStart(z, "0");
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
  }
}
