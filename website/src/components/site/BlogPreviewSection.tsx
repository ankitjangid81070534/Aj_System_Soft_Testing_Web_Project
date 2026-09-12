import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";
import type { BlogPostTeaser } from "@/lib/data/blog";

export function BlogPreviewSection({ posts }: { posts: BlogPostTeaser[] }) {
  if (posts.length === 0) return null;

  return (
    <section data-home-section="insights" className="relative mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden="true"
        className="aurora aurora-a -right-40 top-0 -z-10 hidden h-96 w-96 lg:block"
      />
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Insights & Articles"
            title="Engineering & architecture notes"
            description="Practical guides on custom software planning, SaaS engineering, ERP design, and technical decisions."
          />
          <span className="hidden sm:inline-flex">
            <Button href="/blog" variant="outline">
              View all articles
            </Button>
          </span>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <Reveal key={post.id} delay={index * 60} className="h-full">
            <Link
              href={`/blog/${post.slug}`}
              className="group card-3d flex h-full flex-col overflow-hidden rounded-[1.375rem] focus-ring"
            >
              {post.coverUrl ? (
                <div className="relative z-10 m-2 aspect-[16/9] w-auto overflow-hidden rounded-[1rem] bg-canvas-raised ring-1 ring-line">
                  <Image
                    src={post.coverUrl}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
                  />
                </div>
              ) : null}

              <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center gap-2.5 text-xs text-ink-muted">
                  {post.category ? (
                    <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-400">
                      {post.category}
                    </span>
                  ) : null}
                  {post.readingMinutes ? (
                    <span className="flex items-center gap-1">
                      <Clock aria-hidden="true" className="h-3 w-3" />
                      {post.readingMinutes} min read
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 text-base font-semibold tracking-tight text-ink group-hover:text-brand-600 transition-colors">
                  {post.title}
                </h3>

                {post.excerpt ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                    {post.excerpt}
                  </p>
                ) : null}

                <div className="mt-auto flex items-center justify-between border-t border-line/60 pt-4 text-xs">
                  {post.publishedAt ? (
                    <time className="flex items-center gap-1 text-ink-muted">
                      <Calendar aria-hidden="true" className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  ) : (
                    <span />
                  )}

                  <span className="inline-flex items-center gap-1 font-medium text-brand-600">
                    Read note
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform duration-150 ease-soft group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 flex justify-center sm:hidden">
        <Button href="/blog" variant="outline">
          View all articles
        </Button>
      </div>
    </section>
  );
}
