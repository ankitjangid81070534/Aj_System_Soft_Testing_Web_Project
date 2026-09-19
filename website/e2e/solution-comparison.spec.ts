import { expect, test } from "playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(90_000);

const comparisons = ["website-web-app", "saas-internal-tool", "mobile-responsive-web", "erp-crm", "custom-off-the-shelf"];

for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  test(`industry to comparison journey at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: width === 662 ? "reduce" : "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const industries = page.locator('[data-home-section="industries"]');
    await expect(industries.locator("h3")).toHaveCount(8);
    await industries.getByRole("link", { name: "Compare solution approaches", exact: true }).click();
    await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
    await expect(page).toHaveURL(/\/services#solution-comparison$/);
    await expect(page.locator("#solution-comparison")).toBeInViewport();
    for (const id of comparisons) {
      const choice = page.locator(`[data-solution-comparison="${id}"]`);
      await choice.locator("summary").click();
      await expect(choice).toHaveAttribute("open", "");
      await expect(page.locator("[data-solution-comparison][open]")).toHaveCount(1);
      await expect(choice.getByRole("heading").first()).toBeVisible();
      await expect(choice.getByRole("heading").last()).toBeVisible();
      expect((await choice.locator("summary").boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const website = page.locator('[data-solution-comparison="website-web-app"]');
    await website.locator("summary").click();
    await website.getByRole("link", { name: "Website Development", exact: true }).click();
    await expect(page.locator("main h1")).toHaveText("Website Development");
    await page.goBack();
    await expect(page.locator("#solution-comparison-heading")).toHaveText("Which solution fits your workflow?");
    await page.locator("#solution-comparison").getByRole("link", { name: "Discuss your workflow", exact: true }).click();
    await expect(page).toHaveURL(/\/request-quote$/);
    await expect(page.locator("main form")).toBeVisible();
    await page.goBack();
    await page.getByRole("link", { name: "Compare solution approaches", exact: true }).click();
    await expect(page.locator("#solution-comparison")).toBeInViewport();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await industries.getByRole("link", { name: "Find a relevant service", exact: true }).click();
    await expect(page).toHaveURL(/\/services#service-matcher$/);
    await expect(page.locator("#service-matcher")).toBeInViewport();
  });
}

for (const width of [390, 1440]) {
  test(`comparison works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
      const choice = page.locator('[data-solution-comparison="erp-crm"]');
      await choice.locator("summary").click();
      await expect(choice).toHaveAttribute("open", "");
      await choice.getByRole("link", { name: "ERP & Business Software", exact: true }).click();
      await expect(page.locator("main h1")).toHaveText("ERP & Business Software");
    } finally {
      await context.close();
    }
  });
}

test("keyboard opens, follows and collapses comparison", async ({ page }) => {
  await page.goto("/services", { waitUntil: "domcontentloaded" });
  const choice = page.locator('[data-solution-comparison="saas-internal-tool"]');
  const summary = choice.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(choice).toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  await expect(choice.getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main h1")).toHaveText("SaaS Development");
  await page.goBack();
  if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  await summary.focus();
  await page.keyboard.press("Space");
  await expect(choice).not.toHaveAttribute("open", "");
});
