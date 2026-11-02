import * as Sentry from "@sentry/nextjs";
import { lt, sql } from "drizzle-orm";
import { rateLimit } from "@/db/schema";
import { INQUIRY_RATE_LIMIT, INQUIRY_RATE_WINDOW } from "./config";
import { db } from "./db";

export interface RateLimitStore {
  /** Records one hit and returns true when the request is within the limit. */
  hit(key: string): Promise<boolean>;
}

const SWEEP_EVERY = 100;

/**
 * Fixed-window store backed by Postgres, so the count is shared by every
 * serverless instance instead of resetting per process.
 *
 * The upsert is a single atomic statement: concurrent requests for the same key
 * serialize on the row and each gets the post-increment count back.
 */
export class DatabaseRateLimitStore implements RateLimitStore {
  private hits = 0;
  private warned = false;

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  async hit(key: string): Promise<boolean> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + this.windowMs);

    try {
      const [row] = await db
        .insert(rateLimit)
        .values({ key, count: 1, resetAt })
        .onConflictDoUpdate({
          target: rateLimit.key,
          set: {
            count: sql<number>`case when ${rateLimit.resetAt} <= ${now} then 1 else ${rateLimit.count} + 1 end`,
            resetAt: sql<Date>`case when ${rateLimit.resetAt} <= ${now} then ${resetAt} else ${rateLimit.resetAt} end`,
          },
        })
        .returning({ count: rateLimit.count });

      if (++this.hits % SWEEP_EVERY === 0) void this.sweep(now);

      return (row?.count ?? 1) <= this.limit;
    } catch (error) {
      this.warnOnce(error);
      // Fail open: a database hiccup must not block genuine inquiries.
      return true;
    }
  }

  private warnOnce(error: unknown) {
    if (this.warned) return;
    this.warned = true;
    Sentry.captureException(error, { extra: { scope: "rate-limit" } });
  }

  /** Best-effort cleanup of expired windows; never blocks a request. */
  private async sweep(now: Date) {
    try {
      await db.delete(rateLimit).where(lt(rateLimit.resetAt, now));
    } catch {
      // A later request will retry the sweep.
    }
  }
}

export function createInquiryRateLimiter(): RateLimitStore {
  return new DatabaseRateLimitStore(INQUIRY_RATE_LIMIT, INQUIRY_RATE_WINDOW);
}
