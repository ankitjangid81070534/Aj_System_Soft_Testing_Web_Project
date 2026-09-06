import { describe, expect, it } from "vitest";
import { galleryContentSchema } from "@/lib/validation/sections";

describe("galleryContentSchema — CMS JSONB is strictly validated", () => {
  it("accepts a valid gallery payload and applies defaults", () => {
    const parsed = galleryContentSchema.parse({
      images: [{ url: "https://example.supabase.co/storage/team/photo.webp", alt: "Office desk" }],
    });
    expect(parsed.images[0].alt).toBe("Office desk");
    expect(parsed.images).toHaveLength(1);
    const defaulted = galleryContentSchema.parse({ images: [{ url: "/x.webp" }] });
    expect(defaulted.images[0].alt).toBe("");
  });

  it("accepts an optional headline and captions", () => {
    const parsed = galleryContentSchema.safeParse({
      headline: "Life at AJS Technology",
      images: [{ url: "/x.webp", alt: "a", caption: "Team lunch" }],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects payloads without images", () => {
    expect(galleryContentSchema.safeParse({ headline: "empty" }).success).toBe(false);
    expect(galleryContentSchema.safeParse({ images: [] }).success).toBe(false);
  });

  it("rejects images without a url", () => {
    expect(galleryContentSchema.safeParse({ images: [{ alt: "no url" }] }).success).toBe(false);
  });

  it("rejects more than 24 images (sanity bound)", () => {
    const images = Array.from({ length: 25 }, (_, i) => ({ url: `/${i}.webp` }));
    expect(galleryContentSchema.safeParse({ images }).success).toBe(false);
  });
});
