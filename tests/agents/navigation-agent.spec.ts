import { test, expect } from "@playwright/test";

const routes = [
  ["/", /good ideas deserve a team/i],
  ["/projects", /find your next build/i],
  ["/how-it-works", /from idea to delivery/i],
  ["/trust", /trust is part of the product/i],
  ["/login", /back to building/i],
  ["/signup", /join/i],
  ["/dashboard", /welcome back/i],
  ["/verification", /prove you're part of campus/i],
  ["/profile", /your profile, your proof/i],
  ["/messages", /keep the work in context/i],
  ["/admin", /verification control room/i],
  ["/post-project", /give your idea a brief/i],
] as const;

test.describe("Navigation agent", () => {
  for (const [route, heading] of routes) {
    test(`${route} responds and displays its expected page heading`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response, `${route} should return a response`).not.toBeNull();
      expect(response!.status(), `${route} HTTP status`).toBeLessThan(400);
      await expect(page.locator("body")).toBeVisible();
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    });
  }

  test("primary homepage links navigate to the correct destinations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /explore projects/i }).first().click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("heading", { name: /find your next build/i })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: /join vetxuilt/i }).first().click();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("internal links on public pages point to responding routes", async ({ page, request }) => {
    const publicRoutes = ["/", "/projects", "/how-it-works", "/trust", "/login", "/signup"];
    const hrefs = new Set<string>();
    for (const route of publicRoutes) {
      await page.goto(route);
      const links = await page.locator('a[href^="/"]').evaluateAll((nodes) =>
        nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href")).filter((href): href is string => Boolean(href))
      );
      links.forEach((href) => hrefs.add(href.split("#")[0]));
    }
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), `Internal link ${href} should respond`).toBeLessThan(400);
    }
  });
});
