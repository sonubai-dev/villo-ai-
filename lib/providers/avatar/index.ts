/**
 * Avatar Provider Factory and Exports
 */

export * from "./types";
export * from "./avatar-cache";
export * from "./mock-avatar-provider";
export * from "./production-avatar-provider";

import { IAvatarProvider } from "./types";
import { MockAvatarProvider } from "./mock-avatar-provider";
import { ProductionAvatarProvider } from "./production-avatar-provider";

export function getAvatarProvider(): IAvatarProvider {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_PROVIDERS === "true";
  const apiKey = process.env.AVATAR_PROVIDER_API_KEY || process.env.HEYGEN_API_KEY;

  if (!useMock && apiKey) {
    return new ProductionAvatarProvider(apiKey);
  }

  return new MockAvatarProvider();
}

export const serverAvatarProvider = getAvatarProvider();
