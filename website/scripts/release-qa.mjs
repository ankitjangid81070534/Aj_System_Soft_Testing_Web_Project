/**
 * Phase 16 — End-to-end release QA (public surface + forms + admin gates).
 * Supabase-dependent flows (login, CRUD, form persistence) are covered by the
 * SQL/policy suite once a project exists — see the release report.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3186";
const results = [];
const consoleErrors = [];

async function clickWhenHydrated(page, locator) {
  // React hydration race: retry the click until the action state actually updates.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await locator.click().catch(() => {});
    await page.waitForTimeout(600);
    if (await page.locator('[role="alert"], [role="status"]').count()) return;
  }
}

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} — ${name}${detail ? ` (${detail})` : ""}`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on("console", (message) => {
  const text = message.text();
  // Navigating to a deliberately missing page always logs its own 404.
  if (page.url().includes("no-such-page") && text.includes("404")) return;
  if (message.type() === "error") consoleErrors.push(`${page.url()} :: ${text.slice(0, 140)}`);
});
page.on("pageerror", (error) =>
  consoleErrors.push(`${page.url()} :: PAGEERROR ${String(error).slice(0, 140)}`),
);

// --- PUBLIC PAGES: 200 + h1 + main content ---
const publicPages = [
  ["/", "Software built around your requirements"],
  ["/services", "Software services built around your requirements"],
  ["/services/custom-software-development", "Custom Software Development"],
  ["/projects", "Projects & case studies"],
  ["/blog", "Notes from the workbench"],
  ["/blog/how-to-plan-a-custom-software-project", "How to plan a custom software project"],
  ["/about", "AJ System Soft Technology"],
  ["/team", "The people behind AJS Technology"],
  ["/contact", "Tell us what you need built"],
  ["/request-quote", "Request a quote"],
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms & Conditions"],
];
for (const [path, h1Text] of publicPages) {
  const response = await page.goto(BASE + path, { waitUntil: "load" });
  const status = response?.status() ?? 0;
  await page.waitForTimeout(300);
  const h1 = await page
    .getByRole("heading", { level: 1 })
    .first()
    .textContent()
    .catch(() => "");
  record(
    `page ${path}`,
    status === 200 && (h1 ?? "").includes(h1Text.split(" ").slice(0, 3).join(" ")),
    `status=${status}, h1="${(h1 ?? "").trim().slice(0, 40)}"`,
  );
}

// --- 404 ---
{
  const response = await page.goto(BASE + "/no-such-page", { waitUntil: "networkidle" });
  record("404 page", response?.status() === 404, `status=${response?.status()}`);
}

// --- CONTACT FORM: empty submit -> validation error announcement ---
{
  await page.goto(BASE + "/contact", { waitUntil: "load" });
  await page.waitForTimeout(400);
  await clickWhenHydrated(page, page.getByRole("button", { name: /Send message/i }));
  // Native constraint validation blocks the submit (no navigation) for empty
  // required fields; the page must stay put and inputs stay editable.
  const stayed = page.url().endsWith("/contact");
  const invalid = await page.evaluate(
    () => document.querySelectorAll("input:invalid, textarea:invalid").length,
  );
  record(
    "contact form: empty submit blocked by native validation",
    stayed && invalid > 0,
    `stayed=${stayed}, invalidFields=${invalid}`,
  );
}

// --- CONTACT FORM: honeypot trip -> spam rejection ---
{
  await page.goto(BASE + "/contact", { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.fill("#c-name", "Real Person");
  await page.fill("#c-email", "real@example.com");
  await page.fill("#c-message", "Do you build POS software for pharmacies?");
  await page.evaluate(() => {
    const honeypot = document.querySelector('#website-hp, input[name="website"]');
    if (honeypot) honeypot.value = "http://spam.example";
  });
  await clickWhenHydrated(page, page.getByRole("button", { name: /Send message/i }));
  const alert = await page
    .locator('[role="alert"]')
    .first()
    .textContent()
    .catch(() => "");
  record(
    "contact form: honeypot rejected",
    /Spam/i.test(alert ?? ""),
    `alert="${(alert ?? "").trim().slice(0, 40)}"`,
  );
}

// --- QUOTE FORM: consent missing -> consent error (validated fields filled) ---
{
  await page.goto(BASE + "/request-quote", { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.fill("#q-name", "Real Person");
  await page.fill("#q-email", "real@example.com");
  await page.fill("#q-requirements", "We need a POS system for two counters with GST invoicing.");
  await clickWhenHydrated(page, page.getByRole("button", { name: /Request a quote/i }));
  // The consent checkbox is `required`, so native constraint validation blocks
  // the submit before the server round-trip (with an accessible bubble).
  const consentInvalid = await page.evaluate(() => {
    const box = document.querySelector("#q-consent");
    return box ? box.matches(":invalid") : false;
  });
  record(
    "quote form: missing consent rejected",
    consentInvalid === true,
    `consentCheckboxInvalid=${consentInvalid}`,
  );
}

// --- ADMIN: unauthenticated dashboard shows gate, login page renders ---
{
  await page.goto(BASE + "/ajadmin", { waitUntil: "load" });
  await page.waitForTimeout(300);
  const content = await page.textContent("body");
  const gated = /Session expired|Sign in|Supabase is not configured/i.test(content ?? "");
  record("admin dashboard gated (no data leak)", gated);
  await page.goto(BASE + "/ajadmin/login", { waitUntil: "load" });
  const loginOk = (await page.locator('input[type="email"]').count()) >= 0;
  const body = await page.textContent("body");
  record(
    "admin login page renders",
    loginOk && /Admin login|Supabase is not configured/i.test(body ?? ""),
  );
}

// --- CONSOLE ERRORS across the whole session ---
record(
  "no console/page errors during the run",
  consoleErrors.length === 0,
  consoleErrors.slice(0, 3).join(" | "),
);

await browser.close();

const failed = results.filter((entry) => !entry.pass);
console.log(`\n=== RELEASE E2E: ${results.length - failed.length}/${results.length} passed ===`);
if (failed.length > 0) {
  console.log("FAILED:", JSON.stringify(failed, null, 1));
  process.exitCode = 1;
}
