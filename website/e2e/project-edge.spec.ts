import { expect, test } from "playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(45_000);
const edge = '[data-project-edge]';

for (const width of [390, 919, 1440]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`project edge preserves click and geometry at ${width}px / ${reducedMotion}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const cta = width < 1024
        ? page.locator("[data-brand-header]").getByRole("link", { name: "Start Project", exact: true })
        : page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Start Project", exact: true });
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute("href", "/request-quote");
      await cta.hover();
      const before = await cta.boundingBox();
      const style = await cta.evaluate(element => {
        const frame = element.querySelector("[data-project-edge]")!;
        const ring = getComputedStyle(frame, "::before");
        return { background: ring.backgroundImage, mask: getComputedStyle(frame).maskComposite, pointer: ring.pointerEvents,
          animation: ring.animationName, iterations: ring.animationIterationCount,
          filter: getComputedStyle(element).filter, transform: ring.transform };
      });
      expect(style.background).toContain("conic-gradient");
      expect(style.mask.split(",").map(value => value.trim())).toEqual(["exclude", "exclude"]);
      expect(style.pointer).toBe("none");
      expect(style.filter).toBe("none");
      if (reducedMotion === "reduce") expect(style.animation).toBe("none");
      else {
        expect(style.iterations).toBe("1");
        await expect.poll(() => cta.evaluate(element => getComputedStyle(element.querySelector("[data-project-edge]")!, "::before").transform)).not.toBe(style.transform);
        await expect.poll(() => cta.evaluate(element => element.getAnimations({ subtree: true }).filter(a => a.playState === "running").length), { timeout: 6000 }).toBe(0);
      }
      const after = await cta.boundingBox();
      expect(after!.width).toBeCloseTo(before!.width, 3);
      expect(after!.height).toBeCloseTo(before!.height, 3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await cta.click();
      await expect(page).toHaveURL(/\/request-quote$/);
      await expect(page.locator("main form")).toBeVisible();
    });
  }
}

test("hero edge remains keyboard navigable in forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const cta = page.locator("[data-home-hero]").getByRole("link", { name: "Start Your Project", exact: true });
  await cta.focus();
  expect(await cta.evaluate(element => getComputedStyle(element.querySelector("[data-project-edge]")!, "::before").content)).toBe("none");
  expect(await cta.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
  await cta.press("Enter");
  await expect(page).toHaveURL(/\/request-quote$/);
  await expect(page.locator("main form")).toBeVisible();
});

test("project links work without JavaScript or moving decoration", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-brand-header]").getByRole("link", { name: "Start Project", exact: true }).click();
  await expect(page).toHaveURL(/\/request-quote$/);
  await expect(page.locator("main form")).toBeVisible();
  await context.close();
});

test("More project link closes menu and finale link keeps its destination", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const more = page.getByRole("button", { name: "More navigation options", exact: true });
  await expect(more).toBeEnabled();
  await more.click();
  const dialog = page.locator("#more-navigation");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "Start Project", exact: true }).click();
  await expect(page).toHaveURL(/\/request-quote$/);
  await expect(dialog).not.toBeVisible();
  await page.locator("[data-brand-header]").getByRole("link", { name: "AJ System Soft Technology — home" }).click();
  const finale = page.locator('[data-home-section="enquiry"]').getByRole("link", { name: "Start Your Project", exact: true });
  await expect(finale).toHaveClass(/project-edge/);
  await finale.click();
  await expect(page).toHaveURL(/\/request-quote$/);
  await expect(page.locator("main form")).toBeVisible();
});

test("throttled phone keeps edge bounded and project click available", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-home-hero]")).toBeVisible();
  const cta = page.locator("[data-brand-header]").getByRole("link", { name: "Start Project", exact: true });
  expect(await cta.evaluate(element => getComputedStyle(element.querySelector("[data-project-edge]")!, "::before").animationIterationCount)).toBe("1");
  expect(await page.locator(edge).count()).toBe(5);
  await cta.click();
  await expect(page).toHaveURL(/\/request-quote$/);
  await expect(page.locator("main form")).toBeVisible();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
});
