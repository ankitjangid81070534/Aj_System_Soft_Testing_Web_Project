import { PlayCircle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/Button";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { CaseStudyMedia } from "@/lib/data/projects";

/** Render only supplied media; a standalone walkthrough needs no screenshot row. */
export function ProjectGallery({ name, gallery, videoUrl }: {
  name: string;
  gallery: CaseStudyMedia[];
  videoUrl: string | null;
}) {
  if (gallery.length === 0 && !videoUrl) return null;

  return (
    <section className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="gallery">
      <Reveal>
        <SectionHeader eyebrow="Project media" title={<span id="gallery">Inside the application</span>} />
      </Reveal>
      {gallery.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {gallery.map((media, index) => (
            <Reveal key={media.id} delay={Math.min(index, 5) * 50}>
              <MediaFrame
                src={media.type === "image" ? media.url : undefined}
                alt={media.alt || `${name} screenshot ${index + 1}`}
                label={media.type === "video" ? `Demo clip ${index + 1}` : `Screenshot ${index + 1}`}
                aspect="16/10"
              >
                {media.type === "video" ? (
                  <div className="flex h-full w-full items-center justify-center bg-canvas">
                    <Button href={media.url} variant="secondary" target="_blank">
                      <PlayCircle aria-hidden="true" className="h-5 w-5" />
                      Watch demo clip
                    </Button>
                  </div>
                ) : null}
              </MediaFrame>
            </Reveal>
          ))}
        </div>
      ) : null}
      {videoUrl ? (
        <div className="mt-5">
          <Button href={videoUrl} variant="secondary" target="_blank">
            <PlayCircle aria-hidden="true" className="h-4 w-4" />
            Watch the full walkthrough
          </Button>
        </div>
      ) : null}
    </section>
  );
}
