import { test, expect } from "@playwright/test";

test.describe("Marketplace workflow agent", () => {
  test("signup and login screens expose accessible form controls", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("form").first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();

    await page.goto("/login");
    await expect(page.locator("form").first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("project browse page exposes posting and developer entry points", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("link", { name: /post a project/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /join as a developer/i })).toBeVisible();
  });

  test("post-project form is present and submit action is labelled", async ({ page }) => {
    await page.goto("/post-project");
    await expect(page.locator("form").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /publish project/i })).toBeVisible();
  });

  test("unfinished product features are not falsely treated as complete", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(page.getByText(/payments in this starter project are not processed automatically/i)).toBeVisible();
    await page.goto("/verification");
    await expect(page.getByText(/does not accept document bytes through this form/i)).toBeVisible();
  });
});
