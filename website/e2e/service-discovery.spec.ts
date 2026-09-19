import { expect, test } from "playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(90_000);

const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];

for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion });
      await page.goto("/services", { waitUntil: "domcontentloaded" });
      await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
      await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
      await expect(page).toHaveURL(/#service-matcher$/);
      await expect(page.locator("#service-matcher")).toBeInViewport();
      for (const goal of goals) {
        const choice = page.locator(`[data-service-goal="${goal}"]`);
        await choice.locator("summary").click();
        await expect(choice).toHaveAttribute("open", "");
        await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
        await expect(choice.locator("a").first()).toBeVisible();
        const summary = await choice.locator("summary").boundingBox();
        expect(summary!.height).toBeGreaterThanOrEqual(44);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
      await expect(page).toHaveURL(/\/request-quote$/);
      await expect(page.locator("main form")).toBeVisible();
      await page.goBack();
      const mobile = page.locator('[data-service-goal="mobile"]');
      await mobile.locator("summary").click();
      await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
      await expect(page).toHaveURL(/\/services\/android-app-development$/);
      await expect(page.locator("main h1")).toHaveText("Android App Development");
      await page.goBack();
      await page.getByRole("link", { name: "Browse all services", exact: true }).click();
      await expect(page).toHaveURL(/#service-catalogue$/);
      await expect(page.locator("#service-catalogue")).toBeInViewport();
      const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
      const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
      for (const href of links) {
        await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
        await expect(page.locator(href)).toBeInViewport();
      }
    });
  }
}

for (const width of [390, 1440]) {
  test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
      const choice = page.locator('[data-service-goal="website"]');
      await choice.locator("summary").click();
      await expect(choice).toHaveAttribute("open", "");
      await choice.getByRole("link", { name: "Website Development", exact: true }).click();
      await expect(page).toHaveURL(/\/services\/website-development$/);
      await expect(page.locator("main h1")).toHaveText("Website Development");
    } finally {
      await context.close();
    }
  });
}

test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  await page.goto("/services", { waitUntil: "domcontentloaded" });
  const choice = page.locator('[data-service-goal="saas"]');
  const summary = choice.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(choice).toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  await expect(choice.getByRole("link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main h1")).toHaveText("SaaS Development");
  await page.goBack();
  // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  await summary.focus();
  await page.keyboard.press("Space");
  await expect(choice).not.toHaveAttribute("open", "");
});

test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  await page.goto("/services", { waitUntil: "domcontentloaded" });
  const cards = page.locator("#service-catalogue a.card-3d");
  const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  expect(services).toHaveLength(15);
  for (const service of services) {
    await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
    await expect(page.locator("main h1")).toHaveText(service.name);
    await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
    await expect(page).toHaveURL(/\/request-quote$/);
    await expect(page.locator("main form")).toBeVisible();
    await page.goBack();
    await expect(page.locator("main h1")).toHaveText(service.name);
    await page.goBack();
    await expect(page.locator("#service-catalogue")).toBeVisible();
  }
});
