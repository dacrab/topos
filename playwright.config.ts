import { defineConfig, devices } from "@playwright/test";

const AUTH_STORAGE_STATE = "e2e/.auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // Setup project — runs auth fixture first
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    // Desktop Chrome (authenticated)
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STORAGE_STATE,
      },
      dependencies: ["setup"],
    },
    // Mobile Chrome
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        storageState: AUTH_STORAGE_STATE,
      },
      dependencies: ["setup"],
    },
    // Public pages (no auth needed)
    {
      name: "public",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.public\.spec\.ts/,
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
