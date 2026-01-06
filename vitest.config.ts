/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setupTests.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**"],
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
