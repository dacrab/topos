import { expect, test } from "@playwright/test";
import { gotoAndExpectURL } from "./helpers";

test.describe("Landing Page", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-title")).toBeVisible();
    await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
  });

  test("nav links to pricing page", async ({ page }) => {
    await gotoAndExpectURL(page, "/", /\/$/);
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /pricing/i })
      .click();
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("nav links to features page", async ({ page }) => {
    await gotoAndExpectURL(page, "/", /\/$/);
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /features/i })
      .click();
    await expect(page).toHaveURL(/\/features/);
  });
});

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
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute("required");
  });
});

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
