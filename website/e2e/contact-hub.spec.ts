import { expect, test } from "playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(90_000);

for (const width of [320, 390, 662, 820, 1024, 1440]) {
  test(`contact hub gestures and clearance at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 });
    await page.emulateMedia({ reducedMotion: width === 662 ? "reduce" : "no-preference" });
    const errors: string[] = [];
    const posts: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => { if (request.method() === "POST" && new URL(request.url()).origin === new URL(page.url()).origin) posts.push(request.url()); });
    await page.goto("/services", { waitUntil: "domcontentloaded" });
    const hub = page.locator("[data-contact-hub]");
    const trigger = hub.getByRole("button", { name: "Let’s talk" });
    const panel = hub.getByRole("region", { name: "How can we help?" });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    const bounds = await panel.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    const buttonBounds = await trigger.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThan(buttonBounds!.y);
    if (width < 1024) {
      const dock = await page.locator("[data-bottom-navigation]").boundingBox();
      expect(buttonBounds!.y + buttonBounds!.height).toBeLessThan(dock!.y);
    }
    await trigger.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await hub.getByRole("button", { name: "Close quick contact" }).click();
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.locator("h1").click();
    await expect(panel).toBeHidden();
    // Real keyboard opening and traversal; no handler or state invocation.
    await trigger.focus();
    await trigger.press("Enter");
    await expect(panel).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(hub.getByRole("button", { name: "Close quick contact" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    // Opening existing navigation/search must dismiss this nonmodal panel.
    await trigger.click();
    await page.getByRole("button", { name: width < 1024 ? "More" : "Search", exact: false }).first().click();
    await expect(page.locator("dialog[open]")).toBeVisible();
    await expect(panel).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await trigger.click();
    // Existing fallback CTA is present without configured direct channels.
    await panel.getByRole("link", { name: "Start Your Project", exact: true }).click();
    await expect(page).toHaveURL(/\/request-quote$/);
    await expect(page.locator("[data-quote-wizard]")).toBeVisible();
    await expect(hub).toHaveCount(0);
    await page.goBack();
    await expect(page.locator("h1")).toHaveText("Software services built around your requirements");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await panel.getByRole("link", { name: "Discuss your project" }).click();
    await expect(page).toHaveURL(/\/contact#consultation$/);
    await expect(page.locator("#consultation")).toBeVisible();
    await expect(hub).toHaveCount(0);
    expect(posts).toEqual([]);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("no-JS contact fallback and restricted routes", async ({ browser, baseURL, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const fallback = await context.newPage();
    await fallback.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
    await expect(fallback.locator("[data-contact-hub]")).toHaveCount(0);
    await expect(fallback.getByRole("link", { name: "Contact", exact: true }).first()).toBeVisible();
  } finally { await context.close(); }
  for (const route of ["/contact", "/request-quote", "/login", "/account", "/privacy"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("[data-contact-hub]")).toHaveCount(0);
  }
});

test("short-height and dark-theme panel stays reachable", async ({ page }) => {
  await page.setViewportSize({ width: 662, height: 480 });
  await page.addInitScript(() => localStorage.setItem("ajs-theme", "dark"));
  await page.goto("/services", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  const hub = page.locator("[data-contact-hub]");
  await hub.getByRole("button", { name: "Let’s talk" }).click();
  const panel = hub.getByRole("region");
  await expect(panel).toBeVisible();
  expect((await panel.boundingBox())!.y).toBeGreaterThanOrEqual(0);
  await panel.getByRole("link", { name: "Discuss your project" }).click();
  await expect(page).toHaveURL(/\/contact#consultation$/);
  await page.goto("/services", { waitUntil: "domcontentloaded" });
  await page.setViewportSize({ width: 662, height: 320 });
  await expect(hub).toBeHidden();
});
