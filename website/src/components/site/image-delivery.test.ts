import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GallerySection } from "./GallerySection";
import { BlogPreviewSection } from "./BlogPreviewSection";
import { ProjectCard } from "@/components/ui/ProjectCard";

const imageProps = vi.hoisted(() => vi.fn());
vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => {
  imageProps(props);
  return React.createElement("img", { src: props.src as string, alt: props.alt as string });
} }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: React.ComponentProps<"a">) => React.createElement("a", props, children) }));

beforeEach(() => { vi.stubGlobal("React", React); imageProps.mockClear(); });
afterEach(() => vi.unstubAllGlobals());

// Synthetic unit props only, never added to CMS records or public fallback content.
describe("responsive media delivery preserves the existing frames", () => {
  it("lazy-loads every below-fold gallery image, including the first three", () => {
    const html = renderToStaticMarkup(React.createElement(GallerySection, { content: {
      headline: "Unit gallery",
      images: Array.from({ length: 4 }, (_, index) => ({ url: `/unit-${index}.webp`, alt: `Unit ${index}`, caption: "Unit caption" })),
    } }));
    expect(imageProps).toHaveBeenCalledTimes(4);
    for (const [props] of imageProps.mock.calls) {
      expect(props).toMatchObject({ fill: true, loading: "lazy" });
      expect(props.sizes).toBe("(min-width: 1216px) 384px, (min-width: 1024px) 33vw, 50vw");
    }
    expect(html).toContain("aspect-[4/3]");
    expect(html.match(/<figcaption/g)).toHaveLength(4);
  });

  it("caps wide-screen article previews without changing their link or frame", () => {
    const html = renderToStaticMarkup(React.createElement(BlogPreviewSection, { posts: [{
      id: "unit", slug: "unit-post", title: "Unit post", excerpt: "Unit excerpt", coverUrl: "/unit.webp",
      category: null, readingMinutes: 1, publishedAt: null, isFeatured: false, status: "published",
    }] }));
    expect(imageProps.mock.calls[0][0]).toMatchObject({ fill: true });
    expect(imageProps.mock.calls[0][0].sizes).toContain("(min-width: 1216px) 384px");
    expect(html).toContain('href="/blog/unit-post"');
    expect(html).toContain("aspect-[16/9]");
  });

  it.each([false, true])("preserves project priority=%s and wide-screen sizing", (priority) => {
    const html = renderToStaticMarkup(React.createElement(ProjectCard, {
      name: "Unit project", href: "/projects/unit-project", coverUrl: "/unit.webp", priority,
    }));
    expect(imageProps.mock.calls[0][0]).toMatchObject({ fill: true, priority });
    expect(imageProps.mock.calls[0][0].sizes).toContain("(min-width: 1216px) 384px");
    expect(html).toContain('href="/projects/unit-project"');
    expect(html).toContain("aspect-[16/10]");
  });
});
