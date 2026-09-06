import type { Metadata } from "next";
import { siteUrl } from "@/lib/env";
import { getSeoOverride } from "@/lib/seo/overrides";
import { BRAND, SITE_KEYWORDS } from "@/lib/seo/site";

export const HOMEPAGE_TITLE = `${BRAND.primaryName} | Custom Software Development Company India`;

type BuildMetadataInput = {
  /** Page title. Rendered through the root title template unless `absoluteTitle` is set. */
  title?: string;
  absoluteTitle?: boolean;
  description: string;
  /** Route path beginning with "/", resolved against the canonical site URL. */
  path: string;
  noIndex?: boolean;
  /** RSS feed path (e.g. "/blog/rss.xml") advertised in the page head. */
  rss?: string;
  /** Explicit OG image; defaults to the generated /opengraph-image. */
  ogImageUrl?: string | null;
  /** OpenGraph type. Defaults to "website". */
  type?: "website" | "article";
  /** Additional article metadata if type is "article". */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
  };
};

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const canonical = new URL(input.path, siteUrl).toString();
  const resolvedTitle = input.absoluteTitle
    ? { absolute: input.title ?? HOMEPAGE_TITLE }
    : input.title;
    
  const openGraph: Metadata["openGraph"] = {
    type: input.type ?? "website",
    ...(input.type === "article" ? input.article : {}),
    siteName: BRAND.primaryName,
    locale: BRAND.locale,
    alternateLocale: ["en_US", "en_GB"],
    url: canonical,
    title: input.title ?? BRAND.primaryName,
    description: input.description,
    images: [
      input.ogImageUrl ?? {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: BRAND.tagline,
      },
    ],
  };

  return {
    title: resolvedTitle,
    description: input.description,
    alternates: {
      canonical,
      types: input.rss
        ? { "application/rss+xml": new URL(input.rss, siteUrl).toString() }
        : undefined,
    },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: input.title ?? BRAND.primaryName,
      description: input.description,
      images: [input.ogImageUrl ?? "/opengraph-image"],
    },
  };
}

export function buildRootMetadata(): Metadata {
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.replace(
    /^google-site-verification=/i,
    "",
  ).trim();
  const isPreview = process.env.VERCEL_ENV === "preview";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: HOMEPAGE_TITLE, template: `%s | ${BRAND.primaryName}` },
    description: BRAND.description,
    applicationName: BRAND.primaryName,
    // Curated topical keywords (one clean phrase per research cluster).
    keywords: [...SITE_KEYWORDS],
    authors: [{ name: BRAND.primaryName, url: siteUrl }, { name: BRAND.founderName }],
    creator: BRAND.primaryName,
    publisher: BRAND.primaryName,
    category: "technology",
    classification: "Software Development Services",
    referrer: "strict-origin-when-cross-origin",
    formatDetection: { telephone: false, address: false, email: false },
    // Preview deployments stay out of the index; production asks Google for
    // the richest possible snippet (full text, large image, video previews).
    robots: isPreview
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
    // Google Search Console verification: set GOOGLE_SITE_VERIFICATION in the
    // environment (value of the google-site-verification meta content).
    verification: googleVerification ? { google: googleVerification } : undefined,
    other: {
      "google-adsense-account": "ca-pub-5453930363427434",
    },
  };
}

/**
 * buildMetadata with admin-managed overrides from the seo_metadata table
 * (SEO Manager). Static routes call this from async generateMetadata; the
 * override wins for title, description and no-index.
 */
export async function buildRouteMetadata(input: {
  path: string;
  title?: string;
  absoluteTitle?: boolean;
  description: string;
  noIndex?: boolean;
  rss?: string;
}): Promise<Metadata> {
  const override = await getSeoOverride(input.path);
  return buildMetadata({
    path: input.path,
    description: override?.description ?? input.description,
    title: override?.title ?? input.title,
    absoluteTitle: input.absoluteTitle,
    noIndex: override?.noIndex ?? input.noIndex,
    rss: input.rss,
    ogImageUrl: override?.ogImageUrl,
  });
}
