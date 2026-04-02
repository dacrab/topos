import { expect, type Page } from "@playwright/test";

export const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "e2e@test.topos.dev";
export const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "e2e-test-password";
export const EMPTY_STORAGE_STATE = { cookies: [], origins: [] };

export async function gotoAndExpectURL(page: Page, path: string, url: RegExp) {
  await page.goto(path);
  await expect(page).toHaveURL(url);
}

export async function clickFirstLinkAndExpectURL(page: Page, name: RegExp, url: RegExp) {
  await page.getByRole("link", { name }).first().click();
  await expect(page).toHaveURL(url);
}

export async function completeOnboardingIfNeeded(page: Page) {
  if (!page.url().includes("onboarding")) return;

  await page.getByLabel(/agency name|company name|brokerage/i).fill("E2E Test Agency");

  const slugInput = page.getByLabel(/slug/i);
  if (await slugInput.isVisible()) {
    await slugInput.fill(`e2e-${Date.now()}`);
  }

  await page.getByRole("button", { name: /continue|complete|finish/i }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
}
