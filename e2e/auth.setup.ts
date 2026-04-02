import path from "node:path";
import { expect, test as setup } from "@playwright/test";
import { completeOnboardingIfNeeded, TEST_EMAIL, TEST_PASSWORD } from "./helpers";

const AUTH_FILE = path.join(import.meta.dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect to dashboard or onboarding
  await expect(page).toHaveURL(/dashboard|onboarding/, { timeout: 10000 });

  await completeOnboardingIfNeeded(page);

  await page.context().storageState({ path: AUTH_FILE });
});
