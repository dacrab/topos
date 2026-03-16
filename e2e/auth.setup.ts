import path from "node:path";
import { expect, test as setup } from "@playwright/test";

const AUTH_FILE = path.join(import.meta.dirname, ".auth/user.json");

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "e2e@test.topos.dev";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "e2e-test-password";

setup("authenticate", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect to dashboard or onboarding
  await expect(page).toHaveURL(/dashboard|onboarding/, { timeout: 10000 });

  // If landed on onboarding, complete it with test data
  if (page.url().includes("onboarding")) {
    await page.getByLabel(/agency name|company name|brokerage/i).fill("E2E Test Agency");
    const slugInput = page.getByLabel(/slug/i);
    if (await slugInput.isVisible()) {
      await slugInput.fill(`e2e-${Date.now()}`);
    }
    await page.getByRole("button", { name: /continue|complete|finish/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  }

  await page.context().storageState({ path: AUTH_FILE });
});
