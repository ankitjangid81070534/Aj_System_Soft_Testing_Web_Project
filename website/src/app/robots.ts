import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

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
];

export default function robots(): MetadataRoute.Robots {
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
        disallow: ["/ajadmin", "/ajadmin/", "/account", "/account/", "/auth/", "/api/"],
      },
      {
        // Google Ads landing-page quality crawler.
        userAgent: "AdsBot-Google",
        allow: "/",
        disallow: ["/ajadmin", "/ajadmin/", "/account", "/account/", "/auth/", "/api/"],
      },
    ],
    sitemap: new URL("sitemap.xml", siteUrl).toString(),
    host: siteUrl,
  };
}
