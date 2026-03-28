import { test, expect } from "@playwright/test";
import config from "../venture.config.json";

/**
 * Product-specific E2E tests — auto-generated from venture.config.json.
 * Tests every dashboard page listed in navItems to ensure it renders,
 * has content, and is functional. Generated BEFORE code, run AFTER.
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

// Extract feature pages from config (exclude Dashboard and Settings which are template)
const featurePages = (config as any).dashboard?.navItems?.filter(
  (nav: any) => !["Dashboard", "Settings"].includes(nav.label) && nav.href?.startsWith("/dashboard/")
) || [];

// Test 1: Every feature page renders (no 404, no error)
for (const nav of featurePages) {
  test(`dashboard/${nav.label} page renders`, async ({ page }) => {
    await page.goto(nav.href, { waitUntil: "networkidle" });

    // Should NOT be a 404
    const visibleText = await page.locator("body").innerText();
    expect(visibleText).not.toContain("404");
    expect(visibleText).not.toContain("This page could not be found");
    expect(visibleText).not.toContain("Application error");

    // Page should have substantial content (not blank)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(100);

    // Should have a heading related to the feature
    const headings = await page.locator("h1, h2").allTextContents();
    const hasRelevantHeading = headings.some(h =>
      h.toLowerCase().includes(nav.label.toLowerCase()) ||
      h.toLowerCase().includes(nav.label.toLowerCase().replace(/s$/, ""))
    );
    expect(hasRelevantHeading).toBe(true);

    // Screenshot for review
    await page.screenshot({
      path: `e2e/screenshots/dashboard-${nav.label.toLowerCase().replace(/\s+/g, "-")}.png`,
      fullPage: true,
    });
  });
}

// Test 2: Dashboard sidebar has all nav links
test("dashboard sidebar contains all feature links", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "networkidle" });

  for (const nav of featurePages) {
    const link = page.locator(`a[href="${nav.href}"]`);
    await expect(link).toBeVisible();
  }
});

// Test 3: Each feature page has interactive elements
for (const nav of featurePages) {
  test(`dashboard/${nav.label} has interactive elements`, async ({ page }) => {
    await page.goto(nav.href, { waitUntil: "networkidle" });

    // Should have at least one of: button, table, form, input
    const hasButton = await page.locator("button").count();
    const hasTable = await page.locator("table").count();
    const hasInput = await page.locator("input").count();
    const hasCard = await page.locator("[class*='card'], [class*='Card']").count();

    expect(hasButton + hasTable + hasInput + hasCard).toBeGreaterThan(0);
  });
}

// Test 4: Landing page has correct product name and pricing
test("landing page shows correct product info", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const body = await page.locator("body").innerText();

  // Product name should appear
  expect(body).toContain((config as any).name || "");

  // At least one pricing tier should be visible
  const pricing = (config as any).landing?.pricing || [];
  if (pricing.length > 0) {
    const hasPricing = pricing.some((tier: any) =>
      body.includes(tier.plan) || body.includes(tier.price)
    );
    expect(hasPricing).toBe(true);
  }
});
