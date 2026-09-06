/**
 * Phase 15 — Responsive visual QA.
 * Checks every public route (and admin) at the 9 required breakpoints for:
 *  - horizontal overflow (documentElement + offending elements)
 *  - sticky element overlap (header vs first heading)
 *  - missing h1, touch-target sanity
 * Saves screenshots for a representative subset.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3171";
const SHOTS = "shots";
mkdirSync(SHOTS, { recursive: true });

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/services", name: "services" },
  { path: "/services/custom-software-development", name: "service-detail" },
  { path: "/projects", name: "projects" },
  { path: "/blog", name: "blog" },
  { path: "/blog/how-to-plan-a-custom-software-project", name: "article" },
  { path: "/about", name: "about" },
  { path: "/team", name: "team" },
  { path: "/contact", name: "contact" },
  { path: "/request-quote", name: "quote" },
  { path: "/ajadmin", name: "admin-dash" },
  { path: "/ajadmin/login", name: "admin-login" },
  { path: "/definitely-not-a-page", name: "not-found" },
];

const VIEWPORTS = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1600];
const SHOT_VIEWPORTS = new Set([320, 390, 768, 1440]);

const browser = await chromium.launch();
const results = [];

for (const width of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();

  for (const route of ROUTES) {
    await page.goto(BASE + route.path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(120);

    const audit = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflowPx = doc.scrollWidth - doc.clientWidth;
      const offenders = [];
      const isClipped = (el) => {
        for (let a = el.parentElement; a; a = a.parentElement) {
          const o = getComputedStyle(a).overflowX;
          if (o === "hidden" || o === "clip") return true;
        }
        return false;
      };
      if (overflowPx > 1) {
        for (const el of document.querySelectorAll("body *")) {
          const rect = el.getBoundingClientRect();
          if (rect.right > doc.clientWidth + 1 && rect.width > 8 && !isClipped(el)) {
            offenders.push(
              `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")} → right=${Math.round(rect.right)}`,
            );
            if (offenders.length >= 4) break;
          }
        }
      }
      const h1s = document.querySelectorAll("h1").length;
      const header = document.querySelector("header");
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const main = document.querySelector("main, #main-content, article");
      let stickyOverlap = false;
      if (main && header) {
        const first = main.querySelector("h1, h2, p, a, div");
        if (first) {
          const top = first.getBoundingClientRect().top;
          stickyOverlap = top >= 0 && top < headerBottom - 4 && window.scrollY === 0;
        }
      }
      const smallTargets = [];
      for (const el of document.querySelectorAll("a[href], button")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.width < 20 && r.height < 20) {
          smallTargets.push(`${el.tagName}:${(el.textContent || "").trim().slice(0, 12)}`);
          if (smallTargets.length >= 3) break;
        }
      }
      return { overflowPx, offenders, h1s, stickyOverlap, smallTargets };
    });

    results.push({
      width,
      route: route.name,
      ...audit,
    });

    if (
      SHOT_VIEWPORTS.has(width) &&
      ["home", "service-detail", "projects", "contact", "admin-dash", "article", "team"].includes(
        route.name,
      )
    ) {
      // Scroll through the page so IntersectionObserver reveals fire before capture.
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 40));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
      await page.screenshot({
        path: `${SHOTS}/${route.name}-${width}.png`,
        fullPage: width >= 1024,
      });
    }
  }
  await context.close();
}

// Mobile menu interaction test at 390px
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const dialog = page.getByRole("dialog", { name: "Site navigation" });
    // Hydration race: retry the click until the dialog actually opens.
    for (let attempt = 0; attempt < 5 && !(await dialog.isVisible()); attempt += 1) {
      await page.waitForTimeout(400);
      await page
        .getByRole("button", { name: "Open navigation menu" })
        .click()
        .catch(() => {});
    }
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    const menuVisible = await dialog.isVisible();
    const menuLinks = await page
      .getByRole("navigation", { name: "Mobile" })
      .getByRole("link")
      .count();
    await page.screenshot({ path: `${SHOTS}/mobile-menu-open-390.png` });
    await page.getByRole("button", { name: "Close navigation menu" }).click();
    await dialog.waitFor({ state: "hidden", timeout: 5000 });
    const menuClosed = !(await dialog.isVisible());
    results.push({ width: 390, route: "mobile-menu", menuVisible, menuLinks, menuClosed });
  } catch (error) {
    results.push({ width: 390, route: "mobile-menu", error: String(error).slice(0, 200) });
  }
  await context.close();
}

// Reduced motion sanity: animations disabled via media query still show content
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const revealVisible = await page.evaluate(() => {
    const el = document.querySelector(".reveal");
    if (!el) return "no-reveal-elements";
    return getComputedStyle(el).opacity;
  });
  results.push({ width: 1280, route: "reduced-motion", revealVisible });
  await context.close();
}

const problems = results.filter(
  (r) => (r.overflowPx ?? 0) > 1 || r.h1s === 0 || r.stickyOverlap || r.smallTargets?.length,
);
console.log("=== PROBLEMS ===");
console.log(problems.length === 0 ? "NONE" : JSON.stringify(problems, null, 1));
console.log("=== MENU/REDUCED-MOTION ===");
console.log(
  JSON.stringify(
    results.filter((r) => r.route.startsWith("mobile-menu") || r.route === "reduced-motion"),
    null,
    1,
  ),
);
console.log(`=== TOTAL CHECKS: ${results.length} ===`);

await browser.close();
