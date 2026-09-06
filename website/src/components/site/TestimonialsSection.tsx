import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";
import { ReviewCard } from "@/components/ui/ReviewCard";
import type { TestimonialTeaser } from "@/lib/data/mappers";

/**
 * Rendered only when real, public, approved reviews exist in the CMS.
 * Nothing here is ever fabricated. If none exist, the section hides cleanly.
 */
export function TestimonialsSection({ testimonials }: { testimonials: TestimonialTeaser[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden border-y border-line bg-surface">
      <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 opacity-60" />
      <div
        aria-hidden="true"
        className="aurora aurora-b -left-32 top-10 -z-10 hidden h-96 w-96 lg:block"
      />
      <div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow="Verified Client Feedback"
            title="Real reviews from real software projects"
            description="Verified clients who trusted AJ System Soft Technology with their digital platforms."
            align="center"
          />
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 60} className="h-full">
              <ReviewCard
                authorName={testimonial.authorName}
                authorRole={testimonial.authorRole}
                authorCompany={testimonial.authorCompany}
                rating={testimonial.rating}
                title={testimonial.title}
                reviewText={testimonial.quote}
                projectName={testimonial.projectName}
                adminResponse={testimonial.adminResponse}
                isVerified={true}
                className="h-full"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
