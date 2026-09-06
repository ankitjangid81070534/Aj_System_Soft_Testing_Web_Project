import { describe, expect, it } from "vitest";
import { extractToc, headingSlug } from "@/components/site/Markdown";
import { estimateReadingMinutes } from "@/lib/data/blog";

describe("headingSlug — shared anchor between renderer and TOC", () => {
  it("slugifies headings deterministically", () => {
    expect(headingSlug("What ERP digitisation actually means")).toBe(
      "what-erp-digitisation-actually-means",
    );
    expect(headingSlug("Stage two: connect billing to stock")).toBe(
      "stage-two-connect-billing-to-stock",
    );
  });
});

describe("extractToc — table of contents for long posts", () => {
  const markdown = [
    "Intro paragraph.",
    "## First section",
    "Some text.",
    "### Subsection detail",
    "```",
    "## not a heading, inside a code fence",
    "```",
    "## Second section",
  ].join("\n");

  it("extracts h2/h3 entries with anchor ids, skipping code fences", () => {
    expect(extractToc(markdown)).toEqual([
      { id: "first-section", text: "First section", level: 2 },
      { id: "subsection-detail", text: "Subsection detail", level: 3 },
      { id: "second-section", text: "Second section", level: 2 },
    ]);
  });

  it("returns an empty list for short posts", () => {
    expect(extractToc("Just a paragraph without headings.")).toEqual([]);
  });
});

describe("estimateReadingMinutes — real reading time when not stored", () => {
  it("uses ~200 words per minute with a floor of one minute", () => {
    expect(estimateReadingMinutes("word ".repeat(600))).toBe(3);
    expect(estimateReadingMinutes("only a few words")).toBe(1);
  });
});
