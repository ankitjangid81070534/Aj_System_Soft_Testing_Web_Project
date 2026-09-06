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

If you can complete these five steps — even roughly — you are ready to talk to a development team, and the conversation will be dramatically more productive.`,
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

Most businesses we work with end up with a web application as the system of record, plus a focused mobile app for the handful of people working away from a desk. Start there, and add screens only where the workflow demands them.`,
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

If a vendor's answer to digitisation starts with "everyone must use the full system from day one", ask them what stage one is. There is always a stage one.`,
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
