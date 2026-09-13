import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const data = vi.hoisted(() => ({ post: vi.fn(), recent: vi.fn() }));
vi.mock("@/lib/data/blog", () => ({
  getPostBySlug: data.post,
  getPublishedPosts: data.recent,
  getPostSlugs: async () => [],
  pickRelatedPosts: () => [],
}));
import ArticlePage from "./page";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
beforeEach(() => { vi.stubGlobal("React", React); vi.clearAllMocks(); });
afterEach(() => vi.unstubAllGlobals());

describe("article request scheduling (mocked reads only)", () => {
  it("starts recent-public-posts loading before the article response arrives", async () => {
    const post = deferred<object>();
    const recent = deferred<{ rows: [] }>();
    data.post.mockReturnValue(post.promise);
    data.recent.mockReturnValue(recent.promise);
    const pending = ArticlePage({ params: Promise.resolve({ slug: "unit-post" }) });
    await vi.waitFor(() => {
      expect(data.post).toHaveBeenCalledWith("unit-post");
      expect(data.recent).toHaveBeenCalledWith({ page: 1 });
    });
    post.resolve({ slug: "unit-post", title: "Unit post", content: "Unit content", excerpt: "Unit excerpt", authorName: "Unit Author", tags: [], publishedAt: null, coverUrl: null });
    recent.resolve({ rows: [] });
    expect(React.isValidElement(await pending)).toBe(true);
  });

  it("still returns a real not-found result when the article is absent", async () => {
    data.post.mockResolvedValue(null);
    data.recent.mockResolvedValue({ rows: [] });
    await expect(ArticlePage({ params: Promise.resolve({ slug: "missing-unit-post" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
