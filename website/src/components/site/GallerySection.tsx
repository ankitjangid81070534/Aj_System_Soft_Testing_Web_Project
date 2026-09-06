import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";
import type { GalleryContent } from "@/lib/validation/sections";

/**
 * CMS-driven image gallery (company/team/workspace/event/project-safe media).
 * Renders only when a published gallery section exists for the page.
 */
export function GallerySection({ content }: { content: GalleryContent }) {
  return (
    <section aria-labelledby="gallery-heading" className="border-y border-line bg-surface">
      <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <SectionHeader eyebrow="Gallery" title={content.headline ?? "Moments from our work"} />
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {content.images.map((image, index) => (
            <Reveal key={`${image.url}-${index}`} delay={Math.min(index, 6) * 40}>
              <figure className="group overflow-hidden rounded-2xl border border-line bg-canvas-raised shadow-e1">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={image.url}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    fill
                    loading={index < 3 ? "eager" : "lazy"}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                    className="object-cover transition-transform duration-300 ease-soft group-hover:scale-[1.03]"
                  />
                </div>
                {image.caption ? (
                  <figcaption className="border-t border-line px-3 py-2 text-xs text-ink-muted">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
