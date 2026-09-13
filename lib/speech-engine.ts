/**
 * Web Speech API wrapper for realistic TTS preview in browser
 */

export class SpeechEngine {
  private static instance: SpeechEngine;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  private constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.cachedVoices = this.synth.getVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          if (this.synth) {
            this.cachedVoices = this.synth.getVoices();
          }
        };
      }
    }
  }

  public static getInstance(): SpeechEngine {
    if (!SpeechEngine.instance) {
      SpeechEngine.instance = new SpeechEngine();
    }
    return SpeechEngine.instance;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length > 0) return this.cachedVoices;
    if (!this.synth) return [];
    this.cachedVoices = this.synth.getVoices();
    return this.cachedVoices;
  }

  public speak({
    text,
    language = "en-US",
    gender = "female",
    pitch = 1.0,
    rate = 1.0,
    onStart,
    onEnd,
    onBoundary,
  }: {
    text: string;
    language?: string;
    gender?: "male" | "female";
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onBoundary?: (charIndex: number) => void;
  }): () => void {
    if (!this.synth) {
      // Fallback timer if SpeechSynthesis is unavailable
      const duration = Math.max(1500, (text.split(" ").length / 2.5) * 1000);
      onStart?.();
      const timer = setTimeout(() => {
        onEnd?.();
      }, duration);
      return () => clearTimeout(timer);
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.lang = language;

    const voices = this.getAvailableVoices();
    if (voices.length > 0) {
      // Try to find matching voice for language & gender
      const matched = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()) &&
          (gender === "female"
            ? /female|samantha|zira|karen|victoria|moira|priya|fiona/i.test(v.name)
            : /male|david|george|alex|daniel|rishi|mark/i.test(v.name))
      ) || voices.find((v) => v.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()))
        || voices[0];

      if (matched) {
        utterance.voice = matched;
      }
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    if (onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          onBoundary(event.charIndex);
        }
      };
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);

    return () => this.stop();
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}
