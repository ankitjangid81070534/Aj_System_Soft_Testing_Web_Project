/** Targeted, read-only finishing regression checks. APP_URL and SCREENSHOT_DIR
 * are optional. No credentialed login, remote writes or fabricated success. */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const base = process.env.APP_URL || 'http://localhost:3000';
const shots = process.env.SCREENSHOT_DIR;
if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch();
const results = [];
const viewports = [[320,568],[360,800],[390,844],[400,818],[430,932],[768,1024],[981,900],[1024,768],[1280,800],[1366,768],[1440,900],[1600,1000]];
const settle = page => page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all(document.getAnimations().filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished.catch(() => {})));
});
try {
  for (const [width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 701, hasTouch: width < 701 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of ['/', '/services', '/projects', '/login', '/signup', '/contact', '/request-quote', '/ajadmin']) {
      const response = await page.goto(base + route);
      assert(response.ok(), `${route} ${response.status()}`);
      await page.locator('main h1').waitFor();
      await settle(page);
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        headings: document.querySelectorAll('main h1').length,
        missingImages: Array.from(document.images).filter(i => i.complete && i.naturalWidth === 0).map(i => i.src),
        heroHidden: Array.from(document.querySelectorAll('main h1')).some(h => {
          for (let e = h; e; e = e.parentElement) if (getComputedStyle(e).opacity === '0') return true;
          return false;
        }),
      }));
      assert(state.overflow <= 1, `${width} ${route}: overflow ${state.overflow}`);
      assert.equal(state.headings, 1, `${width} ${route}: H1 count`);
      assert(!state.heroHidden, `${route}: readable heading`);
      assert.deepEqual(state.missingImages, [], `${route}: broken images`);
      if (shots && [390,981,1440].includes(width)) await page.screenshot({ path: `${shots}/${width}-${route.replaceAll('/', '') || 'home'}.png` });
    }
    // The real password toggle stays interactive in the unconfigured form.
    await page.goto(base + '/login');
    await page.getByRole('button', { name: 'Show password', exact: true }).click();
    assert.equal(await page.locator('#client-password').getAttribute('type'), 'text');
    await page.getByRole('button', { name: 'Hide password', exact: true }).click();
    assert.equal(await page.locator('#client-password').getAttribute('type'), 'password');
    const forgot = page.getByRole('link', { name: /forgot password/i });
    await forgot.click(); await page.waitForURL('**/forgot-password');
    assert(await page.locator('main h1').isVisible());
    assert.deepEqual(errors, [], `${width}: runtime errors`);
    results.push(`${width}x${height}: eight routes, overflow, H1, images, password toggle and forgot-password entry PASS`);
    await context.close();
  }
  for (const dpr of [1, 1.25, 1.5, 2, 3]) {
    const context = await browser.newContext({ viewport: { width:981, height:900 }, deviceScaleFactor:dpr });
    const page = await context.newPage();
    await page.goto(base + '/services');
    const card = page.locator('main a.card-3d').first();
    await card.hover(); await settle(page);
    const tile = await card.locator('.icon-tile').evaluate(e => ({ transform:getComputedStyle(e).transform, filter:getComputedStyle(e).filter, glyphFilter:getComputedStyle(e.querySelector('svg')).filter }));
    assert.deepEqual(tile, { transform:'none', filter:'none', glyphFilter:'none' });
    await page.goto(base + '/login');
    const image = page.locator('img[src*="client-workspace"]');
    await image.evaluate(i => i.decode());
    assert(await image.evaluate(i => i.complete && i.naturalWidth > 0));
    if (shots) await page.screenshot({path:`${shots}/login-dpr-${dpr}.png`});
    results.push(`DPR ${dpr}: unfiltered level service glyphs and decoded login asset PASS (appearance needs visual review)`);
    await context.close();
  }
  // Snapshot each homepage section after entrance, without disabling motion.
  if (shots) {
    const context = await browser.newContext({viewport:{width:981,height:900}});
    const page = await context.newPage(); await page.goto(base);
    const sections = page.locator('main section');
    for(let i=0;i<await sections.count();i++) {
      const section=sections.nth(i); await section.scrollIntoViewIfNeeded(); await settle(page);
      await page.screenshot({path:`${shots}/home-section-${i}.png`});
    }
    await context.close();
  }
  console.log(results.join('\n'));
} finally { await browser.close(); }
