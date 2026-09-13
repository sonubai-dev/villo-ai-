/**
 * Credit Pricing Configuration
 * Centralized dynamic pricing definitions for AI generation actions and tiers.
 * Never hard-coded directly in UI presentation components.
 */

export type CreditActionType =
  | "avatar_video"
  | "image_video"
  | "presentation_video"
  | "script_generation"
  | "image_splitter"
  | "signup_grant"
  | "plan_grant"
  | "manual_adjustment";

export interface CreditPricingConfig {
  actionCosts: Record<CreditActionType, number>;
  tierGrants: {
    free: number;
    starter: number;
    pro: number;
    enterprise: number;
  };
}

export const DEFAULT_PRICING_CONFIG: CreditPricingConfig = {
  actionCosts: {
    avatar_video: 10,
    image_video: 5,
    presentation_video: 15,
    script_generation: 2,
    image_splitter: 4,
    signup_grant: 0,
    plan_grant: 0,
    manual_adjustment: 0,
  },
  tierGrants: {
    free: 50,
    starter: 300,
    pro: 1200,
    enterprise: 5000,
  },
};

export function getCreditCost(action: CreditActionType): number {
  return DEFAULT_PRICING_CONFIG.actionCosts[action] ?? 5;
}

export function getDefaultTierGrant(tier: "free" | "starter" | "pro" | "enterprise" = "free"): number {
  return DEFAULT_PRICING_CONFIG.tierGrants[tier] ?? 50;
}
