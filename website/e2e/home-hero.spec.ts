import { expect, test } from "playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(45_000);

for (const [width, height] of [[320, 568], [390, 844], [662, 580], [919, 499], [1024, 768], [1440, 900]]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`hero remains readable and routes correctly at ${width} / ${reducedMotion}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      const hero = page.locator("[data-home-hero]");
      await expect(hero.getByRole("heading", { level: 1 })).toHaveAccessibleName("Software built around your requirements.");
      await expect(page.locator("[data-hero-copy]")).toHaveCSS("animation-name", "none");
      await expect(hero.locator("h1")).toHaveCSS("opacity", "1");
      const primary = hero.getByRole("link", { name: "Start Your Project", exact: true });
      await expect(primary).toHaveAccessibleDescription("Tell us your goals, platforms and key features.");
      await expect(hero.locator("[data-hero-entrance]")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 919) {
        const cta = await primary.boundingBox();
        const dock = await page.locator("[data-bottom-navigation]").boundingBox();
        expect(cta!.y + cta!.height + 12).toBeLessThan(dock!.y);
      }
      if (width >= 1024) {
        const copy = await page.locator("[data-hero-copy]").boundingBox();
        const artwork = await hero.locator(':scope > [aria-hidden="true"]').boundingBox();
        expect(artwork!.y).toBeGreaterThan(copy!.y + copy!.height + 24);
      }
      await primary.click();
      await expect(page).toHaveURL(/\/request-quote$/);
      await expect(page.locator("main form")).toBeVisible();
      await page.goBack();
      await hero.getByRole("link", { name: "Explore Projects", exact: true }).click();
      await expect(page).toHaveURL(/\/projects$/);
      await expect(page.locator("main h1")).toBeVisible();
      await page.goBack();
      await hero.getByRole("link", { name: "Explore what we build", exact: true }).click();
      await expect(page).toHaveURL(/\/#home-services$/);
      await expect(page.locator("#home-services")).toBeInViewport();
    });
  }
}

test("server-rendered hero works without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 919, height: 499 } });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!, { waitUntil: "domcontentloaded" });
    const hero = page.locator("[data-home-hero]");
    await expect(hero.locator("h1")).toBeVisible();
    await expect(page.locator("[data-hero-copy]")).toHaveCSS("animation-name", "none");
    await hero.getByRole("link", { name: "Start Your Project", exact: true }).click();
    await expect(page).toHaveURL(/\/request-quote$/);
    await expect(page.locator("main form")).toBeVisible();
  } finally { await context.close(); }
});
