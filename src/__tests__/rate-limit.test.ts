import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRateLimitStore, UpstashRestRateLimitStore } from "@/lib/rate-limit";

vi.mock("@sentry/nextjs", () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
}));

const URL_BASE = "https://example.upstash.io";
const TOKEN = "test-token";
const LIMIT = 3;
const WINDOW_MS = 60_000;

function upstashResponse(count: number) {
  return new Response(JSON.stringify([{ result: count }, { result: "OK" }]), { status: 200 });
}

describe("MemoryRateLimitStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to the limit and blocks beyond it", async () => {
    const store = new MemoryRateLimitStore(LIMIT, WINDOW_MS);
    expect(await store.hit("ip-1")).toBe(true);
    expect(await store.hit("ip-1")).toBe(true);
    expect(await store.hit("ip-1")).toBe(true);
    expect(await store.hit("ip-1")).toBe(false);
  });

  it("tracks keys independently", async () => {
    const store = new MemoryRateLimitStore(LIMIT, WINDOW_MS);
    for (let i = 0; i < LIMIT; i++) await store.hit("ip-1");
    expect(await store.hit("ip-1")).toBe(false);
    expect(await store.hit("ip-2")).toBe(true);
  });

  it("resets after the window elapses", async () => {
    const store = new MemoryRateLimitStore(LIMIT, WINDOW_MS);
    for (let i = 0; i < LIMIT; i++) await store.hit("ip-1");
    expect(await store.hit("ip-1")).toBe(false);
    vi.advanceTimersByTime(WINDOW_MS + 1);
    expect(await store.hit("ip-1")).toBe(true);
  });
});

describe("UpstashRestRateLimitStore", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function makeStore() {
    return new UpstashRestRateLimitStore(
      URL_BASE,
      TOKEN,
      LIMIT,
      WINDOW_MS,
      new MemoryRateLimitStore(LIMIT, WINDOW_MS),
    );
  }

  it("sends an INCR + PEXPIRE pipeline and allows within the limit", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(upstashResponse(1));
    globalThis.fetch = fetchMock;

    const store = makeStore();
    expect(await store.hit("inquiry:1.2.3.4")).toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      `${URL_BASE}/pipeline`,
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
      }),
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as string[][];
    expect(body[0]).toEqual(["INCR", "inquiry:1.2.3.4"]);
    expect(body[1]).toEqual(["PEXPIRE", "inquiry:1.2.3.4", String(WINDOW_MS), "NX"]);
  });

  it("blocks once the upstream count exceeds the limit", async () => {
    let count = 0;
    globalThis.fetch = vi.fn<typeof fetch>(async () => upstashResponse(++count));

    const store = makeStore();
    expect(await store.hit("k")).toBe(true);
    expect(await store.hit("k")).toBe(true);
    expect(await store.hit("k")).toBe(true);
    expect(await store.hit("k")).toBe(false);
  });

  it("fails open to the in-memory fallback on transport errors", async () => {
    globalThis.fetch = vi.fn<typeof fetch>(async () => {
      throw new Error("network down");
    });

    const store = makeStore();
    for (let i = 0; i < LIMIT; i++) expect(await store.hit("k")).toBe(true);
    expect(await store.hit("k")).toBe(false);
  });

  it("fails open on malformed responses", async () => {
    globalThis.fetch = vi.fn<typeof fetch>(
      async () => new Response(JSON.stringify({ weird: true }), { status: 200 }),
    );

    const store = makeStore();
    expect(await store.hit("k")).toBe(true);
  });

  it("fails open on HTTP error statuses", async () => {
    globalThis.fetch = vi.fn<typeof fetch>(
      async () => new Response("unauthorized", { status: 401 }),
    );

    const store = makeStore();
    for (let i = 0; i < LIMIT; i++) expect(await store.hit("k")).toBe(true);
    expect(await store.hit("k")).toBe(false);
  });
});
