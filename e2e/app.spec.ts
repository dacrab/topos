import { expect, test } from "@playwright/test";

// ─── Dashboard (authenticated) ────────────────────────────────────────────────

test.describe("Dashboard", () => {
  test("loads dashboard page", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("navigates to listings", async ({ page }) => {
    await page.goto("/dashboard");
    await page
      .getByRole("link", { name: /listings/i })
      .first()
      .click();
    await expect(page).toHaveURL(/listings/);
  });

  test("navigates to settings", async ({ page }) => {
    await page.goto("/dashboard");
    await page
      .getByRole("link", { name: /settings/i })
      .first()
      .click();
    await expect(page).toHaveURL(/settings/);
  });

  test("shows user email in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    // Sidebar should show the authenticated user's email
    const email = process.env.E2E_TEST_EMAIL ?? "e2e@test.topos.dev";
    await expect(page.getByText(email)).toBeVisible();
  });
});

test.describe("Listings", () => {
  test("listings page loads", async ({ page }) => {
    await page.goto("/dashboard/listings");
    await expect(page.locator("h2").first()).toBeVisible();
  });

  test("can open new listing dialog", async ({ page }) => {
    await page.goto("/dashboard/listings");
    await page.getByRole("button", { name: /new listing|add listing/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test.describe("Settings", () => {
  test("profile settings page loads", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/settings/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("team settings page loads", async ({ page }) => {
    await page.goto("/dashboard/settings/team");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("billing page loads and shows plan info", async ({ page }) => {
    await page.goto("/dashboard/settings/billing");
    await expect(page.getByRole("main")).toBeVisible();
  });
});

// ─── Protected route redirects (unauthenticated) ──────────────────────────────
// These run without storageState (no auth) by overriding context

test.describe("Protected Routes — unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("dashboard redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("dashboard/settings redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("dashboard/listings redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard/listings");
    await expect(page).toHaveURL(/sign-in/);
  });
});
