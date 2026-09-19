import { expect, test, type Page } from "playwright/test";

// Public UI only: no login, writes, credentials or third-party stubbing.
test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(45_000);

async function ready(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  // Observe hydration rather than treating a streamed heading as menu readiness.
  await page.mouse.wheel(0, 160);
  await expect(page.locator("[data-bottom-navigation]")).toHaveAttribute("data-scrolled", "true");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator("[data-bottom-navigation]")).not.toHaveAttribute("data-scrolled", "true");
}

for (const width of [320, 390, 768, 919]) {
  test(`brand and project CTA fit and navigate at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await ready(page);
    const header = page.locator("[data-brand-header]");
    const brand = header.getByRole("link", { name: "AJ System Soft Technology — home" });
    const cta = header.getByRole("link", { name: "Start Project", exact: true });
    await expect(brand).toHaveText(/AJ System Soft Technology/);
    const layout = await header.evaluate(element => {
      const [brand, cta] = Array.from(element.querySelectorAll("a"));
      const a = brand.getBoundingClientRect(), b = cta.getBoundingClientRect();
      const fullName = brand.children[1] as HTMLElement;
      return { brandVisible: getComputedStyle(fullName).display !== "none", tap: b.height >= 44, fits: a.right <= b.left && b.right <= innerWidth, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(layout).toEqual({ brandVisible: true, tap: true, fits: true, overflow: false });
    await cta.click();
    await expect(page).toHaveURL(/\/request-quote$/);
    await expect(page.locator("main form")).toBeVisible();
    await page.locator("[data-brand-header]").getByRole("link", { name: "AJ System Soft Technology — home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
}

test("breakpoint changes close menus and restore visible keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 919, height: 900 });
  await ready(page);
  const more = page.getByRole("button", { name: "More navigation options", exact: true });
  const search = page.getByRole("button", { name: "Search navigation", exact: true });
  await more.click();
  await expect(page.locator("#more-navigation")).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(page.locator("#more-navigation")).not.toBeVisible();
  await expect(search).toBeFocused();
  await search.click();
  await page.getByRole("searchbox", { name: "Search pages" }).fill("privacy");
  await page.setViewportSize({ width: 919, height: 900 });
  await expect(page.locator("#more-navigation")).not.toBeVisible();
  await expect(more).toBeFocused();
  await more.click();
  await page.getByRole("button", { name: "Close navigation menu", exact: true }).click();
  await expect(more).toBeFocused();
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`desktop links stay visible and clickable with ${reducedMotion} motion`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await ready(page);
    const services = page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Services", exact: true });
    await expect(services).toHaveCSS("opacity", "1");
    await expect(services).toHaveCSS("animation-name", "none");
    await services.click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(services).toHaveAttribute("aria-current", "page");
    await page.getByRole("button", { name: "Client Login", exact: true }).click();
    await expect(page.locator("#portal-login-dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close client login", exact: true }).click();
    await expect(page.locator("#portal-login-dialog")).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Client Login", exact: true })).toBeFocused();
  });
}
