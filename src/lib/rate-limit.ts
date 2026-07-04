const store = new Map<string, number[]>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(
  identifier: string,
  { maxRequests, windowMs }: RateLimitConfig,
): { success: boolean } {
  const now = Date.now();
  const timestamps = (store.get(identifier) ?? []).filter((t) => t > now - windowMs);

  if (timestamps.length >= maxRequests) {
    store.set(identifier, timestamps);
    return { success: false };
  }

  timestamps.push(now);
  store.set(identifier, timestamps);

  if (!sweepTimer) {
    sweepTimer = setInterval(sweepStore, SWEEP_INTERVAL);
  }

  return { success: true };
}

const SWEEP_INTERVAL = 60_000;

let sweepTimer: ReturnType<typeof setInterval> | null = null;

function sweepStore(): void {
  const now = Date.now();
  for (const [key, timestamps] of store) {
    const valid = timestamps.filter((t) => t > now - MAX_WINDOW);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      store.set(key, valid);
    }
  }

  if (store.size === 0 && sweepTimer) {
    clearInterval(sweepTimer);
    sweepTimer = null;
  }
}

const MAX_WINDOW = 86_400_000;

if (typeof globalThis !== "undefined" && "process" in globalThis) {
  process.on("SIGTERM", () => {
    if (sweepTimer) clearInterval(sweepTimer);
  });
  process.on("SIGINT", () => {
    if (sweepTimer) clearInterval(sweepTimer);
  });
}
