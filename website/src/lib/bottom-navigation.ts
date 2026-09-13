import type { PublicNavLink } from "./data/navigation";
import { isLegalNavigationLink } from "./navigation";

const preferredRoutes = ["/", "/services", "/projects", "/contact"];

/** Keep CMS labels and URLs intact; every link appears in exactly one place. */
export function splitNavigation(links: readonly PublicNavLink[]) {
  const preferred = preferredRoutes.flatMap(href => {
    const link = links.find(item => item.href === href);
    return link ? [link] : [];
  });
  // Legal pages belong in More even when a CMS supplies fewer than four main links.
  const remaining = links.filter(link => !preferred.includes(link) && !isLegalNavigationLink(link.href));
  const primary = [...preferred, ...remaining].slice(0, 4);
  return { primary, overflow: links.filter(link => !primary.includes(link)) };
}

export function isNavigationActive(pathname: string, href: string) {
  return pathname === href || (href.startsWith("/") && href !== "/" && pathname.startsWith(`${href}/`));
}
