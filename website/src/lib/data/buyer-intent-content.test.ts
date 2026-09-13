import { describe, expect, it } from "vitest";
import { extractToc } from "@/components/site/Markdown";
import { FALLBACK_POSTS } from "@/lib/data/blog-fallback";
import { FALLBACK_SERVICES } from "@/lib/data/services-fallback";

const guideSections = [
  {
    slug: "how-to-plan-a-custom-software-project",
    headings: [
      "Prepare a one-page project brief",
      "Compare estimates on the same scope",
      "Discuss the next step",
    ],
    service: "/services/custom-software-development",
  },
  {
    slug: "web-app-or-mobile-app-choosing-the-right-platform",
    headings: [
      "Match the workflow to the platform",
      "Test the uncertain parts before choosing",
      "Plan the next conversation",
    ],
    service: "/services/web-application-development",
  },
  {
    slug: "what-erp-digitization-actually-means-for-small-businesses",
    headings: [
      "Agree an acceptance check for each stage",
      "Assign migration and rollout responsibilities",
      "Choose the scope before the system",
    ],
    service: "/services/erp-business-software",
  },
];

const buyerQuestions = [
  {
    slug: "custom-software-development",
    questions: [
      "What should we prepare before requesting an estimate?",
      "What should the handover checklist cover?",
      "When might a ready-made tool be the better choice?",
    ],
    total: 6,
  },
  {
    slug: "erp-business-software",
    questions: [
      "What needs to be agreed before migrating our records?",
      "How should we accept a module before adding the next one?",
    ],
    total: 5,
  },
  {
    slug: "cloud-deployment-maintenance",
    questions: [
      "What should the maintenance agreement make explicit?",
      "What should we ask about backups and recovery?",
    ],
    total: 5,
  },
];

describe("Phase 12 existing-page buyer guidance", () => {
  it.each(guideSections)("adds actionable sections and valid anchors to $slug", (guide) => {
    const post = FALLBACK_POSTS.find((item) => item.slug === guide.slug);
    expect(post).toBeDefined();
    const toc = extractToc(post!.content);
    expect(toc.map((heading) => heading.text)).toEqual(expect.arrayContaining(guide.headings));
    expect(new Set(toc.map((heading) => heading.id)).size).toBe(toc.length);
    expect(post!.content).toContain(`](${guide.service})`);
    expect(post!.content).toContain("](/request-quote)");
    expect(post!.authorName).toBe("AJ System Soft Technology");
  });

  it.each(buyerQuestions)("keeps existing questions and adds scoped answers to $slug", (entry) => {
    const service = FALLBACK_SERVICES.find((item) => item.slug === entry.slug);
    expect(service).toBeDefined();
    expect(service!.faqs).toHaveLength(entry.total);
    expect(service!.faqs.slice(3).map((faq) => faq.question)).toEqual(entry.questions);
    expect(new Set(service!.faqs.map((faq) => faq.question)).size).toBe(entry.total);
    for (const faq of service!.faqs.slice(3)) {
      expect(faq.answer.length).toBeGreaterThan(100);
      // FAQ answers are plain text; the existing accordion is not a Markdown renderer.
      expect(faq.answer).not.toMatch(/<a\b|\]\(/);
    }
  });

  it("links only to existing public owners, without adding articles or services", () => {
    expect(FALLBACK_SERVICES).toHaveLength(15);
    expect(FALLBACK_POSTS).toHaveLength(3);
    const destinations = new Set([
      "/request-quote",
      ...FALLBACK_SERVICES.map((service) => `/services/${service.slug}`),
      ...FALLBACK_POSTS.map((post) => `/blog/${post.slug}`),
    ]);
    for (const post of FALLBACK_POSTS) {
      const links = [...post.content.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
      expect(links.length).toBeGreaterThanOrEqual(3);
      for (const link of links) expect(destinations.has(link), link).toBe(true);
    }
  });

  it("keeps maintenance coverage conditional and separates backups from recovery", () => {
    const service = FALLBACK_SERVICES.find((item) => item.slug === "cloud-deployment-maintenance")!;
    const answers = service.faqs.slice(3).map((faq) => faq.answer).join(" ");
    expect(answers).toContain("Do not assume round-the-clock coverage");
    expect(answers).toContain("acknowledge an issue from the time to resolve it");
    expect(answers).toContain("A successful backup job alone does not demonstrate");
  });
});
