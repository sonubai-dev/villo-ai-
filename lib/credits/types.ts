/**
 * Credit System Types & Immutable Transaction Record Models
 */

import { CreditActionType } from "./pricing-config";

export type TransactionType = "grant" | "reserve" | "consume" | "refund" | "purchase";
export type TransactionStatus = "pending" | "settled" | "refunded";

export interface CreditTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  actionType: CreditActionType;
  amount: number; // Positive for additions, negative for reservations/consumptions
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  jobId?: string;
  idempotencyKey: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  settledAt?: string;
  refundedAt?: string;
}

export interface CheckBalanceResult {
  allowed: boolean;
  currentBalance: number;
  requiredCost: number;
  remainingAfter: number;
}

export interface ReserveCreditsParams {
  userId: string;
  actionType: CreditActionType;
  jobId?: string;
  idempotencyKey: string;
  customCost?: number;
  reason?: string;
}

export interface SettleCreditsParams {
  transactionId?: string;
  jobId?: string;
  userId?: string;
}

export interface RefundCreditsParams {
  transactionId?: string;
  jobId?: string;
  userId?: string;
  reason: string;
}

export interface GrantCreditsParams {
  userId: string;
  amount: number;
  actionType?: CreditActionType;
  reason: string;
  idempotencyKey: string;
}
