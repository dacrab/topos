import { beforeEach, describe, expect, it, vi } from "vitest";

const { insert, remove } = vi.hoisted(() => ({
  insert: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: (...args: unknown[]) => insert(...args),
    delete: (...args: unknown[]) => remove(...args),
  },
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { DatabaseRateLimitStore } from "@/lib/rate-limit";

const LIMIT = 3;
const WINDOW_MS = 60_000;

function returnsCount(count: number) {
  insert.mockReturnValue({
    values: () => ({
      onConflictDoUpdate: () => ({
        returning: async () => [{ count }],
      }),
    }),
  });
}

describe("DatabaseRateLimitStore", () => {
  beforeEach(() => {
    insert.mockReset();
    remove.mockReset();
  });

  it("allows up to the limit and blocks beyond it", async () => {
    const store = new DatabaseRateLimitStore(LIMIT, WINDOW_MS);

    for (let count = 1; count <= LIMIT; count++) {
      returnsCount(count);
      expect(await store.hit("inquiry:1.2.3.4")).toBe(true);
    }

    returnsCount(LIMIT + 1);
    expect(await store.hit("inquiry:1.2.3.4")).toBe(false);
  });

  it("keys requests independently", async () => {
    const store = new DatabaseRateLimitStore(LIMIT, WINDOW_MS);

    returnsCount(LIMIT + 1);
    expect(await store.hit("inquiry:1.2.3.4")).toBe(false);

    returnsCount(1);
    expect(await store.hit("inquiry:5.6.7.8")).toBe(true);
  });

  it("fails open when the database errors", async () => {
    insert.mockReturnValue({
      values: () => ({
        onConflictDoUpdate: () => ({
          returning: async () => {
            throw new Error("database unavailable");
          },
        }),
      }),
    });

    const store = new DatabaseRateLimitStore(LIMIT, WINDOW_MS);
    await expect(store.hit("inquiry:1.2.3.4")).resolves.toBe(true);
  });
});
