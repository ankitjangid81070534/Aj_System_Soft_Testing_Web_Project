/** Read-only browser checks. Run against a local/dev server with Playwright's
 * Chromium installed: node scripts/verify-presentation.mjs
 * Optional: APP_URL, SCREENSHOT_DIR. Never signs in or writes CMS/lead records.
 */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.APP_URL || "http://localhost:3000";
const shots = process.env.SCREENSHOT_DIR;
if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const screenshot = async (page, name, target) => {
  if (!shots) return;
  if (target) await target.scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const finite = document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime));
    await Promise.all(finite.map(animation => animation.finished.catch(() => {})));
  });
  await (target || page).screenshot({ path: `${shots}/${name}.png`, animations: "disabled" });
};
const loaded = async (page, path) => {
  const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
  assert(response && response.status() < 400, `${path}: document failed`);
  await page.locator("main").waitFor();
  assert(await page.locator("main").innerText(), `${path}: empty main`);
};
const noOverflow = async page => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${page.url()}: horizontal overflow`);
const instantTop = async page => {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
};

try {
  for (const [name, width, height] of [["desktop",1440,900],["tablet",936,760],["mobile",390,844]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 701, hasTouch: width < 701, reducedMotion: "no-preference" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await loaded(page,"/");
    await page.waitForFunction(() => document.querySelector("[data-reveal-cycle]"));
    await noOverflow(page);
    await screenshot(page,`${name}-home`);

    const fan = page.locator('#included [data-reveal="fan"]').first();
    for (let visit = 1; visit <= 3; visit++) {
      await instantTop(page);
      const before = Number(await fan.getAttribute("data-reveal-cycle") || 0);
      await fan.scrollIntoViewIfNeeded();
      await page.waitForFunction(before => Number(document.querySelector('#included [data-reveal="fan"]').dataset.revealCycle) > before, before);
    }
    results.push(`${name}: three complete scroll/re-entry cycles PASS`);

    const track = page.locator("[data-journey-track]");
    if (width > 700) {
      await page.locator("#capabilities").evaluate(element => window.scrollTo({ top: element.offsetTop + 100, behavior: "instant" }));
      const before = await track.getAttribute("style");
      await page.mouse.move(width / 2, height / 2);
      await page.mouse.wheel(0, 600);
      await page.waitForFunction(before => document.querySelector("[data-journey-track]").getAttribute("style") !== before, before);
      assert(await page.locator("[data-scene-index]").first().evaluate(e => e.style.getPropertyValue("--scene-phase") !== ""));
      results.push(`${name}: native-wheel panel movement and rotation PASS`);
    } else {
      assert.equal(await page.locator("#capabilities").getAttribute("data-motion"),"stacked");
      results.push("mobile: stacked scenes and native scrolling PASS");
    }

    for (let index = 0; index < 5; index++) {
      const button = page.locator('[aria-controls="delivery-description"]').nth(index);
      await button.click();
      await page.waitForFunction(index => document.querySelectorAll('[aria-controls="delivery-description"]')[index].getAttribute("aria-pressed") === "true",index);
      assert((await page.locator("#delivery-description").innerText()).length > 30);
    }
    results.push(`${name}: all five delivery buttons PASS`);
    await screenshot(page,`${name}-process`,page.locator('#delivery > div'));
    await screenshot(page,`${name}-ownership`,page.locator('section[class*="ownership"]'));
    await screenshot(page,`${name}-finale`,page.locator('section[class*="finale"]'));

    await loaded(page,"/services");
    await noOverflow(page);
    await screenshot(page,`${name}-services`);
    const first = page.locator('main a[href^="/services/"]').first();
    if (width > 700) {
      await first.hover({ position: { x: 35, y: 40 } });
      await page.waitForFunction(() => document.querySelector('main a[href^="/services/"]').style.getPropertyValue("--tilt-x") !== "");
      results.push(`${name}: real pointer tilt PASS`);
    }
    const destination = await first.getAttribute("href");
    await first.click();
    await page.waitForURL(`${base}${destination}`);
    await noOverflow(page);
    const accordion = page.locator('main button[aria-expanded]').first();
    if (await accordion.count()) {
      await accordion.click(); assert.equal(await accordion.getAttribute("aria-expanded"),"true");
      await accordion.click(); assert.equal(await accordion.getAttribute("aria-expanded"),"false");
      results.push(`${name}: service accordion open/close PASS`);
    }
    results.push(`${name}: service-card navigation PASS`);

    await loaded(page,"/contact");
    await noOverflow(page);
    await screenshot(page,`${name}-contact`);
    const theme = page.getByRole("button", { name: "Toggle color theme" }).first();
    await theme.click();
    assert(await page.locator("html").evaluate(e => e.classList.contains("dark")));
    assert.equal(await page.evaluate(() => localStorage.getItem("ajs-theme")),"dark");
    await screenshot(page,`${name}-dark-contact`);
    await theme.click();
    results.push(`${name}: theme toggle and persistence PASS`);

    if (width < 1024) {
      await page.getByRole("button",{name:"Open navigation menu"}).click();
      await page.locator("#mobile-menu[open]").waitFor();
      await page.getByRole("button",{name:"Close navigation menu"}).click();
      await page.locator("#mobile-menu").waitFor({state:"hidden"});
      results.push(`${name}: menu open/close PASS`);
    }
    await loaded(page,"/ajadmin");
    await noOverflow(page);
    await screenshot(page,`${name}-admin`);
    results.push(`${name}: admin entry renders (authenticated editing NOT tested)`);
    assert.deepEqual(errors,[],`${name}: runtime errors`);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 936, height: 760 } });
  const page = await context.newPage();
  const routes = ["/about","/projects","/blog","/team","/reviews","/request-quote","/privacy","/terms","/service-agreement","/login","/signup","/forgot-password","/reset-password","/update-password","/account","/ajadmin/login"];
  for (const path of routes) { await loaded(page,path); await noOverflow(page); }
  results.push(`${routes.length} additional public/account/admin-entry routes render PASS`);
  await context.close();

  for (const mode of ["reduced-motion","no-js"]) {
    const context = await browser.newContext({ viewport: {width:390,height:844}, reducedMotion: mode === "reduced-motion" ? "reduce" : "no-preference", javaScriptEnabled: mode !== "no-js" });
    const page = await context.newPage();
    await loaded(page,"/");
    const section = page.locator("#capabilities");
    assert.notEqual(await section.getAttribute("data-motion"),"horizontal");
    assert.equal(await page.locator("main h1").evaluate(e => getComputedStyle(e).opacity),"1");
    if (mode === "no-js") assert.equal(await page.locator("#delivery noscript li").count(),5);
    else assert.equal(await page.locator("[data-reveal-cycle]").count(),0);
    await noOverflow(page);
    results.push(`${mode}: content visible and scenes stacked PASS`);
    await context.close();
  }
  console.log(results.join("\n"));
} finally { await browser.close(); }
