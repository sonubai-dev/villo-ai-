/**
 * Lip-Sync Provider Registry & Factory
 */

export * from "./types";
export * from "./lipsync-cache";
export * from "./mock-lipsync-provider";
export * from "./remote-lipsync-provider";
export * from "./local-lipsync-provider";

import { ILipSyncProvider } from "./types";
import { MockLipSyncProvider } from "./mock-lipsync-provider";
import { RemoteLipSyncProvider } from "./remote-lipsync-provider";
import { LocalLipSyncProvider } from "./local-lipsync-provider";

export type LipSyncProviderType = "mock" | "remote" | "local";

export class LipSyncProviderFactory {
  private static customProvider: ILipSyncProvider | null = null;

  public static getProvider(type?: LipSyncProviderType): ILipSyncProvider {
    if (LipSyncProviderFactory.customProvider) {
      return LipSyncProviderFactory.customProvider;
    }

    const selected = type || (process.env.LIPSYNC_PROVIDER as LipSyncProviderType) || "mock";

    switch (selected) {
      case "local":
        return new LocalLipSyncProvider();
      case "remote":
        return new RemoteLipSyncProvider();
      case "mock":
      default:
        return new MockLipSyncProvider();
    }
  }

  public static setCustomProvider(provider: ILipSyncProvider): void {
    LipSyncProviderFactory.customProvider = provider;
  }
}

export function getLipSyncProvider(): ILipSyncProvider {
  return LipSyncProviderFactory.getProvider();
}

export const serverLipSyncProvider = getLipSyncProvider();
