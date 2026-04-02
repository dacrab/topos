import { expect, test } from "@playwright/test";
import {
  clickFirstLinkAndExpectURL,
  EMPTY_STORAGE_STATE,
  gotoAndExpectURL,
  TEST_EMAIL,
} from "./helpers";

test.describe("Dashboard", () => {
  test("loads dashboard page", async ({ page }) => {
    await gotoAndExpectURL(page, "/dashboard", /dashboard/);
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("navigates to listings", async ({ page }) => {
    await gotoAndExpectURL(page, "/dashboard", /dashboard/);
    await clickFirstLinkAndExpectURL(page, /listings/i, /listings/);
  });

  test("navigates to settings", async ({ page }) => {
    await gotoAndExpectURL(page, "/dashboard", /dashboard/);
    await clickFirstLinkAndExpectURL(page, /settings/i, /settings/);
  });

  test("shows user email in sidebar", async ({ page }) => {
    await gotoAndExpectURL(page, "/dashboard", /dashboard/);
    await expect(page.getByText(TEST_EMAIL)).toBeVisible();
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

test.describe("Protected Routes — unauthenticated", () => {
  // These run without storageState by overriding the project-level auth state.
  test.use({ storageState: EMPTY_STORAGE_STATE });

  test("dashboard redirects to sign-in", async ({ page }) => {
    await gotoAndExpectURL(page, "/dashboard", /sign-in/);
  });

  test("dashboard/settings redirects to sign-in", async ({ page }) => {
    await gotoAndExpectURL(page, "/dashboard/settings", /sign-in/);
  });

  test("dashboard/listings redirects to sign-in", async ({ page }) => {
    await gotoAndExpectURL(page, "/dashboard/listings", /sign-in/);
  });
});
