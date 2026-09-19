import { expect, test } from "playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(60_000);

// Public, unconfigured preview only: no fake project seeds or authenticated writes.
for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  test(`honest project empty state and exits at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/projects", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1")).toHaveText("Projects & case studies");
    await expect(page.getByText("No public case studies yet", { exact: true })).toBeVisible();
    await expect(page.locator('main a[href^="/projects/"]')).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Project filters" })).toHaveCount(0);
    await page.getByRole("link", { name: "Browse services", exact: true }).click();
    await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
    await page.goBack();
    await expect(page.locator("main h1")).toHaveText("Projects & case studies");
    await page.locator("main").getByRole("link", { name: "Contact us", exact: true }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.locator("main form").first()).toBeVisible();
    await page.goBack();
    await expect(page.getByText("No public case studies yet", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`stale filter recovery at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects?platform=unavailable&industry=unavailable", { waitUntil: "domcontentloaded" });
    const filters = page.getByRole("navigation", { name: "Project filters" });
    await expect(filters.getByRole("status")).toHaveText("0 projects");
    const clear = filters.getByRole("link", { name: "Clear filters" });
    expect((await clear.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await clear.click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(filters).toHaveCount(0);
    await page.reload();
    await expect(page.getByText("No public case studies yet", { exact: true })).toBeVisible();
  });
}

for (const width of [390, 1440]) {
  test(`project filter escape without JavaScript at ${width}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/projects?platform=unavailable`, { waitUntil: "domcontentloaded" });
      await page.getByRole("link", { name: "Clear filters", exact: true }).click();
      await expect(page).toHaveURL(/\/projects$/);
      await page.getByRole("link", { name: "Browse services", exact: true }).click();
      await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
    } finally { await context.close(); }
  });
}

test("unavailable case study stays a real 404", async ({ request }) => {
  const response = await request.get("/projects/phase9-nonexistent-record");
  expect(response.status()).toBe(404);
});
