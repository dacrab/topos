import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 30000,
    // One fork at a time: parallel workers exceed this machine's disk-write
    // quota (errno -122 / EDQUOT) during transform caching. Serial execution
    // costs ~5s total and keeps `bun run test` green for every contributor.
    fileParallelism: false,
  },
  resolve: { alias: { "@": `${import.meta.dirname}/src` } },
});
