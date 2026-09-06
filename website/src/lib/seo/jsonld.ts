import { siteUrl } from "@/lib/env";
import { BRAND, SERVICE_TYPES, SITE_KEYWORDS } from "@/lib/seo/site";

/** Stable node identifiers so every page's graph points at the same entity. */
export const ORGANIZATION_ID = () => new URL("/#organization", siteUrl).toString();
export const WEBSITE_ID = () => new URL("/#website", siteUrl).toString();

export type ContactPointJsonLd = {
  "@type": "ContactPoint";
  contactType: string;
  email?: string;
  telephone?: string;
  areaServed: string[];
  availableLanguage: string[];
  url: string;
};

export type OrganizationJsonLd = {
  "@context": "https://schema.org";
  "@type": "Organization";
  "@id": string;
  name: string;
  alternateName: string[];
  url: string;
  description: string;
  slogan: string;
  logo: { "@type": "ImageObject"; url: string; width: number; height: number };
  image: string;
  founder: { "@type": "Person"; name: string };
  areaServed: string[];
  knowsAbout: string[];
  contactPoint?: ContactPointJsonLd[];
  sameAs?: string[];
};

/**
 * Organization entity. `logo` always points at the generated, always-available
 * brand image (Next `icon.tsx` / `opengraph-image.tsx`) so Google's Knowledge
 * Panel eligibility never depends on CMS uploads. Contact details are added
 * only when the admin has configured real values.
 */
export function organizationJsonLd(options?: {
  logo?: string;
  sameAs?: string[];
  contactEmail?: string | null;
  phone?: string | null;
}): OrganizationJsonLd {
  const organization: OrganizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID(),
    name: BRAND.primaryName,
    alternateName: [BRAND.shortName, ...BRAND.alternateNames],
    url: new URL("/", siteUrl).toString(),
    description: BRAND.description,
    slogan: BRAND.tagline,
    logo: {
      "@type": "ImageObject",
      url: options?.logo ?? new URL("/opengraph-image", siteUrl).toString(),
      width: 1200,
      height: 630,
    },
    image: new URL("/opengraph-image", siteUrl).toString(),
    founder: { "@type": "Person", name: BRAND.founderName },
    areaServed: [...BRAND.areaServed],
    knowsAbout: [...SERVICE_TYPES],
  };
  const email = options?.contactEmail?.trim();
  const telephone = options?.phone?.trim();
  if (email || telephone) {
    const contactPoint: ContactPointJsonLd = {
      "@type": "ContactPoint",
      contactType: "sales",
      areaServed: [...BRAND.areaServed],
      availableLanguage: ["English", "Hindi"],
      url: new URL("/contact", siteUrl).toString(),
    };
    if (email) contactPoint.email = email;
    if (telephone) contactPoint.telephone = telephone;
    organization.contactPoint = [contactPoint];
  }
  // sameAs is included only for real, verified social profiles (admin-managed).
  if (options?.sameAs && options.sameAs.length > 0) {
    organization.sameAs = options.sameAs;
  }
  return organization;
}

export type BreadcrumbJsonLd = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: { "@type": "ListItem"; position: number; name: string; item: string }[];
};

export function breadcrumbJsonLd(items: { name: string; path: string }[]): BreadcrumbJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).toString(),
    })),
  };
}

export type ServiceJsonLd = {
  "@context": "https://schema.org";
  "@type": "Service";
  name: string;
  description: string;
  url: string;
  provider: { "@type": "Organization"; name: string; url: string };
  areaServed?: string[];
};

export function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
  industries?: string[];
}): ServiceJsonLd {
  const service: ServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: new URL(input.path, siteUrl).toString(),
    provider: {
      "@type": "Organization",
      name: BRAND.primaryName,
      url: new URL("/", siteUrl).toString(),
    },
  };
  if (input.industries && input.industries.length > 0) {
    service.areaServed = input.industries;
  }
  return service;
}

export type BlogPostingJsonLd = {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: { "@type": "Organization" | "Person"; name: string };
  publisher: { "@type": "Organization"; name: string };
  mainEntityOfPage: string;
  image?: string;
};

export function blogPostingJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string | null;
  modifiedAt: string | null;
  authorName: string;
  imageUrl?: string | null;
}): BlogPostingJsonLd {
  const article: BlogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt ?? new Date().toISOString(),
    author: {
      // Person only when a real author is set; organisation authorship otherwise.
      "@type": input.authorName === BRAND.primaryName ? "Organization" : "Person",
      name: input.authorName,
    },
    publisher: { "@type": "Organization", name: BRAND.primaryName },
    mainEntityOfPage: new URL(input.path, siteUrl).toString(),
  };
  if (input.modifiedAt) article.dateModified = input.modifiedAt;
  if (input.imageUrl) article.image = input.imageUrl;
  return article;
}

export type WebSiteJsonLd = {
  "@context": "https://schema.org";
  "@type": "WebSite";
  "@id": string;
  name: string;
  alternateName: string[];
  url: string;
  description: string;
  inLanguage: string;
  publisher: { "@id": string };
  keywords: string;
  potentialAction: {
    "@type": "SearchAction";
    target: { "@type": "EntryPoint"; urlTemplate: string };
    "query-input": string;
  };
};

/**
 * WebSite entity with a SearchAction pointing at the projects filter (the only
 * public search-like surface). Makes the site eligible for a Sitelinks search
 * box and ties the site to the Organization publisher node.
 */
export function webSiteJsonLd(): WebSiteJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID(),
    name: BRAND.primaryName,
    alternateName: [BRAND.shortName, ...BRAND.alternateNames],
    url: new URL("/", siteUrl).toString(),
    description: BRAND.description,
    inLanguage: "en-IN",
    publisher: { "@id": ORGANIZATION_ID() },
    keywords: SITE_KEYWORDS.join(", "),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: new URL("/projects?q={search_term_string}", siteUrl).toString(),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type AboutPageJsonLd = {
  "@context": "https://schema.org";
  "@type": "AboutPage";
  name: string;
  description: string;
  url: string;
  mainEntity: {
    "@type": "Organization";
    name: string;
    url: string;
  };
};

export function aboutPageJsonLd(input: { description: string }): AboutPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${BRAND.primaryName}`,
    description: input.description,
    url: new URL("/about", siteUrl).toString(),
    mainEntity: {
      "@type": "Organization",
      name: BRAND.primaryName,
      url: new URL("/", siteUrl).toString(),
    },
  };
}

export type ContactPageJsonLd = {
  "@context": "https://schema.org";
  "@type": "ContactPage";
  name: string;
  description: string;
  url: string;
  mainEntity: {
    "@type": "Organization";
    name: string;
    url: string;
  };
};

export function contactPageJsonLd(input: { description: string }): ContactPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${BRAND.primaryName}`,
    description: input.description,
    url: new URL("/contact", siteUrl).toString(),
    mainEntity: {
      "@type": "Organization",
      name: BRAND.primaryName,
      url: new URL("/", siteUrl).toString(),
    },
  };
}

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQPageJsonLd = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }[];
};

export function faqPageJsonLd(items: FAQItem[]): FAQPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export type LocalBusinessJsonLd = {
  "@context": "https://schema.org";
  "@type": "ProfessionalService";
  "@id": string;
  name: string;
  alternateName: string[];
  url: string;
  image: string;
  description: string;
  slogan: string;
  priceRange: string;
  areaServed: string[];
  serviceType: string[];
  parentOrganization: { "@id": string };
  address: { "@type": "PostalAddress"; addressCountry: string; streetAddress?: string };
  email?: string;
  telephone?: string;
  openingHours?: string;
  hasMap?: string;
  sameAs?: string[];
};

/**
 * ProfessionalService node for the home and contact pages. Only real, admin
 * configured facts (email, phone, address, hours, map, socials) are emitted.
 */
export function localBusinessJsonLd(options?: {
  contactEmail?: string | null;
  phone?: string | null;
  addressLine?: string | null;
  businessHours?: string | null;
  mapUrl?: string | null;
  sameAs?: string[];
}): LocalBusinessJsonLd {
  const business: LocalBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": new URL("/#business", siteUrl).toString(),
    name: BRAND.primaryName,
    alternateName: [BRAND.shortName, ...BRAND.alternateNames],
    url: new URL("/", siteUrl).toString(),
    image: new URL("/opengraph-image", siteUrl).toString(),
    description: BRAND.description,
    slogan: BRAND.tagline,
    priceRange: "$$",
    areaServed: [...BRAND.areaServed],
    serviceType: [...SERVICE_TYPES],
    parentOrganization: { "@id": ORGANIZATION_ID() },
    address: { "@type": "PostalAddress", addressCountry: BRAND.countryCode },
  };
  const address = options?.addressLine?.trim();
  if (address) business.address.streetAddress = address;
  const email = options?.contactEmail?.trim();
  if (email) business.email = email;
  const telephone = options?.phone?.trim();
  if (telephone) business.telephone = telephone;
  const hours = options?.businessHours?.trim();
  if (hours) business.openingHours = hours;
  const map = options?.mapUrl?.trim();
  if (map && /^https:\/\//i.test(map)) business.hasMap = map;
  if (options?.sameAs && options.sameAs.length > 0) business.sameAs = options.sameAs;
  return business;
}
