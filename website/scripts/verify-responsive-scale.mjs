import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Read-only responsive regression: real browser layout, no CSS/React overrides.
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const origin = process.env.APP_URL || 'http://localhost:3000';
try {
  for (const [width, height] of [[360,800],[393,852],[768,1024],[1024,768],[1280,800],[1440,900],[1920,1080],[2560,1440]]) {
    const page = await browser.newPage({ viewport: {width,height}, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, {waitUntil:'domcontentloaded'});
    await page.locator('h1').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(() => {
      const bounds = el => { const r = el.getBoundingClientRect(); return {left:r.left,right:r.right,width:r.width,height:r.height}; };
      const hero = document.querySelector('h1');
      const benefits = document.querySelector('#included');
      const platforms = document.querySelector('article.card-accent-blue');
      const grid = platforms?.closest('.max-w-content');
      const nav = document.querySelector('nav[aria-label="Main"]');
      const navVisible = getComputedStyle(nav).display !== 'none';
      const link = nav.querySelector('a');
      const header = document.querySelector('[data-site-header] .glass-strong');
      const children = [...header.children].filter(el=>getComputedStyle(el).display!=='none').map(bounds);
      return {
        width:innerWidth, pageWidth:document.documentElement.scrollWidth,
        hero:bounds(hero), heroSize:parseFloat(getComputedStyle(hero).fontSize),
        heroLineHeight:parseFloat(getComputedStyle(hero).lineHeight),
        gridWidth:grid?.clientWidth, cardBodySize:parseFloat(getComputedStyle(platforms.querySelector('p')).fontSize),
        navVisible, navFont:parseFloat(getComputedStyle(link).fontSize),
        headerOverlap:children.some((r,i)=>i>0 && r.left<children[i-1].right-1),
        benefitCount:benefits.querySelectorAll('article').length,
        order:benefits.nextElementSibling?.id === 'home-services',
        benefitOverflow:[...benefits.querySelectorAll('article h3, article p')].some(el=>el.scrollWidth>el.clientWidth+1),
      };
    });
    assert(metrics.pageWidth<=width+1, `horizontal overflow at ${width}`);
    assert(!metrics.headerOverlap, `header overlap at ${width}`);
    assert(metrics.order && metrics.benefitCount===6, `benefits changed at ${width}`);
    assert(!metrics.benefitOverflow, `benefit text overflow at ${width}`);
    if(width>=1024) {
      assert(metrics.cardBodySize>=16, `desktop body too small at ${width}`);
      assert(metrics.hero.height <= metrics.heroLineHeight*2+2, `hero exceeds two lines at ${width}`);
    }
    if(width>=1440) assert(metrics.navFont>=14, `navigation too small at ${width}`);
    if(width===1920) assert(metrics.gridWidth>=1500, 'large desktop grid too narrow');
    // Real delivery-stage gesture with state/description assertion.
    await page.getByRole('button',{name:/Proposal & planning/}).click();
    assert.equal(await page.getByRole('button',{name:/Proposal & planning/}).getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('#delivery-description').innerText(),/transparent estimate/);
    if(width<1024) {
      await page.getByRole('button',{name:'Open navigation menu'}).click();
      assert(await page.locator('#mobile-menu').isVisible());
      await page.keyboard.press('Escape');
      assert(!(await page.locator('#mobile-menu').isVisible()));
    }
    assert.deepEqual(errors,[], `runtime errors at ${width}`);
    console.log(JSON.stringify({...metrics,deliveryClick:'pass',mobileMenu:width<1024?'pass':'not applicable'}));
    await page.close();
  }
} finally { await browser.close(); }
