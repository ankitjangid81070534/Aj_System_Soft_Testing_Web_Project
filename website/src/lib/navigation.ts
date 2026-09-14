/**
 * Primary public navigation, shared by the marketing header, mobile menu and
 * footer. Routes land phase by phase (services Phase 5, projects Phase 6,
 * about/team Phase 7, contact/quote Phase 8).
 */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "AI Methods", href: "/ai-methods" },
  { label: "Reviews", href: "/reviews" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
] as const;

/** Required legal destinations supplement (never replace) CMS navigation. */
export const LEGAL_NAV_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Disclaimer", href: "/disclaimer" },
] as const;

export function isLegalNavigationLink(href: string) {
  return LEGAL_NAV_LINKS.some(link => link.href === href);
}

export function withLegalNavigation<T extends { label: string; href: string }>(links: readonly T[]) {
  return [...links, ...LEGAL_NAV_LINKS.filter(legal => !links.some(link => link.href === legal.href))];
}

export const FOOTER_LINK_GROUPS = [
  {
    title: "Build",
    links: [
      { label: "Services", href: "/services" },
      { label: "Projects", href: "/projects" },
      { label: "Blog & Insights", href: "/blog" },
      { label: "Request a Quote", href: "/request-quote" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Verified Reviews", href: "/reviews" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Portal & Legal",
    links: [
      { label: "Client Login", href: "/login" },
      { label: "Service Agreement", href: "/service-agreement" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
] as const;
