import * as Sentry from "@sentry/nextjs";
import { INQUIRY_RATE_LIMIT, INQUIRY_RATE_WINDOW } from "./config";

const MEMORY_MAX_ENTRIES = 10_000;

export interface RateLimitStore {
  /** Records one hit and returns true when the request is within the limit. */
  hit(key: string): Promise<boolean>;
}

/** Fixed-window in-memory store. Per-instance state: best-effort on serverless. */
export class MemoryRateLimitStore implements RateLimitStore {
  private entries = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxEntries = MEMORY_MAX_ENTRIES,
  ) {}

  private sweep(now: number) {
    for (const [key, entry] of this.entries) {
      if (now > entry.resetAt) this.entries.delete(key);
    }
  }

  async hit(key: string): Promise<boolean> {
    const now = Date.now();
    if (this.entries.size >= this.maxEntries) this.sweep(now);

    const entry = this.entries.get(key);
    if (!entry || now > entry.resetAt) {
      this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (entry.count >= this.limit) return false;
    entry.count++;
    return true;
  }
}

/**
 * Zero-dependency Upstash Redis REST adapter using an INCR + PEXPIRE(NX) pipeline.
 * On any transport/protocol error it fails open to a local memory store.
 */
export class UpstashRestRateLimitStore implements RateLimitStore {
  private warned = false;

  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly fallback: MemoryRateLimitStore,
  ) {}

  private warnOnce(error: unknown) {
    if (this.warned) return;
    this.warned = true;
    Sentry.captureMessage("Upstash rate limiter unavailable, failing open to memory", {
      level: "warning",
      extra: { error: String(error) },
    });
  }

  async hit(key: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl.replace(/\/+$/, "")}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
        body: JSON.stringify([
          ["INCR", key],
          ["PEXPIRE", key, String(this.windowMs), "NX"],
        ]),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const results: unknown = await res.json();
      const first = Array.isArray(results)
        ? (results[0] as { result?: unknown } | undefined)
        : undefined;
      const count = first?.result;
      if (typeof count !== "number") throw new Error("Unexpected response shape");

      return count <= this.limit;
    } catch (error) {
      this.warnOnce(error);
      return this.fallback.hit(key);
    }
  }
}

export function createInquiryRateLimiter(): RateLimitStore {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new UpstashRestRateLimitStore(
      url,
      token,
      INQUIRY_RATE_LIMIT,
      INQUIRY_RATE_WINDOW,
      new MemoryRateLimitStore(INQUIRY_RATE_LIMIT, INQUIRY_RATE_WINDOW),
    );
  }
  return new MemoryRateLimitStore(INQUIRY_RATE_LIMIT, INQUIRY_RATE_WINDOW);
}
