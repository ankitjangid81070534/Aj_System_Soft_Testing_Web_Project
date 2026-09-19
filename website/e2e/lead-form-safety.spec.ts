import { expect, test } from "playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(90_000);

for (const width of [390, 662, 1440]) {
  test(`contact and consultation validation at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: width === 662 ? "reduce" : "no-preference" });
    const posts: string[] = [];
    const errors: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST" && new URL(request.url()).origin === new URL(page.url()).origin) posts.push(request.url());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    const contact = page.locator("form").filter({ has: page.locator("#c-name") });
    const appointment = page.locator("form").filter({ has: page.locator("#a-name") });
    await expect(contact).toBeVisible();
    // Wait for an observable hydration response, not a timer.
    await expect(page.getByRole("button", { name: width < 1024 ? "More navigation options" : /Search/ })).toBeEnabled();
    const guards = await page.locator('input[name="website"]').evaluateAll((inputs) => inputs.map((input) => ({ id: input.id, label: input.previousElementSibling?.getAttribute("for"), name: input.getAttribute("name") })));
    expect(guards).toHaveLength(2);
    expect(new Set(guards.map((guard) => guard.id)).size).toBe(2);
    expect(guards.every((guard) => guard.id && guard.label === guard.id && guard.name === "website")).toBe(true);
    await page.locator("#c-name").fill("A");
    await contact.getByRole("button", { name: "Send message", exact: true }).click();
    await expect(page.locator("#c-name")).toBeFocused();
    await page.locator("#c-name").fill("Contact Test");
    await page.locator("#c-email").fill("test@example.invalid");
    await page.locator("#c-phone").fill("1234567890");
    await page.locator("#c-company").fill("Test Company");
    await page.locator("#c-message").fill("Short");
    await contact.getByRole("button", { name: "Send message", exact: true }).click();
    await expect(page.locator("#c-message")).toBeFocused();
    await page.locator("#c-message").fill("A sufficiently detailed enquiry.");
    await contact.getByRole("button", { name: "Send message", exact: true }).click();
    await expect(page.locator("#c-agreement")).toBeFocused();
    await page.locator("#c-agreement").check();
    for (const id of ["c-name", "c-company", "c-message"]) {
      const input = page.locator(`#${id}`);
      const previous = await input.inputValue();
      await input.fill("                    ");
      await contact.getByRole("button", { name: "Send message", exact: true }).click();
      await expect(input).toBeFocused();
      expect(await input.evaluate((element) => (element as HTMLInputElement).validity.customError)).toBe(true);
      await input.fill(previous);
      expect(await input.evaluate((element) => (element as HTMLInputElement).validity.customError)).toBe(false);
    }
    await page.locator("#a-name").fill("A");
    await appointment.getByRole("button", { name: "Request a consultation", exact: true }).click();
    await expect(page.locator("#a-name")).toBeFocused();
    await page.locator("#a-name").fill("  ");
    await page.locator("#a-email").fill("test@example.invalid");
    await appointment.getByRole("button", { name: "Request a consultation", exact: true }).click();
    await expect(page.locator("#a-name")).toBeFocused();
    await page.locator("#a-name").fill("Consultation Test");
    await page.locator("#a-phone").fill("abcdef");
    await appointment.getByRole("button", { name: "Request a consultation", exact: true }).click();
    await expect(page.locator("#a-phone")).toBeFocused();
    await page.locator("#a-phone").fill("");
    await expect(page.locator("#a-phone")).not.toHaveAttribute("required");
    expect(await page.locator("#a-phone").evaluate((input) => (input as HTMLInputElement).checkValidity())).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(posts).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const kind of ["contact", "appointment"] as const) {
  test(`${kind} genuine unconfigured error retains input and focuses feedback`, async ({ page }) => {
    test.skip(process.env.LEAD_UNCONFIGURED_TESTS !== "1" || !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Opt in only after confirming the target backend is unconfigured.");
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    const prefix = kind === "contact" ? "c" : "a";
    const form = page.locator("form").filter({ has: page.locator(`#${prefix}-name`) });
    await page.locator(`#${prefix}-name`).fill("Recovery Test");
    await page.locator(`#${prefix}-email`).fill(`${kind}-${Date.now()}@example.invalid`);
    await page.locator(`#${prefix}-message`).fill("Keep this enquiry after an unsuccessful attempt.");
    if (kind === "contact") {
      await page.locator("#c-phone").fill("1234567890");
      await page.locator("#c-company").fill("Test Company");
      await page.locator("#c-agreement").check();
    } else {
      await page.locator("#a-date").fill("2026-10-01");
      await page.locator("#a-time").selectOption("Morning (9–12)");
      await page.locator("#a-topic").fill("Software consultation");
    }
    const before = await form.evaluate((element) => Object.fromEntries(new FormData(element as HTMLFormElement)));
    await expect.poll(async () => Date.now() - Number(await form.locator('[name="startedAt"]').inputValue())).toBeGreaterThan(2100);
    let posts = 0;
    let release!: () => void;
    const held = new Promise<void>((resolve) => { release = resolve; });
    await page.route("**/contact", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      posts++;
      await held;
      await route.continue();
    });
    await form.locator('button[type="submit"]').click();
    await expect(form).toHaveAttribute("aria-busy", "true");
    await expect(form.locator('button[type="submit"]')).toBeDisabled();
    // A real Enter gesture while pending must not queue a second send.
    await page.locator(`#${prefix}-email`).press("Enter");
    release();
    const expected = kind === "contact" ? "Online submissions are not enabled yet. Please reach us directly." : "Online bookings are not enabled yet. Please reach us directly.";
    await expect(form.getByRole("alert")).toHaveText(expected);
    await expect(form.getByRole("alert")).toBeFocused();
    await expect(form.locator('button[type="submit"]')).toBeEnabled();
    expect(posts).toBe(1);
    expect(await form.evaluate((element) => Object.fromEntries(new FormData(element as HTMLFormElement)))).toEqual(before);
    await expect(page.locator(`#${prefix}-name`)).not.toHaveAttribute("aria-invalid", "true");
    // Retry the same real failure: equal error copy must focus again and retain edits.
    await page.locator(`#${prefix}-message`).fill("An updated enquiry that must also remain intact.");
    await form.locator('button[type="submit"]').click();
    await expect.poll(() => posts).toBe(2);
    await expect(form).toHaveAttribute("aria-busy", "false");
    await expect(form.getByRole("alert")).toBeFocused();
    await expect(page.locator(`#${prefix}-message`)).toHaveValue("An updated enquiry that must also remain intact.");
  });
}

for (const width of [390, 1440]) {
  test(`contact forms remain usable without JavaScript at ${width}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/contact`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("#c-name")).toHaveAttribute("minlength", "2");
      await expect(page.locator("#c-message")).toHaveAttribute("minlength", "10");
      await expect(page.locator("#a-name")).toHaveAttribute("minlength", "2");
      await expect(page.locator("#c-agreement")).not.toBeChecked();
      await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeEnabled();
      await expect(page.getByRole("button", { name: "Request a consultation", exact: true })).toBeEnabled();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally { await context.close(); }
  });
}
