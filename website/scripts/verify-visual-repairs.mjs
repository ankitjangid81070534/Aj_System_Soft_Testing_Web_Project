/** Read-only regression checks for orbit replay, sculpted navigation and login.
 * Run after `npx playwright install --with-deps chromium`.
 * APP_URL and SCREENSHOT_DIR are optional. Never authenticates or saves records.
 */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.APP_URL || "http://localhost:3000";
const shots = process.env.SCREENSHOT_DIR;
if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch();
const results = [];
const noOverflow = async page => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${page.url()}: overflow`);
const capture = async (page, name) => {
  if (!shots) return;
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished.catch(() => {})));
  });
  await page.screenshot({ path: `${shots}/${name}.png` });
};
try {
  for (const [name, width, height] of [["desktop",1440,900],["tablet",1004,900],["mobile",390,844]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base, { waitUntil: "networkidle" });
    await page.locator("[data-orbit-entry][data-reveal-cycle]").first().waitFor({state:"attached"});
    const icons = page.locator("[data-orbit-entry]").first();
    const initial = Number(await icons.getAttribute("data-reveal-cycle"));
    await page.mouse.move(width / 2,height / 2);
    await page.mouse.wheel(0,1500);
    await page.waitForFunction(() => scrollY > 1000);
    await page.mouse.wheel(0,-10000);
    await page.waitForFunction(() => scrollY < 2);
    await page.waitForFunction(initial => Number(document.querySelector('[data-orbit-entry]').dataset.revealCycle) > initial,initial);
    // Finish every entrance, then sample across an entire floating-motion cycle.
    await page.evaluate(async () => {
      await Promise.all([...document.querySelectorAll('[data-orbit-entry]')].flatMap(e => e.getAnimations()).map(a => a.finished.catch(() => {})));
    });
    const stability = await page.evaluate(async () => {
      const icons = [...document.querySelectorAll('[data-orbit-entry]')];
      const before = icons.map(e => e.dataset.revealCycle);
      let stable = true;
      let visible = true;
      for (let frame = 0; frame < 450; frame++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        stable &&= icons.every((e,i) => e.dataset.revealCycle === before[i]);
        visible &&= icons.every(e => getComputedStyle(e).opacity === '1');
      }
      return { stable, visible };
    });
    assert(stability.stable && stability.visible, `${name}: icons restart or blink while stationary`);
    results.push(`${name}: native scroll replay + full floating cycle without blinking PASS`);
    await noOverflow(page);
    await capture(page,`${name}-home`);

    const openPortal = async () => {
      if (width < 1024) {
        await page.getByRole('button',{name:'Open navigation menu'}).click();
        await page.getByRole('button',{name:'Client Login',exact:true}).click();
      } else {
        await page.getByRole('button',{name:'Client portal login',exact:true}).click();
      }
      await page.locator('dialog[aria-labelledby="portal-login-title"][open]').waitFor();
    };
    await openPortal();
    await page.getByRole('button',{name:'Show password',exact:true}).click();
    assert.equal(await page.locator('#client-password').getAttribute('type'),'text');
    await page.getByRole('button',{name:'Hide password',exact:true}).click();
    assert.equal(await page.locator('#client-password').getAttribute('type'),'password');
    await page.waitForFunction(()=>{const image=document.querySelector('dialog[open] img');return image?.complete && image.naturalWidth>0;});
    await capture(page,`${name}-portal`);
    await page.getByRole('button',{name:'Close client login',exact:true}).click();
    await page.locator('dialog[aria-labelledby="portal-login-title"]').waitFor({state:'hidden'});
    assert(await page.evaluate(()=>document.body.style.overflow!=='hidden'));
    await openPortal();
    await page.keyboard.press('Escape');
    await page.locator('dialog[aria-labelledby="portal-login-title"]').waitFor({state:'hidden'});
    results.push(`${name}: portal opens/reopens, reveal/conceal, close button and Escape PASS`);

    if (width < 1024) {
      await page.getByRole('button',{name:'Open navigation menu'}).click();
      assert(await page.locator('#mobile-menu').evaluate(e=>e.open));
      assert.equal(await page.locator('#mobile-menu nav a').count(),8);
      await capture(page,`${name}-navigation`);
      await page.locator('#mobile-menu nav a[href="/services"]').click();
      await page.waitForURL(`${base}/services`);
      assert(!(await page.locator('#mobile-menu').evaluate(e=>e.open)));
    } else {
      assert.equal(await page.locator('nav[aria-label="Main"] a').count(),8);
      await page.locator('nav[aria-label="Main"] a[href="/services"]').click();
      await page.waitForURL(`${base}/services`);
    }
    results.push(`${name}: real navigation click changes route PASS`);
    await page.locator('footer a[href="/login"]').click();
    await page.waitForURL(`${base}/login`);
    await page.locator('#client-password').waitFor();
    await page.locator('#client-password').fill('Preview-only-check');
    await page.getByRole('button',{name:'Show password',exact:true}).click();
    assert.equal(await page.locator('#client-password').getAttribute('type'),'text');
    await page.getByRole('button',{name:'Hide password',exact:true}).click();
    assert.equal(await page.locator('#client-password').getAttribute('type'),'password');
    await page.locator('#client-password').fill('');
    await page.getByRole('button',{name:'Sign in to client portal'}).click();
    assert(await page.locator('#client-email').evaluate(e=>e.validity.valueMissing && document.activeElement===e));
    // Dismiss native validation feedback before inspecting the resting design.
    await page.locator('h1').click();
    await page.waitForFunction(()=>{const image=document.querySelector('main img');return image?.complete && image.naturalWidth>0;});
    await noOverflow(page);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await capture(page,`${name}-login`);
    await page.getByRole('button',{name:'Toggle color theme'}).first().click();
    assert(await page.evaluate(()=>document.documentElement.classList.contains('dark') && localStorage.getItem('ajs-theme')==='dark'));
    await noOverflow(page);
    await capture(page,`${name}-login-dark`);
    await page.getByRole('button',{name:'Toggle color theme'}).first().click();
    assert(await page.evaluate(()=>!document.documentElement.classList.contains('dark')));
    results.push(`${name}: reveal/conceal + required validation + artwork + theme persistence PASS`);

    await page.goto(`${base}/contact`,{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    assert(await page.locator('main form').first().evaluate(e=>!e.checkValidity() && e.contains(document.activeElement)));
    await page.getByRole('button',{name:'Request a consultation',exact:true}).click();
    assert(await page.locator('main form').nth(1).evaluate(e=>!e.checkValidity() && e.contains(document.activeElement)));
    await noOverflow(page);
    results.push(`${name}: contact/consultation required-field validation PASS (no submissions)`);
    await page.goto(`${base}/ajadmin`,{waitUntil:'networkidle'});
    assert((await page.locator('main').innerText()).includes('Supabase'));
    await noOverflow(page);
    await capture(page,`${name}-admin`);
    assert.deepEqual(errors,[]);
    await context.close();
  }
  console.log(results.join('\n'));
} finally { await browser.close(); }
