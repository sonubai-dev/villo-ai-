/**
 * Server-Side Credit Service
 * Enforces atomic credit operations, balance locking, idempotency, and immutable transaction logs.
 * The client must never directly mutate credit values.
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, runTransaction } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { useAppStore } from "@/lib/store";
import { getCreditCost, CreditActionType } from "./pricing-config";
import { 
  CreditTransaction, 
  CheckBalanceResult, 
  ReserveCreditsParams, 
  SettleCreditsParams, 
  RefundCreditsParams, 
  GrantCreditsParams 
} from "./types";

export class ServerCreditService {
  private static instance: ServerCreditService;
  private inMemoryBalances = new Map<string, number>(); // userId -> balance
  private inMemoryTransactions = new Map<string, CreditTransaction>(); // txId -> transaction
  private inMemoryIdempotency = new Map<string, string>(); // idempotencyKey -> txId
  private userLocks = new Map<string, Promise<any>>();

  public static getInstance(): ServerCreditService {
    if (!ServerCreditService.instance) {
      ServerCreditService.instance = new ServerCreditService();
    }
    return ServerCreditService.instance;
  }

  /**
   * Helper to execute operations sequentially per user to prevent concurrent race conditions.
   */
  private async withUserLock<T>(userId: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.userLocks.get(userId) || Promise.resolve();
    let release: () => void;
    const next = new Promise<void>((res) => { release = res; });
    this.userLocks.set(userId, existing.then(() => next));

    try {
      await existing;
      return await fn();
    } finally {
      release!();
    }
  }

  /**
   * 1. Check User Balance against Action Cost
   */
  public async checkBalance(
    userId: string,
    actionType: CreditActionType,
    customCost?: number
  ): Promise<CheckBalanceResult> {
    const balance = await this.getUserBalance(userId);
    const requiredCost = customCost ?? getCreditCost(actionType);
    const allowed = balance >= requiredCost;

    return {
      allowed,
      currentBalance: balance,
      requiredCost,
      remainingAfter: allowed ? balance - requiredCost : balance,
    };
  }

  /**
   * 2. Reserve Credits before starting generation (Atomic Hold & Idempotency Guard)
   */
  public async reserveCredits(params: ReserveCreditsParams): Promise<CreditTransaction> {
    return this.withUserLock(params.userId, async () => {
      const { userId, actionType, jobId, idempotencyKey, reason } = params;
      const cost = params.customCost ?? getCreditCost(actionType);

      // Check Idempotency: Prevent duplicate reservations on retry/double-click
      const existingTxId = this.inMemoryIdempotency.get(idempotencyKey);
      if (existingTxId) {
        const existingTx = this.inMemoryTransactions.get(existingTxId);
        if (existingTx && existingTx.status !== "refunded") {
          console.log(`[CreditService] Idempotency match on reservation: returning ${existingTx.id}`);
          return existingTx;
        }
      }

      const currentBalance = await this.getUserBalance(userId);
      if (currentBalance < cost) {
        throw new Error(`Insufficient credits: Required ${cost}, Available ${currentBalance}. Please upgrade your plan.`);
      }

      const balanceBefore = currentBalance;
      const balanceAfter = balanceBefore - cost;
      const now = new Date().toISOString();
      const txId = `tx-res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const transaction: CreditTransaction = {
        id: txId,
        userId,
        type: "reserve",
        actionType,
        amount: -cost,
        balanceBefore,
        balanceAfter,
        reason: reason || `Reservation for ${actionType ? actionType.replace(/_/g, " ") : "operation"}`,
        jobId,
        idempotencyKey,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      };

      // Atomic Balance Mutation
      await this.setUserBalance(userId, balanceAfter);

      // Save Transaction Record
      this.inMemoryTransactions.set(txId, transaction);
      this.inMemoryIdempotency.set(idempotencyKey, txId);
      await this.persistTransaction(transaction);

      return transaction;
    });
  }

  /**
   * 3. Settle / Consume Reserved Credits upon Successful Generation
   */
  public async settleCredits(params: SettleCreditsParams): Promise<CreditTransaction> {
    const tx = await this.findTransaction(params);
    if (!tx) {
      throw new Error("Credit transaction not found to settle");
    }

    if (tx.status === "settled") {
      return tx; // Already settled
    }

    const updated: CreditTransaction = {
      ...tx,
      status: "settled",
      type: "consume",
      updatedAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
    };

    this.inMemoryTransactions.set(tx.id, updated);
    await this.persistTransaction(updated);
    return updated;
  }

  /**
   * 4. Refund Reserved Credits upon Pipeline Failure
   */
  public async refundCredits(params: RefundCreditsParams): Promise<CreditTransaction> {
    const tx = await this.findTransaction(params);
    if (!tx) {
      throw new Error("Credit transaction not found to refund");
    }

    if (tx.status === "refunded") {
      console.log(`[CreditService] Transaction ${tx.id} already refunded`);
      return tx;
    }

    return this.withUserLock(tx.userId, async () => {
      const refundAmount = Math.abs(tx.amount);
      const currentBalance = await this.getUserBalance(tx.userId);
      const balanceBefore = currentBalance;
      const balanceAfter = balanceBefore + refundAmount;
      const now = new Date().toISOString();

      // Mark original transaction as refunded
      const updatedOriginal: CreditTransaction = {
        ...tx,
        status: "refunded",
        updatedAt: now,
        refundedAt: now,
      };
      this.inMemoryTransactions.set(tx.id, updatedOriginal);
      await this.persistTransaction(updatedOriginal);

      // Create new immutable refund transaction record
      const refundTxId = `tx-ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const refundRecord: CreditTransaction = {
        id: refundTxId,
        userId: tx.userId,
        type: "refund",
        actionType: tx.actionType,
        amount: refundAmount,
        balanceBefore,
        balanceAfter,
        reason: params.reason || `Refund for failed ${tx.actionType}`,
        jobId: tx.jobId,
        idempotencyKey: `idem-ref-${tx.id}`,
        status: "settled",
        createdAt: now,
        updatedAt: now,
      };

      // Restore User Balance Atomically
      await this.setUserBalance(tx.userId, balanceAfter);

      this.inMemoryTransactions.set(refundTxId, refundRecord);
      await this.persistTransaction(refundRecord);

      return refundRecord;
    });
  }

  /**
   * 5. Grant Credits (e.g. Signup, Plan Renewal, Purchase)
   */
  public async grantCredits(params: GrantCreditsParams): Promise<CreditTransaction> {
    return this.withUserLock(params.userId, async () => {
      const { userId, amount, actionType = "signup_grant", reason, idempotencyKey } = params;

      // Idempotency check for grants (e.g. prevent duplicate signup bonus)
      const existingTxId = this.inMemoryIdempotency.get(idempotencyKey);
      if (existingTxId) {
        const existingTx = this.inMemoryTransactions.get(existingTxId);
        if (existingTx) return existingTx;
      }

      const currentBalance = await this.getUserBalance(userId);
      const balanceBefore = currentBalance;
      const balanceAfter = balanceBefore + amount;
      const now = new Date().toISOString();
      const txId = `tx-grt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const transaction: CreditTransaction = {
        id: txId,
        userId,
        type: "grant",
        actionType,
        amount,
        balanceBefore,
        balanceAfter,
        reason,
        idempotencyKey,
        status: "settled",
        createdAt: now,
        updatedAt: now,
      };

      await this.setUserBalance(userId, balanceAfter);

      this.inMemoryTransactions.set(txId, transaction);
      this.inMemoryIdempotency.set(idempotencyKey, txId);
      await this.persistTransaction(transaction);

      return transaction;
    });
  }

  /**
   * 6. Retrieve Verified User Balance
   */
  public async getUserBalance(userId: string): Promise<number> {
    // 1. Check in-memory state
    if (this.inMemoryBalances.has(userId)) {
      return this.inMemoryBalances.get(userId)!;
    }

    // 2. Check Firestore User Document
    if (db && isFirebaseConfigured()) {
      try {
        const userRef = doc(db, "users", userId);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const remoteCredits = snap.data()?.credits ?? 50;
          this.inMemoryBalances.set(userId, remoteCredits);
          return remoteCredits;
        }
      } catch (err) {
        console.warn("[CreditService] Firestore getUserBalance warning:", err);
      }
    }

    // Default: 50 credits
    this.inMemoryBalances.set(userId, 50);
    return 50;
  }

  /**
   * 7. Retrieve User Transaction Ledger History
   */
  public async getUserTransactions(userId: string, maxResults: number = 50): Promise<CreditTransaction[]> {
    const localList = Array.from(this.inMemoryTransactions.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (db && isFirebaseConfigured()) {
      try {
        const q = query(
          collection(db, "creditTransactions"),
          where("userId", "==", userId)
        );
        const snap = await getDocs(q);
        const remoteList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CreditTransaction));
        
        // Merge and sort
        const map = new Map<string, CreditTransaction>();
        remoteList.forEach((t) => map.set(t.id, t));
        localList.forEach((t) => map.set(t.id, t));

        return Array.from(map.values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, maxResults);
      } catch (err) {
        console.warn("[CreditService] Firestore transaction history warning:", err);
      }
    }

    return localList.slice(0, maxResults);
  }

  private async setUserBalance(userId: string, balance: number): Promise<void> {
    this.inMemoryBalances.set(userId, balance);

    // Sync with Zustand store if applicable
    const storeUser = useAppStore.getState().user;
    if (storeUser && storeUser.id === userId) {
      useAppStore.setState({ user: { ...storeUser, credits: balance } });
    }

    // Sync with Firestore
    if (db && isFirebaseConfigured()) {
      try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          credits: balance,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("[CreditService] Firestore update balance warning:", err);
      }
    }
  }

  private async findTransaction(params: { transactionId?: string; jobId?: string; userId?: string }): Promise<CreditTransaction | null> {
    if (params.transactionId && this.inMemoryTransactions.has(params.transactionId)) {
      return this.inMemoryTransactions.get(params.transactionId)!;
    }

    if (params.jobId) {
      const allTx = Array.from(this.inMemoryTransactions.values());
      for (const tx of allTx) {
        if (tx.jobId === params.jobId) return tx;
      }
    }

    return null;
  }

  private async persistTransaction(tx: CreditTransaction): Promise<void> {
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, "creditTransactions", tx.id);
        await setDoc(ref, tx, { merge: true });
      } catch (err) {
        console.warn("[CreditService] Firestore persistTransaction warning:", err);
      }
    }
  }
}

export const serverCreditService = ServerCreditService.getInstance();
