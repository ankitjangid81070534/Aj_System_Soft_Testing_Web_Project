import type { BlogPostFull } from "@/lib/data/blog";

/** Fallback articles carry plain tag names; blog.ts converts them to tag objects. */
export type FallbackPost = Omit<BlogPostFull, "tags"> & { tags: string[] };

/**
 * Starter insight articles — genuine, useful content written for this site
 * (not auto-generated filler, no fabricated facts or dates). They serve the
 * public blog until the team publishes through /ajadmin, which overrides
 * them. Author is the organisation itself.
 */

export const FALLBACK_POSTS: FallbackPost[] = [
  {
    id: "fallback-planning-custom-software",
    slug: "how-to-plan-a-custom-software-project",
    title: "How to plan a custom software project",
    excerpt:
      "A practical checklist for the first four weeks of a custom software project — before a single line of code is written.",
    content: `Most software projects do not fail in the code; they fail in the planning. Here is the sequence we take every client through before development starts.

## Write down the actual workflow

Not the idealised version — the real one, including the spreadsheet someone keeps privately and the WhatsApp group where orders actually happen. Custom software should automate what you truly do, not what a consultant imagines you do.

## Separate must-haves from nice-to-haves

Divide every requirement into three lists: the software is unusable without these, this saves real time, this would be nice. The first list defines version one. Everything else is a roadmap, and writing it down stops scope from silently swallowing the budget.

## Decide who signs off

Every project needs one person who can make final product decisions. Committees produce compromises; a single accountable owner keeps progress honest.

## Agree what success looks like

Pick measurable outcomes before development starts: invoices per hour processed, orders that reach the packing desk without re-typing, calls answered with the customer's history open. You will use these at acceptance, not as marketing numbers.

## Budget for the boring parts

Deployment, data migration, training and support are not extras. A realistic plan reserves time and money for them from day one, which is why our estimates break them out as separate lines.

If you can complete these five steps — even roughly — you are ready to talk to a development team, and the conversation will be dramatically more productive.

## Prepare a one-page project brief

A useful brief can be a plain document. Include:

- **Users and decisions:** who enters information, who approves it and who needs reports. Note the expected number of users and any access restrictions.
- **One real workflow:** describe its starting event, steps, exceptions and final output. Use anonymised examples, not customer records or login credentials.
- **First-release priorities:** list the tasks that must work on launch day and the tasks that can wait.
- **Existing systems and records:** identify the tools to connect, the data to move and who can explain its meaning. An integration request still needs a feasibility check.
- **Working conditions:** list devices, internet availability, local hardware and any deadline with a business reason behind it.
- **Acceptance and ownership:** name the person who can approve the result and give an example of a completed task they would accept.

Unknowns are useful too. Mark them as questions instead of silently treating them as agreed requirements.

## Compare estimates on the same scope

Ask each proposal to distinguish discovery and design, implementation, integration, data preparation, testing, deployment, training and support. Check whether hosting, third-party licences and ongoing maintenance are included or separate. These are comparison questions, not a fixed-price package or a promise that every project needs the same work.

Agree how a new requirement will be assessed after scope approval. A written change decision should make its effect on cost, timing and acceptance clear before work begins. A low headline price is not a like-for-like comparison if important responsibilities are left out.

## Discuss the next step

Use the brief to review our [custom software development scope](/services/custom-software-development), then [request a project discussion](/request-quote). If the main uncertainty is devices or connectivity, start with the [web app or mobile app guide](/blog/web-app-or-mobile-app-choosing-the-right-platform). You do not need a finished technical specification to explain the business problem.`,
    category: "Planning",
    tags: ["Project planning", "Custom software", "Requirements"],
    readingMinutes: 3,
    publishedAt: "2026-08-30T09:00:00+05:30",
    coverUrl: null,
    isFeatured: false,
    status: "published",
    authorName: "AJ System Soft Technology",
  },
  {
    id: "fallback-web-vs-mobile",
    slug: "web-app-or-mobile-app-choosing-the-right-platform",
    title: "Web app or mobile app: choosing the right platform",
    excerpt:
      "The platform question is really a user question. Four checks that decide whether you need a web app, a mobile app, or both.",
    content: `"Should we build a web app or a mobile app?" is usually the first question — and the wrong one. The right question is: where are your users, and what are they doing when they need the software?

## Check where the work happens

If the work happens at a desk — billing, reporting, administration — a web application is almost always right. If it happens in a warehouse aisle, on a delivery route or at a customer's shop, a mobile app with offline support earns its cost quickly.

## Check how often users return

Daily operational tools thrive as web apps (no install friction, instant updates). Products that must send notifications, capture photos or scan barcodes lean mobile.

## Check the data connection

Field teams in low-connectivity areas need mobile apps that store data offline and synchronise later. That single requirement often decides the platform on its own.

## Check the budget honestly

A cross-platform app can serve both stores from one codebase, but complex device features can still justify going native. We recommend the mix after mapping your users — not before.

Most businesses we work with end up with a web application as the system of record, plus a focused mobile app for the handful of people working away from a desk. Start there, and add screens only where the workflow demands them.

## Match the workflow to the platform

- **A public information site:** if visitors mainly need to understand your business and send an enquiry, begin by defining the website content and contact journey. Do not assume they need an installed app.
- **Shared operational work:** dashboards, approvals and reporting may suit a browser-based application when staff have a reliable connection. Check the screens and browsers they actually use.
- **Work away from a desk:** document the precise camera, scanning, notification or offline tasks. A mobile app may be appropriate, but the need for one device feature does not decide the whole architecture.

Browser capabilities vary by device and operating system. Some mobile needs can be served on the web; others need an installed application. Choose from tested requirements rather than a platform label.

## Test the uncertain parts before choosing

Write down one task that would stop the project succeeding if it failed. Try it on representative devices: for example, capturing information without a connection and synchronising it later. Agree what should happen if two people edit the same record, a device is lost or synchronisation fails. Offline support involves data and recovery decisions, not just storing a screen locally.

Compare the first release and ongoing responsibilities separately: device testing, account access, distribution, support and updates. Native and cross-platform approaches each have trade-offs; assess them against required hardware access and the team's maintenance needs before selecting a stack.

## Plan the next conversation

Bring a list of users, devices and essential tasks to a [project discussion](/request-quote). Review [website development](/services/website-development), [web application development](/services/web-application-development) and [Android application development](/services/android-app-development) for the relevant delivery scope. For the broader brief, use the [custom software planning checklist](/blog/how-to-plan-a-custom-software-project).`,
    category: "Platforms",
    tags: ["Web vs mobile", "Android", "iOS", "Architecture"],
    readingMinutes: 3,
    publishedAt: "2026-08-30T09:30:00+05:30",
    coverUrl: null,
    isFeatured: false,
    status: "published",
    authorName: "AJ System Soft Technology",
  },
  {
    id: "fallback-erp-digitization",
    slug: "what-erp-digitization-actually-means-for-small-businesses",
    title: "What ERP digitisation actually means for small businesses",
    excerpt:
      "ERP is not one giant system you must swallow whole. A staged approach: inventory and billing first, departments next, dashboards last.",
    content: `"ERP" sounds like enterprise software with an enterprise price and an eighteen-month implementation. For most small and mid-sized businesses, it should not be. Digitisation works best in stages, each stage delivering value on its own.

## Stage one: make stock honest

One live inventory across counters and godowns — that is the whole project. When shop floor, store room and accounts agree on quantities, half the daily friction disappears.

## Stage two: connect billing to stock

POS billing that deducts from the same live stock, with GST-ready invoices and a daily closing summary that takes minutes instead of an evening.

## Stage three: purchasing and approvals

Purchase orders linked to stock thresholds, supplier ledgers, and approvals for sensitive actions. This is where control replaces memory.

## Stage four: dashboards

Only after the data is trustworthy do dashboards make sense: sales, margin, slow-moving items, and the three numbers the owner actually checks.

## What this looks like in practice

A four-stage rollout spreads cost over months, trains your team gradually, and avoids the classic failure mode of switching everyone to everything on one risky day. Each stage has a clear acceptance test, so you always know whether the project is working.

If a vendor's answer to digitisation starts with "everyone must use the full system from day one", ask them what stage one is. There is always a stage one.

## Agree an acceptance check for each stage

Use examples from your own operations, with sensitive data removed during early discussions. Possible checks include:

- **Inventory:** reconcile a sample of opening quantities, then trace a receipt, transfer and adjustment. Agree which person can approve corrections.
- **Billing:** complete a sale and a return, and confirm that the expected stock movements and totals appear. Have the appropriate business adviser review your invoice and tax requirements.
- **Purchasing:** follow a request through approval and receipt; check that staff cannot bypass the permissions agreed for their role.
- **Reporting:** trace a displayed total back to its underlying records, including the date range and treatment of returns.

These are starting questions, not a universal module specification. Decide which checks apply to your agreed scope and record the result before extending the rollout.

## Assign migration and rollout responsibilities

Nominate owners for item codes, units, supplier records and opening balances. Resolve duplicate or missing entries with the people who understand them; moving a spreadsheet into a database does not make its contents correct.

Agree a trial import, a reconciliation checklist and the point at which staff stop entering new transactions into the old system. Keep a recovery plan and a clear record of which system is authoritative during the transition. Training should cover exceptions and corrections, not only the simplest happy path.

Choose the next stage after reviewing daily use and unresolved issues. The order and pace depend on your operations; the four stages above are a planning model, not a fixed delivery schedule or price.

## Choose the scope before the system

Read the [ERP and business software service scope](/services/erp-business-software) to discuss modules, migration and handover. A counter-focused requirement may fit [retail POS and inventory software](/services/retail-pos-inventory); connecting existing tools may instead need [API and system integration](/services/api-system-integrations). Bring your current workflow and the first stage you want to improve when you [request a project discussion](/request-quote).`,
    category: "Business systems",
    tags: ["ERP", "Inventory", "POS", "Digitisation"],
    readingMinutes: 3,
    publishedAt: "2026-08-30T10:00:00+05:30",
    coverUrl: null,
    isFeatured: false,
    status: "published",
    authorName: "AJ System Soft Technology",
  },
];
