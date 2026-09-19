import { expect, test } from "playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
test.setTimeout(90_000);

const unconfigured = process.env.AUTH_UNCONFIGURED_TESTS === "1" &&
  !["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY"].some((key) => process.env[key]);

for (const width of [390, 662, 1440]) {
  for (const kind of ["login", "signup", "forgot-password", "ajadmin/login"] as const) {
    test(`${kind} genuine failure retains details, clears passwords and supports retry at ${width}`, async ({ page }) => {
      test.skip(!unconfigured, "Explicitly confirm the target has no backend/email configuration before opting in.");
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: width === 662 ? "reduce" : "no-preference" });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`/${kind}`, { waitUntil: "domcontentloaded" });
      if (kind === "ajadmin/login") {
        await expect(page.getByRole("status").filter({ hasText: "Supabase credentials not configured" })).toBeVisible();
        test.skip(true, "Staff form is intentionally unavailable without backend configuration; no auth bypass.");
      }
      await expect(page.getByRole("button", { name: width < 1024 ? "More navigation options" : /Search/ })).toBeEnabled();
      const form = page.locator("form").filter({ has: page.locator('input[name="email"], input[name="identifier"]') }).first();
      const identity = form.locator('input[name="email"], input[name="identifier"]');
      const identityValue = `feedback-${width}-${Date.now()}@example.invalid`;
      await identity.fill(identityValue);
      const passwords = form.locator('input[name="password"], input[name="confirmPassword"]');
      if (kind === "signup") {
        for (const [name, value] of Object.entries({ fullName: "Feedback Test", username: "feedback.test", phone: "1234567890", company: "Test Company", addressLine1: "Test Address", addressLine2: "Test Unit", city: "Test City", state: "Test State", postalCode: "123456", country: "India" })) await form.locator(`[name="${name}"]`).fill(value);
        await form.locator('[name="consent"]').check();
        await form.locator('[name="agreementAccepted"]').check();
      }
      const expected = kind === "login" ? "Client login is not configured yet." : kind === "signup" ? "Client registration is being prepared. Please try again after the portal update." : kind === "forgot-password" ? "Password recovery is not configured yet." : "Invalid username or password.";
      let posts = 0;
      for (let attempt = 0; attempt < 2; attempt++) {
        for (const password of await passwords.all()) await password.fill("TestingOnly123!");
        const show = form.getByRole("button", { name: "Show password", exact: true });
        if (await show.count()) await show.click();
        const before = await form.evaluate((element) => Array.from(new FormData(element as HTMLFormElement).entries()).filter(([name]) => !["password", "confirmPassword"].includes(name) && !name.startsWith("$ACTION_")));
        let release!: () => void;
        const held = new Promise<void>((resolve) => { release = resolve; });
        await page.route(`**/${kind}`, async (route) => {
          if (route.request().method() !== "POST") return route.continue();
          posts++;
          await held;
          await route.continue();
        });
        await form.locator('button[type="submit"]').click();
        await expect(form).toHaveAttribute("aria-busy", "true");
        await expect(form.locator('button[type="submit"]')).toBeDisabled();
        await expect(form.getByRole("alert")).toHaveCount(0);
        await identity.press("Enter");
        release();
        await expect(form).toHaveAttribute("aria-busy", "false");
        await expect(form.getByRole("alert")).toHaveText(expected);
        await expect(form.getByRole("alert")).toBeFocused();
        await expect(identity).toHaveValue(identityValue);
        for (const password of await passwords.all()) {
          await expect(password).toHaveValue("");
          await expect(password).toHaveAttribute("type", "password");
        }
        expect(await form.evaluate((element) => Array.from(new FormData(element as HTMLFormElement).entries()).filter(([name]) => !["password", "confirmPassword"].includes(name) && !name.startsWith("$ACTION_")))).toEqual(before);
        expect(posts).toBe(attempt + 1);
        await page.unroute(`**/${kind}`);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("login query errors use safe local messages", async ({ page }) => {
  for (const [code, message] of [
    ["oauth_callback", "Google sign-in could not be completed. Please try again."],
    ["invalid_email_link", "This email link is invalid or expired. Request a new link and try again."],
    ["provider-private-details", "Sign-in could not be completed. Please try again or request a new recovery link."],
  ]) {
    await page.goto(`/login?error=${code}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("form").getByRole("alert")).toHaveText(message);
    await expect(page.locator("body")).not.toContainText(code);
  }
});

for (const width of [390, 1440]) {
  test(`auth forms retain native controls without JavaScript at ${width}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    try {
      const page = await context.newPage();
      for (const path of ["/login", "/signup", "/forgot-password"]) {
        await page.goto(`${baseURL}${path}`, { waitUntil: "domcontentloaded" });
        const form = page.locator("form").filter({ has: page.locator('[name="email"]') });
        await expect(form.locator('[name="email"]')).toHaveAttribute("required");
        await expect(form.locator('button[type="submit"]')).toBeEnabled();
        if (path === "/signup") await expect(form.locator('[name="agreementAccepted"]')).not.toBeChecked();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    } finally { await context.close(); }
  });
}

test("native validation and recovery protection remain", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  const posts: string[] = [];
  page.on("request", (request) => { if (request.method() === "POST" && new URL(request.url()).origin === new URL(page.url()).origin) posts.push(request.url()); });
  await page.getByRole("button", { name: "Sign in to client portal", exact: true }).click();
  await expect(page.locator("#client-email")).toBeFocused();
  await page.goto("/update-password", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#reset-password")).toBeDisabled();
  await expect(page.locator("#reset-confirm")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Update password", exact: true })).toHaveCount(0);
  expect(posts).toEqual([]);
});
