import { test, expect } from "@playwright/test";

test.describe("Security baseline agent", () => {
  test("response includes baseline browser security headers", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBeLessThan(400);
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
  });

  test("unknown routes render a not-found page rather than a server error", async ({ page }) => {
    const response = await page.goto("/__vetxuilt_test_unknown_route__");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(404);
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin page redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
    await expect(
      page.getByRole("heading", { name: /back to building/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0);
  });

  test("payment endpoint does not claim a payment was completed without a configured provider", async ({ request }) => {
    const response = await request.post("/api/payments/create-order", {
      data: { amount: 100, currency: "INR", projectId: "playwright-test" },
    });
    const body = await response.text();
    // This starter deliberately returns a non-success response unless a real provider is implemented.
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(body.toLowerCase()).not.toContain('"status":"paid"');
  });
});
