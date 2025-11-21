import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// Avoid throwing at import time when DATABASE_URL is missing (e.g., during local build)
export const db: NeonHttpDatabase<typeof schema> = (() => {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const sql = neon(url);
    return drizzle(sql, { schema }) as NeonHttpDatabase<typeof schema>;
  } catch (err) {
    // Provide a proxy that throws on usage; callers typically wrap DB access in try/catch
    return new Proxy({} as object, {
      get() {
        throw err;
      },
    }) as unknown as NeonHttpDatabase<typeof schema>;
  }
})();
