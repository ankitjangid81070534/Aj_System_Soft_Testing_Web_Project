/** Read-only, repeatable lab samples; not field CWV or a Lighthouse TBT score.
 * APP_URL defaults to dev; use an isolated production server for comparisons.
 * Never submits forms, changes remote records or bypasses authentication. */
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const samples = [];
try {
  for (const width of [390, 981, 1440]) {
    for (const route of ['/', '/login']) {
      for (let run = 0; run < 3; run++) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
        await context.addInitScript(() => {
          window.__finishingMetrics = { lcp: 0, cls: 0, blocking: 0, tasks: 0 };
          for (const type of ['largest-contentful-paint', 'layout-shift', 'longtask']) {
            new PerformanceObserver(list => {
              for (const e of list.getEntries()) {
                const m = window.__finishingMetrics;
                if (type === 'largest-contentful-paint') m.lcp = e.startTime;
                if (type === 'layout-shift' && !e.hadRecentInput) m.cls += e.value;
                if (type === 'longtask') { m.tasks++; m.blocking += Math.max(0, e.duration - 50); }
              }
            }).observe({ type, buffered: true });
          }
        });
        const page = await context.newPage();
        await page.goto((process.env.APP_URL || 'http://localhost:3000') + route);
        await page.locator('main h1').waitFor();
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(Array.from(document.images).filter(i => i.getBoundingClientRect().top < innerHeight).map(i => i.decode().catch(() => {})));
          await Promise.all(document.getAnimations().filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished.catch(() => {})));
        });
        samples.push(await page.evaluate(({ width, route, run }) => {
          const resources = performance.getEntriesByType('resource');
          const bytes = filter => resources.filter(filter).reduce((sum, e) => sum + e.encodedBodySize, 0);
          return { width, route, run, ...window.__finishingMetrics, jsBytes: bytes(e => /\.js(?:\?|$)/.test(e.name)), imageBytes: bytes(e => e.initiatorType === 'img' || /\/_next\/image/.test(e.name)), overflow: document.documentElement.scrollWidth > innerWidth + 1, h1: document.querySelectorAll('h1').length };
        }, { width, route, run }));
        await context.close();
      }
    }
  }
  console.log(JSON.stringify(samples, null, 2));
} finally { await browser.close(); }
