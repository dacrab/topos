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
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/app/**/loading.tsx",
        "src/app/**/not-found.tsx",
        "src/app/**/error.tsx",
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/app/api/**",
        "src/components/ui/**",
        "src/i18n/**",
        "src/db/**",
      ],
      thresholds: {
        lines: 60,
        functions: 55,
        branches: 35,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
