import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, MessageSquarePlus, Star } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { Button } from "@/components/ui/Button";
import { CTA } from "@/components/ui/CTA";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Verified Client Reviews",
    description:
      "Read verified real client reviews and feedback for software engineering, web application development, SaaS platforms, and enterprise solutions by AJ System Soft Technology.",
    path: "/reviews",
  });
}

type PublicReview = {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  rating: number;
  title: string | null;
  reviewText: string;
  projectName: string | null;
  adminResponse: string | null;
  createdAt: string;
};

async function getApprovedReviews(): Promise<PublicReview[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select(
        "id, quote, author_name, author_role, author_company, rating, title, review_text, project_name, admin_response, created_at",
      )
      .eq("status", "published")
      .eq("is_active", true)
      .eq("is_public", true)
      .eq("is_verified", true)
      .order("sort_order");

    if (error || !data) return [];
    return data.map((item) => ({
      id: item.id,
      authorName: item.author_name,
      authorRole: item.author_role,
      authorCompany: item.author_company,
      rating: item.rating ?? 5,
      title: item.title,
      reviewText: item.review_text || item.quote,
      projectName: item.project_name,
      adminResponse: item.admin_response,
      createdAt: item.created_at,
    }));
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Reviews", path: "/reviews" },
        ])}
      />

      <PageHero
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Verified Reviews", href: "/reviews" },
        ]}
        eyebrow="Verified Client Feedback"
        title="Real reviews from real software projects"
        description="All reviews on this page are submitted exclusively by verified clients of AJ System Soft Technology and moderated for authenticity."
      >
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas-raised focus-ring"
          >
            <MessageSquarePlus aria-hidden="true" className="h-4 w-4 text-brand-600" />
            <span>Submit Review</span>
          </Link>
        </div>
      </PageHero>
      <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
        {/* Transparency / Verification Notice */}
        <div className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-brand-900/60 dark:bg-brand-950/40">
          <div className="flex items-center gap-2.5 text-xs text-brand-800 dark:text-brand-300">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-600" />
            <span>
              <strong>Authenticity Guarantee:</strong> We do not purchase, fabricate, or incentivize
              reviews. Only registered, verified project clients may submit.
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-400">
            <Star aria-hidden="true" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            100% Genuine Client Feedback
          </span>
        </div>

        {/* Reviews Grid or Empty State */}
        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <Reveal key={review.id} delay={index * 50} className="h-full">
                <ReviewCard
                  authorName={review.authorName}
                  authorRole={review.authorRole}
                  authorCompany={review.authorCompany}
                  rating={review.rating}
                  title={review.title}
                  reviewText={review.reviewText}
                  projectName={review.projectName}
                  createdAt={review.createdAt}
                  adminResponse={review.adminResponse}
                  isVerified={true}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-line bg-surface p-8 text-center shadow-e1 sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600">
              <ShieldCheck aria-hidden="true" className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink">
              Verified reviews moderation in progress
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted leading-relaxed">
              We publish reviews solely from verified clients upon completion of their milestone
              deliveries. Check back soon or request references directly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/projects" variant="secondary">
                View Case Studies
              </Button>
              <Button href="/contact">Contact Our Team</Button>
            </div>
          </div>
        )}

        <div className="mt-16">
          <CTA
            eyebrow="Start a project"
            title="Ready to build your custom software platform?"
            description="Discuss your project requirements directly with our technical leadership."
            primary={{ label: "Request a Quote", href: "/request-quote" }}
            secondary={{ label: "Contact Us", href: "/contact" }}
          />
        </div>
      </div>
    </>
  );
}
