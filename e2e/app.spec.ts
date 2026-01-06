import { expect, test } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/real estate/i);
    await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
  });

  test("navigation to pricing section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: /pricing/i }).click();
    await expect(page).toHaveURL(/#pricing/);
  });
});

test.describe("Auth Flow", () => {
  test("sign up page loads", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByRole("heading")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("sign in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("sign up validates required fields", async ({ page }) => {
    await page.goto("/sign-up");
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute("required", "");
  });
});

test.describe("Marketing Pages", () => {
  test("features page loads", async ({ page }) => {
    await page.goto("/features");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Protected Routes", () => {
  test("dashboard redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("settings redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("listings redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/listings");
    await expect(page).toHaveURL(/sign-in/);
  });
});
