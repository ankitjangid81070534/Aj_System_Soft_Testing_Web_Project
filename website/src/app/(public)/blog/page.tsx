import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/ui/CTA";
import { EmptyState } from "@/components/ui/States";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils/cn";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { getBlogCategories, getPublishedPosts } from "@/lib/data/blog";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Insights — Software Planning, Platforms & Business Systems",
    description:
      "Practical articles from AJ System Soft Technology on planning custom software, choosing platforms, ERP digitisation, POS automation and maintaining business software.",
    path: "/blog",
    rss: "/blog/rss.xml",
  });
}

function articleHref(slug: string): string {
  return `/blog/${slug}`;
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [posts, categories] = await Promise.all([
    getPublishedPosts({ categorySlug, page }),
    getBlogCategories(),
  ]);

  return (
    <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
        ]}
      />
      <div className="mt-6 max-w-3xl">
        <SectionHeader
          as="h1"
          eyebrow="Insights"
          title="Notes from the workbench"
          description="Practical articles on planning software, choosing platforms and running business systems — written by the team that builds them."
        />
      </div>

      {categories.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/blog"
            aria-pressed={!categorySlug}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-ring",
              !categorySlug
                ? "border-brand-600 bg-brand-600 text-on-brand"
                : "border-line bg-surface text-ink-soft hover:text-ink",
            )}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog?category=${category.slug}`}
              aria-pressed={categorySlug === category.slug}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-ring",
                categorySlug === category.slug
                  ? "border-brand-600 bg-brand-600 text-on-brand"
                  : "border-line bg-surface text-ink-soft hover:text-ink",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      ) : null}

      {posts.rows.length > 0 ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.rows.map((post, index) => (
            <Reveal key={post.id} delay={Math.min(index, 5) * 60} className="h-full">
              <Link
                href={articleHref(post.slug)}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface shadow-e1 card-lift"
              >
                {post.coverUrl ? (
                  <Image
                    src={post.coverUrl}
                    alt=""
                    width={640}
                    height={360}
                    priority={index === 0}
                    loading={index < 3 ? undefined : "lazy"}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="aspect-[16/9] w-full rounded-t-2xl object-cover"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full rounded-t-2xl bg-gradient-to-br from-brand-50 via-canvas to-canvas-raised" />
                )}
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                    {post.category ? <Badge tone="brand">{post.category}</Badge> : null}
                    {post.publishedAt ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                        {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </span>
                    ) : null}
                    {post.readingMinutes ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                        {post.readingMinutes} min
                      </span>
                    ) : null}
                  </div>
                  <h2 className="font-semibold tracking-tight text-ink group-hover:text-brand-700">
                    {post.title}
                  </h2>
                  <p className="line-clamp-3 text-sm text-ink-muted">{post.excerpt}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No articles yet"
            description="We publish when we have something genuinely useful to say — no filler. Check back soon."
          />
        </div>
      )}

      {posts.pageCount > 1 ? (
        <div className="mt-8 flex items-center justify-between text-sm text-ink-muted">
          <p>
            Page {page} of {posts.pageCount} · {posts.total} articles
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/blog?page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
                className="rounded-full border border-line bg-surface px-3 py-1.5 font-medium text-ink hover:bg-canvas focus-ring"
              >
                Previous
              </Link>
            ) : null}
            {page < posts.pageCount ? (
              <Link
                href={`/blog?page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
                className="rounded-full border border-line bg-surface px-3 py-1.5 font-medium text-ink hover:bg-canvas focus-ring"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-16">
        <CTA
          eyebrow="From reading to building"
          title="Have a project these notes reminded you of?"
          description="Tell us the requirements — we will propose the right platform and a transparent plan."
        />
      </div>
    </div>
  );
}
