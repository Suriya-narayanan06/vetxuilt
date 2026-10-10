import { test, expect } from "@playwright/test";

/** Runtime-focused code agent. Static checks run separately via npm run lint/typecheck/build. */
test.describe("Code/runtime agent", () => {
  test("homepage renders without uncaught browser exceptions", async ({ page }) => {
    const exceptions: string[] = [];
    page.on("pageerror", (error) => exceptions.push(error.message));

    const response = await page.goto("/");
    expect(response, "homepage should return a response").not.toBeNull();
    expect(response!.status()).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading", { name: /good ideas deserve a team/i })).toBeVisible();
    expect(exceptions, "uncaught browser exceptions").toEqual([]);
  });

  test("important static assets and styles load", async ({ page }) => {
    const failedLocalRequests: string[] = [];
    page.on("requestfailed", (request) => {
      if (new URL(request.url()).origin === "http://127.0.0.1:3000") {
        failedLocalRequests.push(`${request.method()} ${request.url()}`);
      }
    });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    expect(failedLocalRequests).toEqual([]);
  });
});
