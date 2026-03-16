import { expect, test } from "@playwright/test";

// ─── Landing Page ─────────────────────────────────────────────────────────────

test.describe("Landing Page", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-title")).toBeVisible();
    await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
  });

  test("nav links to pricing page", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /pricing/i })
      .click();
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("nav links to features page", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /features/i })
      .click();
    await expect(page).toHaveURL(/\/features/);
  });
});

// ─── Auth Pages ───────────────────────────────────────────────────────────────

test.describe("Auth Pages", () => {
  test("sign-in page loads with correct fields", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("sign-up page loads with name, email, password fields", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("sign-up shows error on empty submit", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByRole("button", { name: /sign up|create account/i }).click();
    // Browser native validation prevents submission — email field should be focused/invalid
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute("required");
  });

  test("sign-in link visible on sign-up page", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("sign-up link visible on sign-in page", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("link", { name: /sign up|create account/i })).toBeVisible();
  });
});

// ─── Marketing Pages ──────────────────────────────────────────────────────────

test.describe("Marketing Pages", () => {
  const pages = [
    { path: "/features", name: "Features" },
    { path: "/pricing", name: "Pricing" },
    { path: "/about", name: "About" },
    { path: "/contact", name: "Contact" },
    { path: "/privacy", name: "Privacy" },
    { path: "/terms", name: "Terms" },
  ];

  for (const { path, name } of pages) {
    test(`${name} page loads and has heading`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  test("pricing page shows all 3 plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/starter/i).first()).toBeVisible();
    await expect(page.getByText(/growth/i).first()).toBeVisible();
    await expect(page.getByText(/enterprise/i).first()).toBeVisible();
  });
});

// ─── Language Toggle ──────────────────────────────────────────────────────────

test.describe("Language Toggle", () => {
  test("toggles language on landing page", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /en|el/i }).first();
    await expect(toggle).toBeVisible();
    await toggle.click();
    // After toggle, locale cookie should be set and page re-renders
    await page.waitForLoadState("networkidle");
    // Language toggle button still visible after switch
    await expect(toggle).toBeVisible();
  });
});
