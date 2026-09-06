import { siteUrl } from "@/lib/env";
import { getPublishedPosts } from "@/lib/data/blog";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** RSS 2.0 feed of published insights. */
export async function GET(): Promise<Response> {
  const { rows } = await getPublishedPosts({ page: 1 });

  const items = rows
    .map((post) => {
      const link = new URL(`/blog/${post.slug}`, siteUrl).toString();
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ""}
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AJ System Soft Technology — Insights</title>
    <link>${new URL("/blog", siteUrl).toString()}</link>
    <description>Practical articles on planning software, choosing platforms and running business systems.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
