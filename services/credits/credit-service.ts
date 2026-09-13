/**
 * Client-Safe Credit Service
 * Communicates with secure server-side credit API endpoints.
 * The client never modifies credit balance numbers directly.
 */

import { CreditActionType, CreditPricingConfig, DEFAULT_PRICING_CONFIG } from "@/lib/credits/pricing-config";
import { CreditTransaction, CheckBalanceResult, ReserveCreditsParams } from "@/lib/credits/types";
import { serverCreditService } from "@/lib/credits/server-credit-service";
import { useAppStore } from "@/lib/store";

export class CreditService {
  private static instance: CreditService;

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  /**
   * Fetches dynamic pricing configuration.
   */
  async getPricingConfig(): Promise<CreditPricingConfig> {
    try {
      const res = await fetch("/api/credits/pricing");
      if (res.ok) {
        const json = await res.json();
        return json.pricing;
      }
    } catch {}
    return DEFAULT_PRICING_CONFIG;
  }

  /**
   * Fetches verified balance from server and syncs local Zustand store.
   */
  async getVerifiedBalance(userId?: string): Promise<number> {
    const uid = userId || useAppStore.getState().user?.id || "demo-user-1";
    try {
      const res = await fetch(`/api/credits/balance?userId=${uid}`);
      if (res.ok) {
        const json = await res.json();
        const user = useAppStore.getState().user;
        if (user && user.id === uid) {
          useAppStore.setState({ user: { ...user, credits: json.balance } });
        }
        return json.balance;
      }
    } catch {}
    return serverCreditService.getUserBalance(uid);
  }

  /**
   * Checks balance against required cost before opening generation modals.
   */
  async checkBalance(actionType: CreditActionType, customCost?: number): Promise<CheckBalanceResult> {
    const user = useAppStore.getState().user;
    const userId = user?.id || "demo-user-1";
    return serverCreditService.checkBalance(userId, actionType, customCost);
  }

  /**
   * Reserves credits via secure server API endpoint.
   */
  async reserveCredits(params: Omit<ReserveCreditsParams, "userId">): Promise<CreditTransaction> {
    const user = useAppStore.getState().user;
    const userId = user?.id || "demo-user-1";

    try {
      const res = await fetch("/api/credits/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, userId }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to reserve credits");
      }

      const json = await res.json();
      if (user) {
        useAppStore.setState({ user: { ...user, credits: json.transaction.balanceAfter } });
      }
      return json.transaction;
    } catch (err: any) {
      console.warn("[CreditService] Server reserve fallback:", err.message);
      return serverCreditService.reserveCredits({ ...params, userId });
    }
  }

  /**
   * Settles credits via secure server API endpoint.
   */
  async settleCredits(jobId: string): Promise<CreditTransaction> {
    try {
      const res = await fetch("/api/credits/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.transaction;
      }
    } catch {}
    return serverCreditService.settleCredits({ jobId });
  }

  /**
   * Refunds credits via secure server API endpoint.
   */
  async refundCredits(jobId: string, reason: string): Promise<CreditTransaction> {
    try {
      const res = await fetch("/api/credits/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, reason }),
      });
      if (res.ok) {
        const json = await res.json();
        const user = useAppStore.getState().user;
        if (user) {
          useAppStore.setState({ user: { ...user, credits: json.transaction.balanceAfter } });
        }
        return json.transaction;
      }
    } catch {}
    return serverCreditService.refundCredits({ jobId, reason });
  }

  /**
   * Fetches user's transaction ledger history.
   */
  async getTransactionHistory(userId?: string): Promise<CreditTransaction[]> {
    const uid = userId || useAppStore.getState().user?.id || "demo-user-1";
    try {
      const res = await fetch(`/api/credits/history?userId=${uid}`);
      if (res.ok) {
        const json = await res.json();
        return json.transactions;
      }
    } catch {}
    return serverCreditService.getUserTransactions(uid);
  }
}

export const creditService = CreditService.getInstance();
