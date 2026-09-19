import type { ServiceCardModel } from "@/lib/data/services";

/** Editorial guidance, not AI, pricing or a second service catalogue. */
export const SERVICE_GOALS = [
  {
    id: "website",
    label: "Website or online store",
    icon: "monitor",
    guidance: "Start here for a public business website or a product catalogue with checkout.",
    slugs: ["website-development", "ecommerce-development"],
  },
  {
    id: "web-app",
    label: "Web app or portal",
    icon: "globe",
    guidance: "Explore browser-based dashboards, customer portals and daily workflows.",
    slugs: ["web-application-development"],
  },
  {
    id: "business",
    label: "Custom business software",
    icon: "code",
    guidance: "Explore a tailored workflow, connections between existing tools, or care for an existing system.",
    slugs: ["custom-software-development", "api-system-integrations", "cloud-deployment-maintenance"],
  },
  {
    id: "erp",
    label: "ERP, CRM or POS",
    icon: "dashboard",
    guidance: "Start with shared sales, stock and reporting, or a retail billing counter.",
    slugs: ["erp-business-software", "retail-pos-inventory"],
  },
  {
    id: "industry",
    label: "Industry-specific software",
    icon: "briefcase",
    guidance: "Explore existing hospital, clinic, pharmacy and hotel service pages for your workflow.",
    slugs: ["hospital-clinic-software", "pharmacy-software", "hotel-management-software"],
  },
  {
    id: "mobile",
    label: "Mobile app",
    icon: "smartphone",
    guidance: "Compare the existing Android and iOS services for the devices your users have.",
    slugs: ["android-app-development", "ios-app-development"],
  },
  {
    id: "saas",
    label: "SaaS product",
    icon: "cloud",
    guidance: "Explore a subscription product with customer accounts, plans and dashboards.",
    slugs: ["saas-development"],
  },
  {
    id: "desktop",
    label: "Desktop software",
    icon: "app-window",
    guidance: "Explore Windows software for local machines, offline work or connected hardware.",
    slugs: ["desktop-software-development"],
  },
  {
    id: "unsure",
    label: "Not sure yet",
    icon: "briefcase",
    guidance: "Start with the task you want to improve, who will use it and any tools you already use. You do not need to choose a platform before a conversation.",
    slugs: [],
  },
] as const;

/** Only link to records already supplied by the public index; never resurrect hidden services. */
export function matchServices(services: ServiceCardModel[], goalId: string): ServiceCardModel[] {
  const goal = SERVICE_GOALS.find((candidate) => candidate.id === goalId);
  if (!goal) return [];
  return goal.slugs.flatMap((slug) => {
    const service = services.find((candidate) => candidate.slug === slug);
    return service ? [service] : [];
  });
}
