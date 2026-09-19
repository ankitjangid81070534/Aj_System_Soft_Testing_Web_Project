import type { ServiceCardModel } from "@/lib/data/services";

/** Editorial decision guidance, not packages, quotes or a second service catalogue. */
export const SOLUTION_COMPARISONS = [
  {
    id: "website-web-app",
    title: "Website vs Web App",
    options: [
      { name: "Website", fit: "Help visitors understand your business, read content and send an enquiry.", consideration: "Content editing and discovery matter most; complex daily workflows may need an application." },
      { name: "Web app", fit: "Let people sign in, manage records and complete tasks through a browser.", consideration: "Plan user roles, data validation, backups and ongoing maintenance alongside the screens." },
    ],
    question: "Will visitors mainly read and enquire, or return to complete a task? A website and an app can work together.",
    slugs: ["website-development", "web-application-development"],
  },
  {
    id: "saas-internal-tool",
    title: "SaaS vs Internal Tool",
    options: [
      { name: "SaaS product", fit: "Deliver an online product to multiple customer organisations, often through subscriptions.", consideration: "Plan customer isolation, onboarding, billing and support for each organisation." },
      { name: "Internal tool", fit: "Support the workflows and permissions of your own team or organisation.", consideration: "Prioritise staff tasks and existing systems; subscription billing may not be needed." },
    ],
    question: "Who is the customer: external organisations or your own team? An internal tool can also run in the cloud.",
    slugs: ["saas-development", "custom-software-development", "web-application-development"],
  },
  {
    id: "mobile-responsive-web",
    title: "Mobile App vs Responsive Web App",
    options: [
      { name: "Mobile app", fit: "Support frequent mobile use, device features or carefully designed offline workflows.", consideration: "Allow for installation, store review, device testing and platform updates. Offline sync still needs planning." },
      { name: "Responsive web app", fit: "Reach phones, tablets and desktops through a browser link without a required store installation.", consideration: "Device access, notifications and offline behaviour vary by browser and must be tested for your users." },
    ],
    question: "Which devices, connectivity conditions and hardware features are essential? Neither option is automatically faster or cheaper.",
    slugs: ["android-app-development", "ios-app-development", "web-application-development"],
  },
  {
    id: "erp-crm",
    title: "ERP vs CRM",
    options: [
      { name: "ERP", fit: "Coordinate operations such as purchasing, inventory, orders and accounts-facing reports.", consideration: "Agree shared records, department responsibilities and a staged migration plan." },
      { name: "CRM", fit: "Organise leads, customer conversations, sales opportunities and follow-up tasks.", consideration: "Define the sales process, access rules and how customer data connects to orders or support." },
    ],
    question: "Is the main gap operational coordination or customer follow-up? ERP and CRM can overlap or connect; you may not need both at once.",
    slugs: ["erp-business-software", "api-system-integrations"],
  },
  {
    id: "custom-off-the-shelf",
    title: "Custom vs Off-the-shelf",
    options: [
      { name: "Custom software", fit: "Address important workflows or integrations that available products cannot meet well.", consideration: "Budget for discovery, development, testing and ongoing care; agree code ownership and third-party licences in writing." },
      { name: "Off-the-shelf software", fit: "Use an existing product when its configuration and features already meet your needs.", consideration: "Check licence fees, exports, permissions, integration limits and the cost of moving away later." },
    ],
    question: "Try the real workflow before choosing. Compare migration, training, maintenance and recurring costs—not just the initial price.",
    slugs: ["custom-software-development", "api-system-integrations"],
  },
] as const;

/** Keep CMS names and only link to records supplied by the public index. */
export function getComparisonServices(services: ServiceCardModel[], comparisonId: string): ServiceCardModel[] {
  const comparison = SOLUTION_COMPARISONS.find((item) => item.id === comparisonId);
  if (!comparison) return [];
  return comparison.slugs.flatMap((slug) => {
    const service = services.find((item) => item.slug === slug);
    return service ? [service] : [];
  });
}
