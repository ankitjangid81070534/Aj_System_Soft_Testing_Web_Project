# Initial production run — incomplete

The first run hit the shell tool's 300-second timeout. No complete suite totals were returned. These contexts reproduce the pre-fix browser-back issue; they are not final results.

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 1024 / no-preference
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="mobile"]').locator('summary')

```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - main [ref=f4e2]:
    - heading "Something went wrong" [level=1] [ref=f4e3]
    - paragraph [ref=f4e4]: An unexpected error occurred. Please try again.
    - button "Try again" [ref=f4e5]
  - alert [ref=f4e6]
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
  20  |         await choice.locator("summary").click();
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
> 33  |       await mobile.locator("summary").click();
      |                                       ^ Error: locator.click: Test timeout of 90000ms exceeded.
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 1024 / reduce
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="erp"]').locator('summary')
    - locator resolved to <summary class="min-h-14 cursor-pointer rounded-2xl p-4 text-sm font-semibold text-ink marker:text-brand-600 focus-ring">…</summary>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - heading "Something went wrong" [level=1] [ref=e3]
    - paragraph [ref=e4]: An unexpected error occurred. Please try again.
    - button "Try again" [ref=e5]
  - alert [ref=e6]
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
> 20  |         await choice.locator("summary").click();
      |                                         ^ Error: locator.click: Test timeout of 90000ms exceeded.
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
  33  |       await mobile.locator("summary").click();
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 320 / no-preference
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="mobile"]').locator('summary')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e5]:
      - generic [ref=e6]:
        - link "AJ System Soft Technology — home" [ref=e7] [cursor=pointer]:
          - /url: /
          - generic [ref=e8]: AJ
          - generic [ref=e9]: AJ System Soft Technology
        - link "Start Project" [ref=e10] [cursor=pointer]:
          - /url: /request-quote
      - navigation "Main" [ref=e15]:
        - generic [ref=e16]:
          - link "Home" [ref=e17] [cursor=pointer]:
            - /url: /
          - link "Services" [ref=e22] [cursor=pointer]:
            - /url: /services
          - button "More navigation options" [ref=e29] [cursor=pointer]:
            - generic [ref=e32]: More
          - link "Projects" [ref=e33] [cursor=pointer]:
            - /url: /projects
          - link "Contact" [ref=e39] [cursor=pointer]:
            - /url: /contact
    - main [ref=e43]:
      - generic [ref=e44]:
        - navigation "Breadcrumb" [ref=e45]:
          - list [ref=e46]:
            - listitem [ref=e47]:
              - link "Home" [ref=e48] [cursor=pointer]:
                - /url: /
            - listitem [ref=e51]:
              - generic [ref=e52]: Request a Quote
        - generic [ref=e54]:
          - paragraph [ref=e55]: Start your project
          - heading "Request a quote" [level=1] [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]: Request a quote
              - generic [ref=e60]:
                - generic [ref=e61]: Request
                - generic [ref=e63]: a
                - generic [ref=e65]: quote
          - paragraph [ref=e67]: Tell us what you need — AJS Technology replies with a practical plan, the right platform and a transparent estimate. Only the marked fields are required; the rest help us prepare a sharper first response.
        - generic [ref=e69]:
          - generic [ref=e70]:
            - text: Website
            - textbox [ref=e71]
          - group "1 · About you" [ref=e72]:
            - generic [ref=e74]:
              - generic [ref=e75]:
                - generic [ref=e76]: Full name*
                - textbox "Full name" [ref=e77]
              - generic [ref=e78]:
                - generic [ref=e79]: Company / business (optional)
                - textbox "Company / business (optional)" [ref=e80]
              - generic [ref=e81]:
                - generic [ref=e82]: Email*
                - textbox "Email" [ref=e83]
              - generic [ref=e84]:
                - generic [ref=e85]: Phone (optional)
                - textbox "Phone (optional)" [ref=e86]
              - generic [ref=e87]:
                - generic [ref=e88]: WhatsApp (optional)
                - textbox "WhatsApp (optional)" [ref=e89]
              - generic [ref=e90]:
                - generic [ref=e91]: Location / city (optional)
                - textbox "Location / city (optional)" [ref=e92]
          - group "2 · About the project" [ref=e93]:
            - generic [ref=e95]:
              - generic [ref=e96]:
                - generic [ref=e97]: Project type
                - combobox "Project type" [ref=e98]:
                  - option "Select a type…" [disabled] [selected]
                  - option "Business website"
                  - option "Web application / portal"
                  - option "SaaS product"
                  - option "Mobile app (Android / iOS)"
                  - option "Windows desktop software"
                  - option "ERP / CRM / business system"
                  - option "POS / billing / inventory"
                  - option "Hospital / clinic software"
                  - option "Pharmacy software"
                  - option "Hotel software"
                  - option "API / integration work"
                  - option "Existing software maintenance"
                  - option "Something else"
                - paragraph [ref=e99]: Pick the closest match.
              - generic [ref=e100]:
                - generic [ref=e101]: Target platform
                - combobox "Target platform" [ref=e102]:
                  - option "Select a platform…" [disabled] [selected]
                  - option "Web"
                  - option "Web + mobile"
                  - option "Android"
                  - option "iOS"
                  - option "Windows desktop"
                  - option "Not sure — advise me"
              - generic [ref=e103]:
                - generic [ref=e104]: Industry
                - combobox "Industry" [ref=e105]:
                  - option "Select an industry…" [disabled] [selected]
                  - option "Retail & shops"
                  - option "Healthcare & clinics"
                  - option "Pharmacy"
                  - option "Hospitality (hotels/restaurants)"
                  - option "Manufacturing"
                  - option "Logistics & distribution"
                  - option "Education"
                  - option "Professional services"
                  - option "Other"
              - generic [ref=e106]:
                - generic [ref=e107]: Budget range (optional)
                - combobox "Budget range (optional)" [ref=e108]:
                  - option "Select a range…" [disabled] [selected]
                  - option "Under ₹50,000"
                  - option "₹50,000 – ₹2,00,000"
                  - option "₹2,00,000 – ₹5,00,000"
                  - option "₹5,00,000+"
                  - option "Not sure yet"
              - generic [ref=e109]:
                - generic [ref=e110]: Timeline (optional)
                - combobox "Timeline (optional)" [ref=e111]:
                  - option "Select a timeline…" [disabled] [selected]
                  - option "ASAP"
                  - option "Within 1 month"
                  - option "1–3 months"
                  - option "3–6 months"
                  - option "Just exploring"
              - generic [ref=e112]:
                - generic [ref=e113]: Preferred contact method
                - combobox "Preferred contact method" [ref=e114]:
                  - option "Email" [selected]
                  - option "Phone call"
                  - option "WhatsApp"
            - generic [ref=e115]:
              - generic [ref=e116]: Project requirements*
              - textbox "Project requirements" [ref=e117]
              - paragraph [ref=e118]: What should the software do? Who will use it? What problems should it solve?
            - generic [ref=e119]:
              - generic [ref=e120]: Attachment (optional)
              - button "Attachment (optional)" [ref=e121]
              - paragraph [ref=e122]: PDF, image or Word file, up to 10 MB — e.g. an existing spec or scope document.
          - group "3 · Consent" [ref=e123]:
            - generic [ref=e125]:
              - checkbox "I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties." [ref=e126]
              - generic [ref=e127]: I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties.
            - generic [ref=e128]:
              - checkbox "I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies. View Agreement" [ref=e129]
              - generic [ref=e130]:
                - text: I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies.
                - link "View Agreement" [ref=e131] [cursor=pointer]:
                  - /url: /service-agreement
          - button "Request a quote" [ref=e133]
    - contentinfo [ref=e139]:
      - region [ref=e140]:
        - generic [ref=e141]: Let's create together
        - heading [level=2] [ref=e142]:
          - strong [ref=e143]: Software built
          - text: around your requirements.
        - paragraph [ref=e144]: Tell us what your business needs. We will shape the right software, a clear plan and a transparent estimate around your workflow.
        - link "Start Your Project" [ref=e145] [cursor=pointer]:
          - /url: /request-quote
      - generic [ref=e151]:
        - generic [ref=e152]:
          - generic [ref=e153]:
            - link "AJ System Soft Technology" [ref=e154] [cursor=pointer]:
              - /url: /
              - generic [ref=e155]: AJ
            - paragraph [ref=e157]: Software built around your requirements. Custom software, SaaS platforms, web and mobile apps, desktop software and industry-specific business systems.
          - navigation "Build" [ref=e158]:
            - paragraph [ref=e159]: Build
            - list [ref=e160]:
              - listitem [ref=e161]:
                - link "Services" [ref=e162] [cursor=pointer]:
                  - /url: /services
              - listitem [ref=e163]:
                - link "Projects" [ref=e164] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e165]:
                - link "Blog & Insights" [ref=e166] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e167]:
                - link "Request a Quote" [ref=e168] [cursor=pointer]:
                  - /url: /request-quote
          - navigation "Company" [ref=e169]:
            - paragraph [ref=e170]: Company
            - list [ref=e171]:
              - listitem [ref=e172]:
                - link "About Us" [ref=e173] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e174]:
                - link "Team" [ref=e175] [cursor=pointer]:
                  - /url: /team
              - listitem [ref=e176]:
                - link "Verified Reviews" [ref=e177] [cursor=pointer]:
                  - /url: /reviews
              - listitem [ref=e178]:
                - link "Contact" [ref=e179] [cursor=pointer]:
                  - /url: /contact
          - navigation "Portal & Legal" [ref=e180]:
            - paragraph [ref=e181]: Portal & Legal
            - list [ref=e182]:
              - listitem [ref=e183]:
                - link "Client Login" [ref=e184] [cursor=pointer]:
                  - /url: /login
              - listitem [ref=e185]:
                - link "Service Agreement" [ref=e186] [cursor=pointer]:
                  - /url: /service-agreement
              - listitem [ref=e187]:
                - link "Privacy Policy" [ref=e188] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e189]:
                - link "Terms of Service" [ref=e190] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e191]:
                - link "Disclaimer" [ref=e192] [cursor=pointer]:
                  - /url: /disclaimer
        - generic [ref=e193]: AJS Technology
        - generic [ref=e194]:
          - paragraph [ref=e195]: "© 2026 Ankit System Soft Technology. All rights reserved. | An MSME Registered Enterprise | Udyam Reg No: UDYAM-RJ-17-0685557"
          - paragraph [ref=e196]: Software built around your requirements.
  - alert [ref=e197]: Request a Quote | AJ System Soft Technology
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
  20  |         await choice.locator("summary").click();
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
> 33  |       await mobile.locator("summary").click();
      |                                       ^ Error: locator.click: Test timeout of 90000ms exceeded.
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 320 / reduce
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="mobile"]').locator('summary')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e5]:
      - generic [ref=e6]:
        - link "AJ System Soft Technology — home" [ref=e7] [cursor=pointer]:
          - /url: /
          - generic [ref=e8]: AJ
          - generic [ref=e9]: AJ System Soft Technology
        - link "Start Project" [ref=e10] [cursor=pointer]:
          - /url: /request-quote
      - navigation "Main" [ref=e15]:
        - generic [ref=e16]:
          - link "Home" [ref=e17] [cursor=pointer]:
            - /url: /
          - link "Services" [ref=e22] [cursor=pointer]:
            - /url: /services
          - button "More navigation options" [ref=e29] [cursor=pointer]:
            - generic [ref=e32]: More
          - link "Projects" [ref=e33] [cursor=pointer]:
            - /url: /projects
          - link "Contact" [ref=e39] [cursor=pointer]:
            - /url: /contact
    - main [ref=e43]:
      - generic [ref=e44]:
        - navigation "Breadcrumb" [ref=e45]:
          - list [ref=e46]:
            - listitem [ref=e47]:
              - link "Home" [ref=e48] [cursor=pointer]:
                - /url: /
            - listitem [ref=e51]:
              - generic [ref=e52]: Request a Quote
        - generic [ref=e54]:
          - paragraph [ref=e55]: Start your project
          - heading "Request a quote" [level=1] [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]: Request a quote
              - generic [ref=e60]:
                - generic [ref=e61]: Request
                - generic [ref=e63]: a
                - generic [ref=e65]: quote
          - paragraph [ref=e67]: Tell us what you need — AJS Technology replies with a practical plan, the right platform and a transparent estimate. Only the marked fields are required; the rest help us prepare a sharper first response.
        - generic [ref=e69]:
          - generic [ref=e70]:
            - text: Website
            - textbox [ref=e71]
          - group "1 · About you" [ref=e72]:
            - generic [ref=e74]:
              - generic [ref=e75]:
                - generic [ref=e76]: Full name*
                - textbox "Full name" [ref=e77]
              - generic [ref=e78]:
                - generic [ref=e79]: Company / business (optional)
                - textbox "Company / business (optional)" [ref=e80]
              - generic [ref=e81]:
                - generic [ref=e82]: Email*
                - textbox "Email" [ref=e83]
              - generic [ref=e84]:
                - generic [ref=e85]: Phone (optional)
                - textbox "Phone (optional)" [ref=e86]
              - generic [ref=e87]:
                - generic [ref=e88]: WhatsApp (optional)
                - textbox "WhatsApp (optional)" [ref=e89]
              - generic [ref=e90]:
                - generic [ref=e91]: Location / city (optional)
                - textbox "Location / city (optional)" [ref=e92]
          - group "2 · About the project" [ref=e93]:
            - generic [ref=e95]:
              - generic [ref=e96]:
                - generic [ref=e97]: Project type
                - combobox "Project type" [ref=e98]:
                  - option "Select a type…" [disabled] [selected]
                  - option "Business website"
                  - option "Web application / portal"
                  - option "SaaS product"
                  - option "Mobile app (Android / iOS)"
                  - option "Windows desktop software"
                  - option "ERP / CRM / business system"
                  - option "POS / billing / inventory"
                  - option "Hospital / clinic software"
                  - option "Pharmacy software"
                  - option "Hotel software"
                  - option "API / integration work"
                  - option "Existing software maintenance"
                  - option "Something else"
                - paragraph [ref=e99]: Pick the closest match.
              - generic [ref=e100]:
                - generic [ref=e101]: Target platform
                - combobox "Target platform" [ref=e102]:
                  - option "Select a platform…" [disabled] [selected]
                  - option "Web"
                  - option "Web + mobile"
                  - option "Android"
                  - option "iOS"
                  - option "Windows desktop"
                  - option "Not sure — advise me"
              - generic [ref=e103]:
                - generic [ref=e104]: Industry
                - combobox "Industry" [ref=e105]:
                  - option "Select an industry…" [disabled] [selected]
                  - option "Retail & shops"
                  - option "Healthcare & clinics"
                  - option "Pharmacy"
                  - option "Hospitality (hotels/restaurants)"
                  - option "Manufacturing"
                  - option "Logistics & distribution"
                  - option "Education"
                  - option "Professional services"
                  - option "Other"
              - generic [ref=e106]:
                - generic [ref=e107]: Budget range (optional)
                - combobox "Budget range (optional)" [ref=e108]:
                  - option "Select a range…" [disabled] [selected]
                  - option "Under ₹50,000"
                  - option "₹50,000 – ₹2,00,000"
                  - option "₹2,00,000 – ₹5,00,000"
                  - option "₹5,00,000+"
                  - option "Not sure yet"
              - generic [ref=e109]:
                - generic [ref=e110]: Timeline (optional)
                - combobox "Timeline (optional)" [ref=e111]:
                  - option "Select a timeline…" [disabled] [selected]
                  - option "ASAP"
                  - option "Within 1 month"
                  - option "1–3 months"
                  - option "3–6 months"
                  - option "Just exploring"
              - generic [ref=e112]:
                - generic [ref=e113]: Preferred contact method
                - combobox "Preferred contact method" [ref=e114]:
                  - option "Email" [selected]
                  - option "Phone call"
                  - option "WhatsApp"
            - generic [ref=e115]:
              - generic [ref=e116]: Project requirements*
              - textbox "Project requirements" [ref=e117]
              - paragraph [ref=e118]: What should the software do? Who will use it? What problems should it solve?
            - generic [ref=e119]:
              - generic [ref=e120]: Attachment (optional)
              - button "Attachment (optional)" [ref=e121]
              - paragraph [ref=e122]: PDF, image or Word file, up to 10 MB — e.g. an existing spec or scope document.
          - group "3 · Consent" [ref=e123]:
            - generic [ref=e125]:
              - checkbox "I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties." [ref=e126]
              - generic [ref=e127]: I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties.
            - generic [ref=e128]:
              - checkbox "I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies. View Agreement" [ref=e129]
              - generic [ref=e130]:
                - text: I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies.
                - link "View Agreement" [ref=e131] [cursor=pointer]:
                  - /url: /service-agreement
          - button "Request a quote" [ref=e133]
    - contentinfo [ref=e139]:
      - region [ref=e140]:
        - generic [ref=e141]: Let's create together
        - heading [level=2] [ref=e142]:
          - strong [ref=e143]: Software built
          - text: around your requirements.
        - paragraph [ref=e144]: Tell us what your business needs. We will shape the right software, a clear plan and a transparent estimate around your workflow.
        - link "Start Your Project" [ref=e145] [cursor=pointer]:
          - /url: /request-quote
      - generic [ref=e151]:
        - generic [ref=e152]:
          - generic [ref=e153]:
            - link "AJ System Soft Technology" [ref=e154] [cursor=pointer]:
              - /url: /
              - generic [ref=e155]: AJ
            - paragraph [ref=e157]: Software built around your requirements. Custom software, SaaS platforms, web and mobile apps, desktop software and industry-specific business systems.
          - navigation "Build" [ref=e158]:
            - paragraph [ref=e159]: Build
            - list [ref=e160]:
              - listitem [ref=e161]:
                - link "Services" [ref=e162] [cursor=pointer]:
                  - /url: /services
              - listitem [ref=e163]:
                - link "Projects" [ref=e164] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e165]:
                - link "Blog & Insights" [ref=e166] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e167]:
                - link "Request a Quote" [ref=e168] [cursor=pointer]:
                  - /url: /request-quote
          - navigation "Company" [ref=e169]:
            - paragraph [ref=e170]: Company
            - list [ref=e171]:
              - listitem [ref=e172]:
                - link "About Us" [ref=e173] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e174]:
                - link "Team" [ref=e175] [cursor=pointer]:
                  - /url: /team
              - listitem [ref=e176]:
                - link "Verified Reviews" [ref=e177] [cursor=pointer]:
                  - /url: /reviews
              - listitem [ref=e178]:
                - link "Contact" [ref=e179] [cursor=pointer]:
                  - /url: /contact
          - navigation "Portal & Legal" [ref=e180]:
            - paragraph [ref=e181]: Portal & Legal
            - list [ref=e182]:
              - listitem [ref=e183]:
                - link "Client Login" [ref=e184] [cursor=pointer]:
                  - /url: /login
              - listitem [ref=e185]:
                - link "Service Agreement" [ref=e186] [cursor=pointer]:
                  - /url: /service-agreement
              - listitem [ref=e187]:
                - link "Privacy Policy" [ref=e188] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e189]:
                - link "Terms of Service" [ref=e190] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e191]:
                - link "Disclaimer" [ref=e192] [cursor=pointer]:
                  - /url: /disclaimer
        - generic [ref=e193]: AJS Technology
        - generic [ref=e194]:
          - paragraph [ref=e195]: "© 2026 Ankit System Soft Technology. All rights reserved. | An MSME Registered Enterprise | Udyam Reg No: UDYAM-RJ-17-0685557"
          - paragraph [ref=e196]: Software built around your requirements.
  - alert [ref=e197]: Request a Quote | AJ System Soft Technology
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
  20  |         await choice.locator("summary").click();
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
> 33  |       await mobile.locator("summary").click();
      |                                       ^ Error: locator.click: Test timeout of 90000ms exceeded.
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 390 / no-preference
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="mobile"]').locator('summary')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e5]:
      - generic [ref=e6]:
        - link "AJ System Soft Technology — home" [ref=e7] [cursor=pointer]:
          - /url: /
          - generic [ref=e8]: AJ
          - generic [ref=e9]: AJ System Soft Technology
        - link "Start Project" [ref=e10] [cursor=pointer]:
          - /url: /request-quote
      - navigation "Main" [ref=e15]:
        - generic [ref=e16]:
          - link "Home" [ref=e17] [cursor=pointer]:
            - /url: /
          - link "Services" [ref=e22] [cursor=pointer]:
            - /url: /services
          - button "More navigation options" [ref=e29] [cursor=pointer]:
            - generic [ref=e32]: More
          - link "Projects" [ref=e33] [cursor=pointer]:
            - /url: /projects
          - link "Contact" [ref=e39] [cursor=pointer]:
            - /url: /contact
    - main [ref=e43]:
      - generic [ref=e44]:
        - navigation "Breadcrumb" [ref=e45]:
          - list [ref=e46]:
            - listitem [ref=e47]:
              - link "Home" [ref=e48] [cursor=pointer]:
                - /url: /
            - listitem [ref=e51]:
              - generic [ref=e52]: Request a Quote
        - generic [ref=e54]:
          - paragraph [ref=e55]: Start your project
          - heading "Request a quote" [level=1] [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]: Request a quote
              - generic [ref=e60]:
                - generic [ref=e61]: Request
                - generic [ref=e63]: a
                - generic [ref=e65]: quote
          - paragraph [ref=e67]: Tell us what you need — AJS Technology replies with a practical plan, the right platform and a transparent estimate. Only the marked fields are required; the rest help us prepare a sharper first response.
        - generic [ref=e69]:
          - generic [ref=e70]:
            - text: Website
            - textbox [ref=e71]
          - group "1 · About you" [ref=e72]:
            - generic [ref=e74]:
              - generic [ref=e75]:
                - generic [ref=e76]: Full name*
                - textbox "Full name" [ref=e77]
              - generic [ref=e78]:
                - generic [ref=e79]: Company / business (optional)
                - textbox "Company / business (optional)" [ref=e80]
              - generic [ref=e81]:
                - generic [ref=e82]: Email*
                - textbox "Email" [ref=e83]
              - generic [ref=e84]:
                - generic [ref=e85]: Phone (optional)
                - textbox "Phone (optional)" [ref=e86]
              - generic [ref=e87]:
                - generic [ref=e88]: WhatsApp (optional)
                - textbox "WhatsApp (optional)" [ref=e89]
              - generic [ref=e90]:
                - generic [ref=e91]: Location / city (optional)
                - textbox "Location / city (optional)" [ref=e92]
          - group "2 · About the project" [ref=e93]:
            - generic [ref=e95]:
              - generic [ref=e96]:
                - generic [ref=e97]: Project type
                - combobox "Project type" [ref=e98]:
                  - option "Select a type…" [disabled] [selected]
                  - option "Business website"
                  - option "Web application / portal"
                  - option "SaaS product"
                  - option "Mobile app (Android / iOS)"
                  - option "Windows desktop software"
                  - option "ERP / CRM / business system"
                  - option "POS / billing / inventory"
                  - option "Hospital / clinic software"
                  - option "Pharmacy software"
                  - option "Hotel software"
                  - option "API / integration work"
                  - option "Existing software maintenance"
                  - option "Something else"
                - paragraph [ref=e99]: Pick the closest match.
              - generic [ref=e100]:
                - generic [ref=e101]: Target platform
                - combobox "Target platform" [ref=e102]:
                  - option "Select a platform…" [disabled] [selected]
                  - option "Web"
                  - option "Web + mobile"
                  - option "Android"
                  - option "iOS"
                  - option "Windows desktop"
                  - option "Not sure — advise me"
              - generic [ref=e103]:
                - generic [ref=e104]: Industry
                - combobox "Industry" [ref=e105]:
                  - option "Select an industry…" [disabled] [selected]
                  - option "Retail & shops"
                  - option "Healthcare & clinics"
                  - option "Pharmacy"
                  - option "Hospitality (hotels/restaurants)"
                  - option "Manufacturing"
                  - option "Logistics & distribution"
                  - option "Education"
                  - option "Professional services"
                  - option "Other"
              - generic [ref=e106]:
                - generic [ref=e107]: Budget range (optional)
                - combobox "Budget range (optional)" [ref=e108]:
                  - option "Select a range…" [disabled] [selected]
                  - option "Under ₹50,000"
                  - option "₹50,000 – ₹2,00,000"
                  - option "₹2,00,000 – ₹5,00,000"
                  - option "₹5,00,000+"
                  - option "Not sure yet"
              - generic [ref=e109]:
                - generic [ref=e110]: Timeline (optional)
                - combobox "Timeline (optional)" [ref=e111]:
                  - option "Select a timeline…" [disabled] [selected]
                  - option "ASAP"
                  - option "Within 1 month"
                  - option "1–3 months"
                  - option "3–6 months"
                  - option "Just exploring"
              - generic [ref=e112]:
                - generic [ref=e113]: Preferred contact method
                - combobox "Preferred contact method" [ref=e114]:
                  - option "Email" [selected]
                  - option "Phone call"
                  - option "WhatsApp"
            - generic [ref=e115]:
              - generic [ref=e116]: Project requirements*
              - textbox "Project requirements" [ref=e117]
              - paragraph [ref=e118]: What should the software do? Who will use it? What problems should it solve?
            - generic [ref=e119]:
              - generic [ref=e120]: Attachment (optional)
              - button "Attachment (optional)" [ref=e121]
              - paragraph [ref=e122]: PDF, image or Word file, up to 10 MB — e.g. an existing spec or scope document.
          - group "3 · Consent" [ref=e123]:
            - generic [ref=e125]:
              - checkbox "I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties." [ref=e126]
              - generic [ref=e127]: I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties.
            - generic [ref=e128]:
              - checkbox "I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies. View Agreement" [ref=e129]
              - generic [ref=e130]:
                - text: I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies.
                - link "View Agreement" [ref=e131] [cursor=pointer]:
                  - /url: /service-agreement
          - button "Request a quote" [ref=e133]
    - contentinfo [ref=e139]:
      - region [ref=e140]:
        - generic [ref=e141]: Let's create together
        - heading [level=2] [ref=e142]:
          - strong [ref=e143]: Software built
          - text: around your requirements.
        - paragraph [ref=e144]: Tell us what your business needs. We will shape the right software, a clear plan and a transparent estimate around your workflow.
        - link "Start Your Project" [ref=e145] [cursor=pointer]:
          - /url: /request-quote
      - generic [ref=e151]:
        - generic [ref=e152]:
          - generic [ref=e153]:
            - link "AJ System Soft Technology" [ref=e154] [cursor=pointer]:
              - /url: /
              - generic [ref=e155]: AJ
            - paragraph [ref=e157]: Software built around your requirements. Custom software, SaaS platforms, web and mobile apps, desktop software and industry-specific business systems.
          - navigation "Build" [ref=e158]:
            - paragraph [ref=e159]: Build
            - list [ref=e160]:
              - listitem [ref=e161]:
                - link "Services" [ref=e162] [cursor=pointer]:
                  - /url: /services
              - listitem [ref=e163]:
                - link "Projects" [ref=e164] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e165]:
                - link "Blog & Insights" [ref=e166] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e167]:
                - link "Request a Quote" [ref=e168] [cursor=pointer]:
                  - /url: /request-quote
          - navigation "Company" [ref=e169]:
            - paragraph [ref=e170]: Company
            - list [ref=e171]:
              - listitem [ref=e172]:
                - link "About Us" [ref=e173] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e174]:
                - link "Team" [ref=e175] [cursor=pointer]:
                  - /url: /team
              - listitem [ref=e176]:
                - link "Verified Reviews" [ref=e177] [cursor=pointer]:
                  - /url: /reviews
              - listitem [ref=e178]:
                - link "Contact" [ref=e179] [cursor=pointer]:
                  - /url: /contact
          - navigation "Portal & Legal" [ref=e180]:
            - paragraph [ref=e181]: Portal & Legal
            - list [ref=e182]:
              - listitem [ref=e183]:
                - link "Client Login" [ref=e184] [cursor=pointer]:
                  - /url: /login
              - listitem [ref=e185]:
                - link "Service Agreement" [ref=e186] [cursor=pointer]:
                  - /url: /service-agreement
              - listitem [ref=e187]:
                - link "Privacy Policy" [ref=e188] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e189]:
                - link "Terms of Service" [ref=e190] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e191]:
                - link "Disclaimer" [ref=e192] [cursor=pointer]:
                  - /url: /disclaimer
        - generic [ref=e193]: AJS Technology
        - generic [ref=e194]:
          - paragraph [ref=e195]: "© 2026 Ankit System Soft Technology. All rights reserved. | An MSME Registered Enterprise | Udyam Reg No: UDYAM-RJ-17-0685557"
          - paragraph [ref=e196]: Software built around your requirements.
  - alert [ref=e197]: Request a Quote | AJ System Soft Technology
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
  20  |         await choice.locator("summary").click();
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
> 33  |       await mobile.locator("summary").click();
      |                                       ^ Error: locator.click: Test timeout of 90000ms exceeded.
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 390 / reduce
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="mobile"]').locator('summary')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e5]:
      - generic [ref=e6]:
        - link "AJ System Soft Technology — home" [ref=e7] [cursor=pointer]:
          - /url: /
          - generic [ref=e8]: AJ
          - generic [ref=e9]: AJ System Soft Technology
        - link "Start Project" [ref=e10] [cursor=pointer]:
          - /url: /request-quote
      - navigation "Main" [ref=e15]:
        - generic [ref=e16]:
          - link "Home" [ref=e17] [cursor=pointer]:
            - /url: /
          - link "Services" [ref=e22] [cursor=pointer]:
            - /url: /services
          - button "More navigation options" [ref=e29] [cursor=pointer]:
            - generic [ref=e32]: More
          - link "Projects" [ref=e33] [cursor=pointer]:
            - /url: /projects
          - link "Contact" [ref=e39] [cursor=pointer]:
            - /url: /contact
    - main [ref=e43]:
      - generic [ref=e44]:
        - navigation "Breadcrumb" [ref=e45]:
          - list [ref=e46]:
            - listitem [ref=e47]:
              - link "Home" [ref=e48] [cursor=pointer]:
                - /url: /
            - listitem [ref=e51]:
              - generic [ref=e52]: Request a Quote
        - generic [ref=e54]:
          - paragraph [ref=e55]: Start your project
          - heading "Request a quote" [level=1] [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]: Request a quote
              - generic [ref=e60]:
                - generic [ref=e61]: Request
                - generic [ref=e63]: a
                - generic [ref=e65]: quote
          - paragraph [ref=e67]: Tell us what you need — AJS Technology replies with a practical plan, the right platform and a transparent estimate. Only the marked fields are required; the rest help us prepare a sharper first response.
        - generic [ref=e69]:
          - generic [ref=e70]:
            - text: Website
            - textbox [ref=e71]
          - group "1 · About you" [ref=e72]:
            - generic [ref=e74]:
              - generic [ref=e75]:
                - generic [ref=e76]: Full name*
                - textbox "Full name" [ref=e77]
              - generic [ref=e78]:
                - generic [ref=e79]: Company / business (optional)
                - textbox "Company / business (optional)" [ref=e80]
              - generic [ref=e81]:
                - generic [ref=e82]: Email*
                - textbox "Email" [ref=e83]
              - generic [ref=e84]:
                - generic [ref=e85]: Phone (optional)
                - textbox "Phone (optional)" [ref=e86]
              - generic [ref=e87]:
                - generic [ref=e88]: WhatsApp (optional)
                - textbox "WhatsApp (optional)" [ref=e89]
              - generic [ref=e90]:
                - generic [ref=e91]: Location / city (optional)
                - textbox "Location / city (optional)" [ref=e92]
          - group "2 · About the project" [ref=e93]:
            - generic [ref=e95]:
              - generic [ref=e96]:
                - generic [ref=e97]: Project type
                - combobox "Project type" [ref=e98]:
                  - option "Select a type…" [disabled] [selected]
                  - option "Business website"
                  - option "Web application / portal"
                  - option "SaaS product"
                  - option "Mobile app (Android / iOS)"
                  - option "Windows desktop software"
                  - option "ERP / CRM / business system"
                  - option "POS / billing / inventory"
                  - option "Hospital / clinic software"
                  - option "Pharmacy software"
                  - option "Hotel software"
                  - option "API / integration work"
                  - option "Existing software maintenance"
                  - option "Something else"
                - paragraph [ref=e99]: Pick the closest match.
              - generic [ref=e100]:
                - generic [ref=e101]: Target platform
                - combobox "Target platform" [ref=e102]:
                  - option "Select a platform…" [disabled] [selected]
                  - option "Web"
                  - option "Web + mobile"
                  - option "Android"
                  - option "iOS"
                  - option "Windows desktop"
                  - option "Not sure — advise me"
              - generic [ref=e103]:
                - generic [ref=e104]: Industry
                - combobox "Industry" [ref=e105]:
                  - option "Select an industry…" [disabled] [selected]
                  - option "Retail & shops"
                  - option "Healthcare & clinics"
                  - option "Pharmacy"
                  - option "Hospitality (hotels/restaurants)"
                  - option "Manufacturing"
                  - option "Logistics & distribution"
                  - option "Education"
                  - option "Professional services"
                  - option "Other"
              - generic [ref=e106]:
                - generic [ref=e107]: Budget range (optional)
                - combobox "Budget range (optional)" [ref=e108]:
                  - option "Select a range…" [disabled] [selected]
                  - option "Under ₹50,000"
                  - option "₹50,000 – ₹2,00,000"
                  - option "₹2,00,000 – ₹5,00,000"
                  - option "₹5,00,000+"
                  - option "Not sure yet"
              - generic [ref=e109]:
                - generic [ref=e110]: Timeline (optional)
                - combobox "Timeline (optional)" [ref=e111]:
                  - option "Select a timeline…" [disabled] [selected]
                  - option "ASAP"
                  - option "Within 1 month"
                  - option "1–3 months"
                  - option "3–6 months"
                  - option "Just exploring"
              - generic [ref=e112]:
                - generic [ref=e113]: Preferred contact method
                - combobox "Preferred contact method" [ref=e114]:
                  - option "Email" [selected]
                  - option "Phone call"
                  - option "WhatsApp"
            - generic [ref=e115]:
              - generic [ref=e116]: Project requirements*
              - textbox "Project requirements" [ref=e117]
              - paragraph [ref=e118]: What should the software do? Who will use it? What problems should it solve?
            - generic [ref=e119]:
              - generic [ref=e120]: Attachment (optional)
              - button "Attachment (optional)" [ref=e121]
              - paragraph [ref=e122]: PDF, image or Word file, up to 10 MB — e.g. an existing spec or scope document.
          - group "3 · Consent" [ref=e123]:
            - generic [ref=e125]:
              - checkbox "I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties." [ref=e126]
              - generic [ref=e127]: I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties.
            - generic [ref=e128]:
              - checkbox "I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies. View Agreement" [ref=e129]
              - generic [ref=e130]:
                - text: I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies.
                - link "View Agreement" [ref=e131] [cursor=pointer]:
                  - /url: /service-agreement
          - button "Request a quote" [ref=e133]
    - contentinfo [ref=e139]:
      - region [ref=e140]:
        - generic [ref=e141]: Let's create together
        - heading [level=2] [ref=e142]:
          - strong [ref=e143]: Software built
          - text: around your requirements.
        - paragraph [ref=e144]: Tell us what your business needs. We will shape the right software, a clear plan and a transparent estimate around your workflow.
        - link "Start Your Project" [ref=e145] [cursor=pointer]:
          - /url: /request-quote
      - generic [ref=e151]:
        - generic [ref=e152]:
          - generic [ref=e153]:
            - link "AJ System Soft Technology" [ref=e154] [cursor=pointer]:
              - /url: /
              - generic [ref=e155]: AJ
            - paragraph [ref=e157]: Software built around your requirements. Custom software, SaaS platforms, web and mobile apps, desktop software and industry-specific business systems.
          - navigation "Build" [ref=e158]:
            - paragraph [ref=e159]: Build
            - list [ref=e160]:
              - listitem [ref=e161]:
                - link "Services" [ref=e162] [cursor=pointer]:
                  - /url: /services
              - listitem [ref=e163]:
                - link "Projects" [ref=e164] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e165]:
                - link "Blog & Insights" [ref=e166] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e167]:
                - link "Request a Quote" [ref=e168] [cursor=pointer]:
                  - /url: /request-quote
          - navigation "Company" [ref=e169]:
            - paragraph [ref=e170]: Company
            - list [ref=e171]:
              - listitem [ref=e172]:
                - link "About Us" [ref=e173] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e174]:
                - link "Team" [ref=e175] [cursor=pointer]:
                  - /url: /team
              - listitem [ref=e176]:
                - link "Verified Reviews" [ref=e177] [cursor=pointer]:
                  - /url: /reviews
              - listitem [ref=e178]:
                - link "Contact" [ref=e179] [cursor=pointer]:
                  - /url: /contact
          - navigation "Portal & Legal" [ref=e180]:
            - paragraph [ref=e181]: Portal & Legal
            - list [ref=e182]:
              - listitem [ref=e183]:
                - link "Client Login" [ref=e184] [cursor=pointer]:
                  - /url: /login
              - listitem [ref=e185]:
                - link "Service Agreement" [ref=e186] [cursor=pointer]:
                  - /url: /service-agreement
              - listitem [ref=e187]:
                - link "Privacy Policy" [ref=e188] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e189]:
                - link "Terms of Service" [ref=e190] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e191]:
                - link "Disclaimer" [ref=e192] [cursor=pointer]:
                  - /url: /disclaimer
        - generic [ref=e193]: AJS Technology
        - generic [ref=e194]:
          - paragraph [ref=e195]: "© 2026 Ankit System Soft Technology. All rights reserved. | An MSME Registered Enterprise | Udyam Reg No: UDYAM-RJ-17-0685557"
          - paragraph [ref=e196]: Software built around your requirements.
  - alert [ref=e197]: Request a Quote | AJ System Soft Technology
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
  20  |         await choice.locator("summary").click();
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
> 33  |       await mobile.locator("summary").click();
      |                                       ^ Error: locator.click: Test timeout of 90000ms exceeded.
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 662 / no-preference
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="mobile"]').locator('summary')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e5]:
      - generic [ref=e6]:
        - link "AJ System Soft Technology — home" [ref=e7] [cursor=pointer]:
          - /url: /
          - generic [ref=e8]: AJ
          - generic [ref=e9]: AJ System Soft Technology
        - link "Start Project" [ref=e10] [cursor=pointer]:
          - /url: /request-quote
      - navigation "Main" [ref=e15]:
        - generic [ref=e16]:
          - link "Home" [ref=e17] [cursor=pointer]:
            - /url: /
          - link "Services" [ref=e22] [cursor=pointer]:
            - /url: /services
          - button "More navigation options" [ref=e29] [cursor=pointer]:
            - generic [ref=e32]: More
          - link "Projects" [ref=e33] [cursor=pointer]:
            - /url: /projects
          - link "Contact" [ref=e39] [cursor=pointer]:
            - /url: /contact
    - main [ref=e43]:
      - generic [ref=e44]:
        - navigation "Breadcrumb" [ref=e45]:
          - list [ref=e46]:
            - listitem [ref=e47]:
              - link "Home" [ref=e48] [cursor=pointer]:
                - /url: /
            - listitem [ref=e51]:
              - generic [ref=e52]: Request a Quote
        - generic [ref=e54]:
          - paragraph [ref=e55]: Start your project
          - heading "Request a quote" [level=1] [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]: Request a quote
              - generic [ref=e60]:
                - generic [ref=e61]: Request
                - generic [ref=e63]: a
                - generic [ref=e65]: quote
          - paragraph [ref=e67]: Tell us what you need — AJS Technology replies with a practical plan, the right platform and a transparent estimate. Only the marked fields are required; the rest help us prepare a sharper first response.
        - generic [ref=e69]:
          - generic [ref=e70]:
            - text: Website
            - textbox [ref=e71]
          - group "1 · About you" [ref=e72]:
            - generic [ref=e74]:
              - generic [ref=e75]:
                - generic [ref=e76]: Full name*
                - textbox "Full name" [ref=e77]
              - generic [ref=e78]:
                - generic [ref=e79]: Company / business (optional)
                - textbox "Company / business (optional)" [ref=e80]
              - generic [ref=e81]:
                - generic [ref=e82]: Email*
                - textbox "Email" [ref=e83]
              - generic [ref=e84]:
                - generic [ref=e85]: Phone (optional)
                - textbox "Phone (optional)" [ref=e86]
              - generic [ref=e87]:
                - generic [ref=e88]: WhatsApp (optional)
                - textbox "WhatsApp (optional)" [ref=e89]
              - generic [ref=e90]:
                - generic [ref=e91]: Location / city (optional)
                - textbox "Location / city (optional)" [ref=e92]
          - group "2 · About the project" [ref=e93]:
            - generic [ref=e95]:
              - generic [ref=e96]:
                - generic [ref=e97]: Project type
                - combobox "Project type" [ref=e98]:
                  - option "Select a type…" [disabled] [selected]
                  - option "Business website"
                  - option "Web application / portal"
                  - option "SaaS product"
                  - option "Mobile app (Android / iOS)"
                  - option "Windows desktop software"
                  - option "ERP / CRM / business system"
                  - option "POS / billing / inventory"
                  - option "Hospital / clinic software"
                  - option "Pharmacy software"
                  - option "Hotel software"
                  - option "API / integration work"
                  - option "Existing software maintenance"
                  - option "Something else"
                - paragraph [ref=e99]: Pick the closest match.
              - generic [ref=e100]:
                - generic [ref=e101]: Target platform
                - combobox "Target platform" [ref=e102]:
                  - option "Select a platform…" [disabled] [selected]
                  - option "Web"
                  - option "Web + mobile"
                  - option "Android"
                  - option "iOS"
                  - option "Windows desktop"
                  - option "Not sure — advise me"
              - generic [ref=e103]:
                - generic [ref=e104]: Industry
                - combobox "Industry" [ref=e105]:
                  - option "Select an industry…" [disabled] [selected]
                  - option "Retail & shops"
                  - option "Healthcare & clinics"
                  - option "Pharmacy"
                  - option "Hospitality (hotels/restaurants)"
                  - option "Manufacturing"
                  - option "Logistics & distribution"
                  - option "Education"
                  - option "Professional services"
                  - option "Other"
              - generic [ref=e106]:
                - generic [ref=e107]: Budget range (optional)
                - combobox "Budget range (optional)" [ref=e108]:
                  - option "Select a range…" [disabled] [selected]
                  - option "Under ₹50,000"
                  - option "₹50,000 – ₹2,00,000"
                  - option "₹2,00,000 – ₹5,00,000"
                  - option "₹5,00,000+"
                  - option "Not sure yet"
              - generic [ref=e109]:
                - generic [ref=e110]: Timeline (optional)
                - combobox "Timeline (optional)" [ref=e111]:
                  - option "Select a timeline…" [disabled] [selected]
                  - option "ASAP"
                  - option "Within 1 month"
                  - option "1–3 months"
                  - option "3–6 months"
                  - option "Just exploring"
              - generic [ref=e112]:
                - generic [ref=e113]: Preferred contact method
                - combobox "Preferred contact method" [ref=e114]:
                  - option "Email" [selected]
                  - option "Phone call"
                  - option "WhatsApp"
            - generic [ref=e115]:
              - generic [ref=e116]: Project requirements*
              - textbox "Project requirements" [ref=e117]
              - paragraph [ref=e118]: What should the software do? Who will use it? What problems should it solve?
            - generic [ref=e119]:
              - generic [ref=e120]: Attachment (optional)
              - button "Attachment (optional)" [ref=e121]
              - paragraph [ref=e122]: PDF, image or Word file, up to 10 MB — e.g. an existing spec or scope document.
          - group "3 · Consent" [ref=e123]:
            - generic [ref=e125]:
              - checkbox "I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties." [ref=e126]
              - generic [ref=e127]: I agree that AJ System Soft Technology may use these details to respond to my enquiry. No marketing lists, no sharing with third parties.
            - generic [ref=e128]:
              - checkbox "I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies. View Agreement" [ref=e129]
              - generic [ref=e130]:
                - text: I have read and agree to the current AJ System Soft Technology Service Agreement and applicable policies.
                - link "View Agreement" [ref=e131] [cursor=pointer]:
                  - /url: /service-agreement
          - button "Request a quote" [ref=e133]
    - contentinfo [ref=e139]:
      - region [ref=e140]:
        - generic [ref=e141]: Let's create together
        - heading [level=2] [ref=e142]:
          - strong [ref=e143]: Software built
          - text: around your requirements.
        - paragraph [ref=e144]: Tell us what your business needs. We will shape the right software, a clear plan and a transparent estimate around your workflow.
        - link "Start Your Project" [ref=e145] [cursor=pointer]:
          - /url: /request-quote
      - generic [ref=e151]:
        - generic [ref=e152]:
          - generic [ref=e153]:
            - link "AJ System Soft Technology" [ref=e154] [cursor=pointer]:
              - /url: /
              - generic [ref=e155]: AJ
            - paragraph [ref=e157]: Software built around your requirements. Custom software, SaaS platforms, web and mobile apps, desktop software and industry-specific business systems.
          - navigation "Build" [ref=e158]:
            - paragraph [ref=e159]: Build
            - list [ref=e160]:
              - listitem [ref=e161]:
                - link "Services" [ref=e162] [cursor=pointer]:
                  - /url: /services
              - listitem [ref=e163]:
                - link "Projects" [ref=e164] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e165]:
                - link "Blog & Insights" [ref=e166] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e167]:
                - link "Request a Quote" [ref=e168] [cursor=pointer]:
                  - /url: /request-quote
          - navigation "Company" [ref=e169]:
            - paragraph [ref=e170]: Company
            - list [ref=e171]:
              - listitem [ref=e172]:
                - link "About Us" [ref=e173] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e174]:
                - link "Team" [ref=e175] [cursor=pointer]:
                  - /url: /team
              - listitem [ref=e176]:
                - link "Verified Reviews" [ref=e177] [cursor=pointer]:
                  - /url: /reviews
              - listitem [ref=e178]:
                - link "Contact" [ref=e179] [cursor=pointer]:
                  - /url: /contact
          - navigation "Portal & Legal" [ref=e180]:
            - paragraph [ref=e181]: Portal & Legal
            - list [ref=e182]:
              - listitem [ref=e183]:
                - link "Client Login" [ref=e184] [cursor=pointer]:
                  - /url: /login
              - listitem [ref=e185]:
                - link "Service Agreement" [ref=e186] [cursor=pointer]:
                  - /url: /service-agreement
              - listitem [ref=e187]:
                - link "Privacy Policy" [ref=e188] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e189]:
                - link "Terms of Service" [ref=e190] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e191]:
                - link "Disclaimer" [ref=e192] [cursor=pointer]:
                  - /url: /disclaimer
        - generic [ref=e193]: AJS Technology
        - generic [ref=e194]:
          - paragraph [ref=e195]: "© 2026 Ankit System Soft Technology. All rights reserved. | An MSME Registered Enterprise | Udyam Reg No: UDYAM-RJ-17-0685557"
          - paragraph [ref=e196]: Software built around your requirements.
  - alert [ref=e197]: Request a Quote | AJ System Soft Technology
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
  20  |         await choice.locator("summary").click();
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
> 33  |       await mobile.locator("summary").click();
      |                                       ^ Error: locator.click: Test timeout of 90000ms exceeded.
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 662 / reduce
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="industry"]').locator('summary')
    - locator resolved to <summary class="min-h-14 cursor-pointer rounded-2xl p-4 text-sm font-semibold text-ink marker:text-brand-600 focus-ring">…</summary>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - heading "Something went wrong" [level=1] [ref=e3]
    - paragraph [ref=e4]: An unexpected error occurred. Please try again.
    - button "Try again" [ref=e5]
  - alert [ref=e6]
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
> 20  |         await choice.locator("summary").click();
      |                                         ^ Error: locator.click: Test timeout of 90000ms exceeded.
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
  33  |       await mobile.locator("summary").click();
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 820 / no-preference
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="website"]').locator('summary')
    - locator resolved to <summary class="min-h-14 cursor-pointer rounded-2xl p-4 text-sm font-semibold text-ink marker:text-brand-600 focus-ring">…</summary>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting 100ms
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - heading "Something went wrong" [level=1] [ref=e3]
    - paragraph [ref=e4]: An unexpected error occurred. Please try again.
    - button "Try again" [ref=e5]
  - alert [ref=e6]
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
> 20  |         await choice.locator("summary").click();
      |                                         ^ Error: locator.click: Test timeout of 90000ms exceeded.
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
  33  |       await mobile.locator("summary").click();
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/service-discovery.spec.ts >> service discovery at 820 / reduce
- Location: e2e/service-discovery.spec.ts:10:9

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-service-goal="mobile"]').locator('summary')

```

# Page snapshot

```yaml
- generic [active] [ref=f6e1]:
  - main [ref=f6e2]:
    - heading "Something went wrong" [level=1] [ref=f6e3]
    - paragraph [ref=f6e4]: An unexpected error occurred. Please try again.
    - button "Try again" [ref=f6e5]
  - alert [ref=f6e6]
```

# Test source

```ts
  1   | import { expect, test } from "playwright/test";
  2   | 
  3   | test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  4   | test.setTimeout(90_000);
  5   | 
  6   | const goals = ["website", "web-app", "business", "erp", "industry", "mobile", "saas", "desktop", "unsure"];
  7   | 
  8   | for (const [width, height] of [[320, 568], [390, 844], [662, 580], [820, 1180], [1024, 768], [1440, 900]]) {
  9   |   for (const reducedMotion of ["no-preference", "reduce"] as const) {
  10  |     test(`service discovery at ${width} / ${reducedMotion}`, async ({ page }) => {
  11  |       await page.setViewportSize({ width, height });
  12  |       await page.emulateMedia({ reducedMotion });
  13  |       await page.goto("/services", { waitUntil: "domcontentloaded" });
  14  |       await expect(page.locator("main h1")).toHaveText("Software services built around your requirements");
  15  |       await page.getByRole("link", { name: "Not sure? Find a service for your project" }).click();
  16  |       await expect(page).toHaveURL(/#service-matcher$/);
  17  |       await expect(page.locator("#service-matcher")).toBeInViewport();
  18  |       for (const goal of goals) {
  19  |         const choice = page.locator(`[data-service-goal="${goal}"]`);
  20  |         await choice.locator("summary").click();
  21  |         await expect(choice).toHaveAttribute("open", "");
  22  |         await expect(page.locator("[data-service-goal][open]")).toHaveCount(1);
  23  |         await expect(choice.locator("a").first()).toBeVisible();
  24  |         const summary = await choice.locator("summary").boundingBox();
  25  |         expect(summary!.height).toBeGreaterThanOrEqual(44);
  26  |         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  27  |       }
  28  |       await page.getByRole("link", { name: "Discuss your requirements", exact: true }).click();
  29  |       await expect(page).toHaveURL(/\/request-quote$/);
  30  |       await expect(page.locator("main form")).toBeVisible();
  31  |       await page.goBack();
  32  |       const mobile = page.locator('[data-service-goal="mobile"]');
> 33  |       await mobile.locator("summary").click();
      |                                       ^ Error: locator.click: Test timeout of 90000ms exceeded.
  34  |       await mobile.getByRole("link", { name: "Android App Development", exact: true }).click();
  35  |       await expect(page).toHaveURL(/\/services\/android-app-development$/);
  36  |       await expect(page.locator("main h1")).toHaveText("Android App Development");
  37  |       await page.goBack();
  38  |       await page.getByRole("link", { name: "Browse all services", exact: true }).click();
  39  |       await expect(page).toHaveURL(/#service-catalogue$/);
  40  |       await expect(page.locator("#service-catalogue")).toBeInViewport();
  41  |       const categories = page.getByRole("navigation", { name: "Service categories" }).getByRole("link");
  42  |       const links = await categories.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
  43  |       for (const href of links) {
  44  |         await page.getByRole("navigation", { name: "Service categories" }).locator(`a[href="${href}"]`).click();
  45  |         await expect(page.locator(href)).toBeInViewport();
  46  |       }
  47  |     });
  48  |   }
  49  | }
  50  | 
  51  | for (const width of [390, 1440]) {
  52  |   test(`native matcher works without JavaScript at ${width}`, async ({ browser, baseURL }) => {
  53  |     const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
  54  |     try {
  55  |       const page = await context.newPage();
  56  |       await page.goto(`${baseURL}/services`, { waitUntil: "domcontentloaded" });
  57  |       const choice = page.locator('[data-service-goal="website"]');
  58  |       await choice.locator("summary").click();
  59  |       await expect(choice).toHaveAttribute("open", "");
  60  |       await choice.getByRole("link", { name: "Website Development", exact: true }).click();
  61  |       await expect(page).toHaveURL(/\/services\/website-development$/);
  62  |       await expect(page.locator("main h1")).toHaveText("Website Development");
  63  |     } finally {
  64  |       await context.close();
  65  |     }
  66  |   });
  67  | }
  68  | 
  69  | test("keyboard can open, follow and collapse a choice", async ({ page }) => {
  70  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  71  |   const choice = page.locator('[data-service-goal="saas"]');
  72  |   const summary = choice.locator("summary");
  73  |   await summary.focus();
  74  |   await page.keyboard.press("Enter");
  75  |   await expect(choice).toHaveAttribute("open", "");
  76  |   await page.keyboard.press("Tab");
  77  |   await expect(choice.getByRole("link")).toBeFocused();
  78  |   await page.keyboard.press("Enter");
  79  |   await expect(page.locator("main h1")).toHaveText("SaaS Development");
  80  |   await page.goBack();
  81  |   // Browser history may restore the disclosure; establish open state via a real gesture if needed.
  82  |   if (!(await choice.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  83  |   await summary.focus();
  84  |   await page.keyboard.press("Space");
  85  |   await expect(choice).not.toHaveAttribute("open", "");
  86  | });
  87  | 
  88  | test("all catalogue cards preserve their detail and enquiry journeys", async ({ page }) => {
  89  |   await page.goto("/services", { waitUntil: "domcontentloaded" });
  90  |   const cards = page.locator("#service-catalogue a.card-3d");
  91  |   const services = await cards.evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute("href")!, name: element.querySelector("h3")!.textContent! })));
  92  |   expect(services).toHaveLength(15);
  93  |   for (const service of services) {
  94  |     await page.locator(`#service-catalogue a[href="${service.href}"]`).click();
  95  |     await expect(page.locator("main h1")).toHaveText(service.name);
  96  |     await page.getByRole("link", { name: "Discuss your project", exact: true }).click();
  97  |     await expect(page).toHaveURL(/\/request-quote$/);
  98  |     await expect(page.locator("main form")).toBeVisible();
  99  |     await page.goBack();
  100 |     await page.goBack();
  101 |   }
  102 | });
  103 | 
```