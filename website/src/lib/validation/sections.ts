import { z } from "zod";

/**
 * Validated content shapes for CMS page_sections rows. The JSONB column only
 * accepts these known section payloads — arbitrary HTML/JS from admin is
 * structurally impossible.
 */

export const galleryImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().default(""),
  caption: z.string().optional(),
});

export const galleryContentSchema = z.object({
  headline: z.string().optional(),
  images: z.array(galleryImageSchema).min(1).max(24),
});

export type GalleryContent = z.infer<typeof galleryContentSchema>;

export type SectionType =
  | "hero"
  | "trust_strip"
  | "services_overview"
  | "platforms"
  | "featured_projects"
  | "process"
  | "industries"
  | "tech_capabilities"
  | "why_us"
  | "testimonials"
  | "team"
  | "gallery"
  | "faq"
  | "cta"
  | "benefits"
  | "offers"
  | "updates";

export type ParsedSection =
  | { type: "gallery"; content: GalleryContent }
  // Other section types are accepted but not rendered by custom page code yet;
  // they will gain typed payloads as the Phase 9 builder lands.
  | { type: Exclude<SectionType, "gallery">; content: Record<string, unknown> };
