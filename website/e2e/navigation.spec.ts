import { expect, test } from "playwright/test";

// Uses an already-running source or isolated-production server; never provisions data.
test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(20_000);

for (const width of [1024, 1440]) {
  test(`first Escape closes populated navigation search at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const trigger = page.getByRole("button", { name: "Search navigation", exact: true });
    await trigger.click();
    const input = page.getByRole("searchbox", { name: "Search pages" });
    await input.fill("privacy");
    await expect(page.locator('#more-navigation a[href="/privacy"]')).toBeVisible();
    await input.press("Escape");
    await expect(page.locator("#more-navigation")).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(input).toHaveValue("");
    await input.press("Escape");
    await expect(page.locator("#more-navigation")).not.toBeVisible();
  });
}

test("mobile More still navigates to Privacy and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "More navigation options", exact: true }).click();
  await page.locator('#more-navigation a[href="/privacy"]').click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { name: "Privacy Policy", exact: true })).toBeVisible();
  await expect(page.locator("#more-navigation")).not.toBeVisible();
});
