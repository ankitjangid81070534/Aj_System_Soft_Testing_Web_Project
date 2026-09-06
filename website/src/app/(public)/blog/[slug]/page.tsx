import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/ui/CTA";
import { Markdown, extractToc } from "@/components/site/Markdown";
import { Reveal } from "@/components/site/Reveal";
import { buildMetadata } from "@/lib/seo/metadata";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { getPostBySlug, getPostSlugs, getPublishedPosts, pickRelatedPosts } from "@/lib/data/blog";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  // Public routes render blocking, so notFound() in metadata yields a real 404.
  if (!post) notFound();
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    noIndex: post.status !== "published",
    type: "article",
    article: {
      publishedTime: post.publishedAt || undefined,
      authors: ["AJ System Soft Technology"],
    },
  });
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "long" });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const toc = extractToc(post.content);
  const showToc = toc.length >= 3;
  const { rows: recent } = await getPublishedPosts({ page: 1 });
  const related = pickRelatedPosts(recent, post).slice(0, 3);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={blogPostingJsonLd({
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          publishedAt: post.publishedAt,
          modifiedAt: null,
          authorName: post.authorName,
          imageUrl: post.coverUrl,
        })}
      />

      <article className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs items={crumbs.map((crumb) => ({ name: crumb.name, href: crumb.path }))} />

        <header className="mx-auto mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {post.category ? <Badge tone="brand">{post.category}</Badge> : null}
            {post.status !== "published" ? <Badge tone="warning">Draft preview</Badge> : null}
          </div>
          <h1 className="mt-4 text-display-md font-semibold tracking-tight text-balance text-ink">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
            <span className="font-medium text-ink-soft">{post.authorName}</span>
            {post.publishedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </span>
            ) : null}
            {post.readingMinutes ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden="true" className="h-4 w-4" />
                {post.readingMinutes} min read
              </span>
            ) : null}
          </div>
        </header>

        {post.coverUrl ? (
          <div className="mx-auto mt-8 max-w-4xl">
            <Reveal>
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-line shadow-3d">
                <Image
                  src={post.coverUrl}
                  alt={post.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 56rem, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        ) : null}

        <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-[1fr_16rem]">
          <div className="min-w-0">
            <Markdown content={post.content} />

            {post.tags.length > 0 ? (
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-line pt-6">
                <Tag aria-hidden="true" className="h-4 w-4 text-ink-muted" />
                {post.tags.map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
            ) : null}
          </div>

          {showToc ? (
            <aside className="hidden lg:block" aria-label="Table of contents">
              <nav className="sticky top-24 rounded-2xl border border-line bg-surface p-5 shadow-e1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  On this page
                </p>
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {toc.map((entry) => (
                    <li key={entry.id} className={entry.level === 3 ? "pl-3" : undefined}>
                      <a
                        href={`#${entry.id}`}
                        className="rounded-sm text-ink-muted transition-colors hover:text-ink focus-ring"
                      >
                        {entry.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          ) : null}
        </div>

        {related.length > 0 ? (
          <section
            className="mx-auto mt-14 max-w-5xl border-t border-line pt-10"
            aria-labelledby="related"
          >
            <h2 id="related" className="text-xl font-semibold tracking-tight text-ink">
              Keep reading
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5 shadow-e1 card-lift"
                >
                  {item.category ? <Badge tone="brand">{item.category}</Badge> : null}
                  <h3 className="font-semibold tracking-tight text-ink group-hover:text-brand-700">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-ink-muted">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mx-auto mt-14 max-w-5xl">
          <CTA
            eyebrow="Start a project"
            title="Turn these ideas into working software."
            description="Tell us your requirements — we will respond with a practical plan and a transparent estimate."
          />
        </div>
      </article>
    </>
  );
}
