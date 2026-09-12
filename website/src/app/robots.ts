import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { isPreviewDeployment } from "@/lib/seo/indexing";

/** Private, account and auth surfaces — never indexed. */
const PRIVATE_PATHS = [
  "/ajadmin",
  "/ajadmin/",
  "/account",
  "/account/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/update-password",
  "/auth/",
  "/api/",
  "/design-preview",
];

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        // Google Search crawler — explicit so no wildcard rule can shadow it.
        userAgent: "Googlebot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        // Google AdSense crawler must read every public page to classify
        // content for ad relevance and for the site approval review.
        userAgent: "Mediapartners-Google",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        // Google Ads landing-page quality crawler.
        userAgent: "AdsBot-Google",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: new URL("sitemap.xml", siteUrl).toString(),
    host: siteUrl,
  };
}
