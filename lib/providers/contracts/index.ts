/**
 * Vilo V1 Provider Registry
 * Central registry for swappable AI and Media Provider interfaces.
 */

import { ILLMProvider, MockLLMProvider } from "./llm-provider";
import { IPDFParser, ClientPDFParser } from "./pdf-parser";
import { IAvatarProvider, MockAvatarProvider } from "./avatar-provider";
import { ITTSProvider, MockTTSProvider } from "./tts-provider";
import { ICaptionProvider, DeterministicCaptionProvider } from "./caption-provider";
import { IVideoRenderer, MockVideoRenderer } from "./video-renderer";

export class V1ProviderRegistry {
  public static llmProvider: ILLMProvider = new MockLLMProvider();
  public static pdfParser: IPDFParser = new ClientPDFParser();
  public static avatarProvider: IAvatarProvider = new MockAvatarProvider();
  public static ttsProvider: ITTSProvider = new MockTTSProvider();
  public static captionProvider: ICaptionProvider = new DeterministicCaptionProvider();
  public static videoRenderer: IVideoRenderer = new MockVideoRenderer();

  public static setLLMProvider(p: ILLMProvider) { this.llmProvider = p; }
  public static setPDFParser(p: IPDFParser) { this.pdfParser = p; }
  public static setAvatarProvider(p: IAvatarProvider) { this.avatarProvider = p; }
  public static setTTSProvider(p: ITTSProvider) { this.ttsProvider = p; }
  public static setCaptionProvider(p: ICaptionProvider) { this.captionProvider = p; }
  public static setVideoRenderer(p: IVideoRenderer) { this.videoRenderer = p; }
}

export * from "./llm-provider";
export * from "./pdf-parser";
export * from "./avatar-provider";
export * from "./tts-provider";
export * from "./caption-provider";
export * from "./video-renderer";
