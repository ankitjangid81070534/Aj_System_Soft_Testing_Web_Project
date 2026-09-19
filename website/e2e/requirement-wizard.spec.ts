import { expect, test } from "playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(90_000);

const brief = "Business problem: organise orders.\nUsers: shop staff.\nKey features: order tracking.\nIntegrations: existing accounting system.";

for (const width of [320, 390, 662, 820, 1024, 1440]) {
  test(`wizard validation, review and retained fields at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: width === 662 ? "reduce" : "no-preference" });
    const posts: string[] = [];
    const errors: string[] = [];
    page.on("request", (request) => { if (request.method() === "POST" && new URL(request.url()).origin === new URL(page.url()).origin) posts.push(request.url()); });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/request-quote", { waitUntil: "domcontentloaded" });
    const form = page.locator('[data-quote-wizard="ready"]');
    await expect(form).toBeVisible();
    await page.locator("#q-type").selectOption("Business website");
    await expect(page.locator("#q-budget")).not.toHaveAttribute("required");
    await form.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(form.getByRole("heading", { name: "Step 2 of 4: Requirements" })).toBeFocused();
    await form.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.locator("#q-requirements")).toBeFocused();
    await page.locator("#q-requirements").fill("                     ");
    await form.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.locator("#q-requirements")).toBeFocused();
    await page.locator("#q-requirements").fill(brief);
    await page.locator("#q-requirements").press("Enter");
    await expect(form.getByRole("heading", { name: "Step 2 of 4: Requirements" })).toBeVisible();
    await page.locator("#q-requirements").fill(brief);
    await page.locator("#q-attachment").setInputFiles({ name: "scope.pdf", mimeType: "application/pdf", buffer: Buffer.from("read-only browser test; not uploaded") });
    await form.getByRole("button", { name: "Continue", exact: true }).click();
    await form.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.locator("#q-name")).toBeFocused();
    await page.locator("#q-name").fill("Wizard Test");
    await page.locator("#q-email").fill("invalid-email");
    await page.locator("#q-email").press("Enter");
    await expect(page.locator("#q-email")).toBeFocused();
    await expect(form.getByRole("heading", { name: "Step 3 of 4: Contact" })).toBeVisible();
    await page.locator("#q-email").fill("wizard-test@example.invalid");
    await page.locator("#q-email").press("Enter");
    await expect(form.getByRole("heading", { name: "Step 4 of 4: Review & consent" })).toBeFocused();
    await expect(form.locator("dl")).toContainText(brief);
    await expect(form.locator("dl")).toContainText("scope.pdf");
    await expect(form.locator("dl")).toContainText("Business website");
    await expect(page.locator("#q-consent")).not.toBeChecked();
    await expect(page.locator("#q-agreement")).not.toBeChecked();
    await form.getByRole("button", { name: "Request a quote", exact: true }).click();
    await expect(page.locator("#q-consent")).toBeFocused();
    await page.locator("#q-consent").check();
    await form.getByRole("button", { name: "Request a quote", exact: true }).click();
    await expect(page.locator("#q-agreement")).toBeFocused();
    await form.getByRole("button", { name: "Edit requirements", exact: true }).click();
    await expect(page.locator("#q-requirements")).toHaveValue(brief);
    expect(await page.locator("#q-attachment").evaluate((input) => (input as HTMLInputElement).files?.[0]?.name)).toBe("scope.pdf");
    await page.locator("#q-requirements").fill(brief + "\nReporting: daily summary.");
    await form.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.locator("#q-type")).toHaveValue("Business website");
    await form.getByRole("button", { name: "Continue", exact: true }).click();
    await form.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.locator("#q-name")).toHaveValue("Wizard Test");
    await form.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(form.locator("dl")).toContainText("Reporting: daily summary.");
    for (const button of await form.getByRole("button").all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(posts).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`full quote form without JavaScript at ${width}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/request-quote`, { waitUntil: "domcontentloaded" });
      await expect(page.locator('[data-quote-wizard="full-form"]')).toBeVisible();
      for (const id of ["q-type", "q-requirements", "q-name", "q-consent", "q-agreement"]) await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.getByRole("button", { name: "Continue", exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Request a quote", exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally { await context.close(); }
  });
}

test("unconfigured submission preserves answers and file, and prevents duplicate pending sends", async ({ page }) => {
  test.skip(process.env.QUOTE_UNCONFIGURED_TESTS !== "1" || !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    "Explicitly opt in only against a confirmed unconfigured local preview; never submit to an existing backend.");
  await page.goto("/request-quote", { waitUntil: "domcontentloaded" });
  const form = page.locator('[data-quote-wizard="ready"]');
  await expect(form).toBeVisible();
  await form.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#q-requirements").fill(brief);
  await page.locator("#q-attachment").setInputFiles({ name: "scope.pdf", mimeType: "application/pdf", buffer: Buffer.from("not uploaded") });
  await form.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#q-name").fill("Wizard Test");
  await page.locator("#q-email").fill(`wizard-${Date.now()}@example.invalid`);
  await form.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#q-consent").check();
  await page.locator("#q-agreement").check();
  // Honour the existing two-second spam guard; no timestamp manipulation.
  await expect.poll(async () => Date.now() - Number(await form.locator('[name="startedAt"]').inputValue())).toBeGreaterThan(2100);
  let posts = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/request-quote", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    posts++;
    await held;
    await route.continue();
  });
  await form.getByRole("button", { name: "Request a quote", exact: true }).click();
  await expect(form).toHaveAttribute("aria-busy", "true");
  await expect(form.locator('button[type="submit"]')).toBeDisabled();
  await expect(form.getByRole("button", { name: "Back", exact: true })).toBeDisabled();
  release();
  await expect(form.getByRole("alert")).toHaveText("Online submissions are not enabled yet. Please reach us directly.");
  await expect(form.getByRole("alert")).toBeFocused();
  expect(posts).toBe(1);
  await form.getByRole("button", { name: "Edit requirements", exact: true }).click();
  await expect(page.locator("#q-requirements")).toHaveValue(brief);
  expect(await page.locator("#q-attachment").evaluate((input) => (input as HTMLInputElement).files?.[0]?.name)).toBe("scope.pdf");
});
