import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { getServiceSitemapEntries } from "@/lib/data/services";
import { getProjectSitemapEntries } from "@/lib/data/projects";
import { getPostSitemapEntries } from "@/lib/data/blog";
import { getOfferSitemapEntries, getUpdateSitemapEntries } from "@/lib/data/growth";

export const revalidate = 3600;

type StaticRoute = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

/**
 * Static public routes. Order roughly mirrors crawl priority. Private, auth
 * and admin routes are intentionally absent (and disallowed in robots.ts).
 */
const STATIC_ROUTES: readonly StaticRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/request-quote", changeFrequency: "monthly", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.85 },
  { path: "/reviews", changeFrequency: "weekly", priority: 0.85 },
  { path: "/ai-methods", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/team", changeFrequency: "monthly", priority: 0.75 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/service-agreement", changeFrequency: "monthly", priority: 0.3 },
];

function latest(dates: (string | null | undefined)[]): Date | undefined {
  let max: number | undefined;
  for (const value of dates) {
    if (!value) continue;
    const time = new Date(value).getTime();
    if (!Number.isNaN(time) && (max === undefined || time > max)) max = time;
  }
  return max === undefined ? undefined : new Date(max);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [serviceEntries, projectEntries, postEntries, offerEntries, updateEntries] = await Promise.all([
    getServiceSitemapEntries(),
    getProjectSitemapEntries(),
    getPostSitemapEntries(),
    getOfferSitemapEntries(),
    getUpdateSitemapEntries(),
  ]);

  // Hub pages inherit the newest child date so Google recrawls them when a
  // service, project or article changes. Static legal pages carry no date
  // (an invented lastmod is worse than none).
  const servicesModified = latest(serviceEntries.map((entry) => entry.updatedAt));
  const projectsModified = latest(projectEntries.map((entry) => entry.updatedAt));
  const blogModified = latest(postEntries.map((entry) => entry.updatedAt));
  const homeModified = latest([
    servicesModified?.toISOString(),
    projectsModified?.toISOString(),
    blogModified?.toISOString(),
  ]);

  const hubDates: Record<string, Date | undefined> = {
    "/": homeModified,
    "/services": servicesModified,
    "/projects": projectsModified,
    "/blog": blogModified,
  };

  return [
    ...STATIC_ROUTES.map((route) => {
      const lastModified = hubDates[route.path];
      return {
        url: new URL(route.path, siteUrl).toString(),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      };
    }),
    ...serviceEntries.map((entry) => ({
      url: new URL(`/services/${entry.slug}`, siteUrl).toString(),
      ...(entry.updatedAt ? { lastModified: new Date(entry.updatedAt) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...projectEntries.map((entry) => ({
      url: new URL(`/projects/${entry.slug}`, siteUrl).toString(),
      ...(entry.updatedAt ? { lastModified: new Date(entry.updatedAt) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...postEntries.map((entry) => ({
      url: new URL(`/blog/${entry.slug}`, siteUrl).toString(),
      ...(entry.updatedAt ? { lastModified: new Date(entry.updatedAt) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...offerEntries.map((entry) => ({
      url: new URL(`/offers/${entry.slug}`, siteUrl).toString(),
      ...(entry.updatedAt ? { lastModified: new Date(entry.updatedAt) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...updateEntries.map((entry) => ({
      url: new URL(`/updates/${entry.slug}`, siteUrl).toString(),
      ...(entry.updatedAt ? { lastModified: new Date(entry.updatedAt) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
