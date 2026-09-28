import { test, expect } from "@playwright/test";

// Smoke test for task 0.2: the app boots and renders the root page.
// Real user journeys (register → book → review) come in roadmap task 5.4.

test("home page loads and shows the product heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /docappoint/i })).toBeVisible();
});
