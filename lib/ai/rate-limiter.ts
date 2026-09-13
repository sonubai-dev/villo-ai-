/**
 * Rate Limiting, Timeout Controller, and Retry Resiliency for AI Operations
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private limits = new Map<string, RateLimitRecord>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 30, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(identifier: string): { allowed: boolean; remaining: number; resetInMs: number } {
    const now = Date.now();
    const record = this.limits.get(identifier);

    if (!record || now > record.resetAt) {
      this.limits.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetInMs: this.windowMs };
    }

    if (record.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetInMs: record.resetAt - now };
    }

    record.count++;
    return { allowed: true, remaining: this.maxRequests - record.count, resetInMs: record.resetAt - now };
  }
}

export const aiRateLimiter = new InMemoryRateLimiter(30, 60000); // 30 req / minute

/**
 * Wraps a promise in a strict timeout.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number = 15000,
  operationName: string = "AI Operation"
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[Timeout] ${operationName} exceeded time limit of ${ms}ms`));
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (err) {
    clearTimeout(timeoutId!);
    throw err;
  }
}

/**
 * Retries an asynchronous task with linear/exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    operationName?: string;
    onRetry?: (error: any, attempt: number) => void;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  const baseDelay = options.delayMs ?? 1000;
  const opName = options.operationName ?? "AI Task";

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI Resilience] ${opName} attempt ${attempt}/${maxRetries} failed:`, err.message || err);
      options.onRetry?.(err, attempt);

      if (attempt < maxRetries) {
        const delay = baseDelay * attempt;
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  throw lastError;
}
