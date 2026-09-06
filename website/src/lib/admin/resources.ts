import { z } from "zod";

/**
 * Declarative resource definitions driving the generic admin CRUD UI.
 * Every write goes through lib/admin/actions.ts which:
 *   1. verifies the caller's role with can() (server-side),
 *   2. validates the payload against the Zod schema built from these fields,
 *   3. writes through the service-role client with an allow-listed payload.
 * RLS still protects every non-admin path; audit triggers record changes.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "number"
  | "boolean"
  | "select"
  | "slug"
  | "image"
  | "lines"
  | "datetime";

export type FieldOption = { value: string; label: string };

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  options?: readonly FieldOption[];
  hint?: string;
  wide?: boolean;
};

export type ListColumn = {
  name: string;
  label: string;
  render?: "text" | "status" | "datetime" | "boolean";
};

export type ResourceKey =
  | "services"
  | "clients"
  | "projects"
  | "team"
  | "testimonials"
  | "posts"
  | "categories"
  | "tags"
  | "navigation"
  | "payments"
  | "seo"
  | "redirects"
  | "offers"
  | "announcements"
  | "benefits"
  | "ai-methods"
  | "socials";

export type CapabilityBase = "content" | "settings";

export type ResourceConfig = {
  key: ResourceKey;
  label: string;
  singular: string;
  table: string;
  section: string;
  capability: CapabilityBase;
  listColumns: ListColumn[];
  searchFields: string[];
  fields: FieldDef[];
  supports: {
    publish?: boolean;
    activate?: boolean;
    softDelete?: boolean;
    reorder?: boolean;
  };
  defaultOrder: { column: string; asc: boolean };
  /** Public preview base path; final URL = base + "/" + slug (when published). */
  publicBase?: string;
  slugSource?: string;
  /** The table physically contains created_by / updated_by columns. */
  actorColumns?: boolean;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
] as const;

const seoFields: FieldDef[] = [
  { name: "seo_title", label: "SEO title", type: "text", max: 120 },
  { name: "seo_description", label: "SEO description", type: "textarea", max: 300 },
];

function contentSupports(reorder = false) {
  return { publish: true, activate: true, softDelete: true, reorder };
}

export const RESOURCES: Record<ResourceKey, ResourceConfig> = {
  services: {
    key: "services",
    label: "Services",
    singular: "Service",
    table: "services",
    section: "services",
    capability: "content",
    supports: contentSupports(true),
    defaultOrder: { column: "sort_order", asc: true },
    publicBase: "/services",
    slugSource: "name",
    actorColumns: true,
    listColumns: [
      { name: "name", label: "Service" },
      { name: "category", label: "Category" },
      { name: "status", label: "Status", render: "status" },
      { name: "is_active", label: "Active", render: "boolean" },
    ],
    searchFields: ["name", "slug", "short_description", "category"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 160 },
      {
        name: "slug",
        label: "Slug",
        type: "slug",
        required: true,
        max: 160,
        hint: "Lowercase, hyphens — used in the public URL.",
      },
      { name: "category", label: "Category", type: "text", max: 80 },
      {
        name: "icon",
        label: "Icon key",
        type: "text",
        max: 40,
        hint: "e.g. code, globe, smartphone, dashboard, cart, cloud, stethoscope, pill, store, hotel, server.",
      },
      {
        name: "short_description",
        label: "Short description",
        type: "textarea",
        required: true,
        max: 400,
        wide: true,
      },
      {
        name: "long_description",
        label: "Long description",
        type: "markdown",
        max: 8000,
        wide: true,
        hint: "Blank line separates paragraphs.",
      },
      {
        name: "problems",
        label: "Business problems solved",
        type: "lines",
        wide: true,
        hint: "One per line.",
      },
      {
        name: "features",
        label: "Capabilities / features",
        type: "lines",
        wide: true,
        hint: "One per line.",
      },
      {
        name: "deliverables",
        label: "Deliverables",
        type: "lines",
        wide: true,
        hint: "One per line.",
      },
      { name: "platforms", label: "Platforms", type: "lines", hint: "One per line." },
      { name: "industries", label: "Industries", type: "lines", hint: "One per line." },
      {
        name: "process_steps",
        label: "Process steps",
        type: "lines",
        wide: true,
        hint: "One per line, in order.",
      },
      { name: "cta_label", label: "CTA label", type: "text", max: 60 },
      { name: "cta_href", label: "CTA link", type: "text", max: 200 },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
      ...seoFields,
      { name: "og_image_url", label: "OG image URL", type: "image", max: 500 },
    ],
  },

  clients: {
    key: "clients",
    label: "Clients",
    singular: "Client",
    table: "clients",
    section: "clients",
    capability: "content",
    supports: contentSupports(true),
    defaultOrder: { column: "sort_order", asc: true },
    slugSource: "name",
    actorColumns: true,
    listColumns: [
      { name: "name", label: "Client" },
      { name: "industry", label: "Industry" },
      { name: "public_permission", label: "Public", render: "boolean" },
      { name: "status", label: "Status", render: "status" },
    ],
    searchFields: ["name", "slug", "industry"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 160 },
      { name: "slug", label: "Slug", type: "slug", required: true, max: 160 },
      { name: "industry", label: "Industry", type: "text", max: 80 },
      { name: "location", label: "Location", type: "text", max: 120 },
      { name: "logo_url", label: "Logo URL", type: "image", max: 500 },
      {
        name: "auth_user_id",
        label: "Portal Auth user UUID",
        type: "text",
        max: 36,
        wide: true,
        hint: "Paste the verified Supabase Authentication user UUID to link this real client. Leave blank until identity is confirmed.",
      },
      {
        name: "portal_enabled",
        label: "Client portal enabled",
        type: "boolean",
        hint: "Controls private project access and verified-review eligibility.",
      },
      {
        name: "public_permission",
        label: "Public permission",
        type: "boolean",
        wide: true,
        hint: "Only clients with permission can appear on the public site.",
      },
      { name: "internal_notes", label: "Internal notes", type: "textarea", max: 2000, wide: true },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },

  projects: {
    key: "projects",
    label: "Projects",
    singular: "Project",
    table: "projects",
    section: "projects",
    capability: "content",
    supports: contentSupports(true),
    defaultOrder: { column: "sort_order", asc: true },
    publicBase: "/projects",
    slugSource: "name",
    actorColumns: true,
    listColumns: [
      { name: "name", label: "Project" },
      { name: "platform_type", label: "Platform" },
      { name: "industry", label: "Industry" },
      { name: "status", label: "Status", render: "status" },
      { name: "is_public", label: "Public", render: "boolean" },
    ],
    searchFields: ["name", "slug", "short_summary", "platform_type", "industry"],
    fields: [
      { name: "name", label: "Project name", type: "text", required: true, max: 200 },
      { name: "slug", label: "Slug", type: "slug", required: true, max: 200 },
      {
        name: "short_summary",
        label: "Short summary",
        type: "textarea",
        required: true,
        max: 400,
        wide: true,
      },
      { name: "overview", label: "Overview", type: "markdown", max: 8000, wide: true },
      { name: "problem", label: "The challenge", type: "markdown", max: 8000, wide: true },
      { name: "solution", label: "Our solution", type: "markdown", max: 8000, wide: true },
      { name: "key_features", label: "Key features", type: "lines", wide: true },
      { name: "technology_stack", label: "Technology stack", type: "lines", hint: "One per line." },
      { name: "integrations", label: "Integrations", type: "lines", hint: "One per line." },
      { name: "database_note", label: "Data layer note", type: "textarea", max: 500, wide: true },
      { name: "platform_type", label: "Platform", type: "text", max: 80 },
      { name: "industry", label: "Industry", type: "text", max: 80 },
      { name: "duration", label: "Duration", type: "text", max: 80 },
      { name: "project_year", label: "Year", type: "number" },
      {
        name: "project_status",
        label: "Project state",
        type: "text",
        max: 40,
        hint: "e.g. completed, ongoing, maintained.",
      },
      { name: "cover_image_url", label: "Cover image URL", type: "image", max: 500 },
      { name: "video_url", label: "Video URL (optional)", type: "text", max: 500 },
      {
        name: "impact_results",
        label: "Real results",
        type: "lines",
        wide: true,
        hint: "Only real, verifiable outcomes — never invent numbers.",
      },
      {
        name: "testimonial_quote",
        label: "Testimonial quote (real only)",
        type: "textarea",
        max: 1000,
        wide: true,
      },
      { name: "testimonial_person", label: "Testimonial person", type: "text", max: 120 },
      { name: "testimonial_role", label: "Testimonial role / company", type: "text", max: 160 },
      { name: "public_url", label: "Live product URL", type: "text", max: 300 },
      { name: "is_public", label: "Public (visible on site)", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
      { name: "sort_order", label: "Sort order", type: "number" },
      ...seoFields,
      { name: "og_image_url", label: "OG image URL", type: "image", max: 500 },
    ],
  },

  team: {
    key: "team",
    label: "Team",
    singular: "Team member",
    table: "team_members",
    section: "team",
    capability: "content",
    supports: contentSupports(true),
    defaultOrder: { column: "sort_order", asc: true },
    slugSource: "name",
    actorColumns: true,
    listColumns: [
      { name: "name", label: "Name" },
      { name: "role_title", label: "Role" },
      { name: "status", label: "Status", render: "status" },
      { name: "is_public", label: "Public", render: "boolean" },
    ],
    searchFields: ["name", "role_title", "short_bio"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 120 },
      { name: "role_title", label: "Role title", type: "text", max: 120 },
      { name: "short_bio", label: "Short bio", type: "textarea", max: 400, wide: true },
      { name: "long_bio", label: "Long bio", type: "markdown", max: 8000, wide: true },
      { name: "profile_photo_url", label: "Photo URL", type: "image", max: 500 },
      {
        name: "skills",
        label: "Skills",
        type: "lines",
        hint: "One per line (first 4 shown on cards).",
      },
      { name: "linkedin_url", label: "LinkedIn URL", type: "text", max: 300 },
      { name: "github_url", label: "GitHub URL", type: "text", max: 300 },
      { name: "portfolio_url", label: "Portfolio URL", type: "text", max: 300 },
      { name: "email", label: "Email", type: "text", max: 200 },
      {
        name: "public_email",
        label: "Show email publicly",
        type: "boolean",
        hint: "The email appears on the team page only when this is on.",
      },
      { name: "is_public", label: "Public profile", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },

  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    table: "testimonials",
    section: "testimonials",
    capability: "content",
    supports: contentSupports(true),
    defaultOrder: { column: "sort_order", asc: true },
    actorColumns: true,
    listColumns: [
      { name: "author_name", label: "Author" },
      { name: "rating", label: "Rating" },
      { name: "is_verified", label: "Verified", render: "boolean" },
      { name: "status", label: "Status", render: "status" },
      { name: "is_public", label: "Public", render: "boolean" },
    ],
    searchFields: ["author_name", "author_company", "title", "quote", "review_text"],
    fields: [
      { name: "author_name", label: "Author name", type: "text", required: true, max: 120 },
      { name: "author_role", label: "Author role", type: "text", max: 120 },
      { name: "author_company", label: "Author company", type: "text", max: 120 },
      { name: "rating", label: "Rating (1–5)", type: "number" },
      { name: "title", label: "Review title", type: "text", max: 120 },
      { name: "quote", label: "Quote", type: "textarea", required: true, max: 1000, wide: true },
      { name: "review_text", label: "Full review", type: "textarea", max: 2000, wide: true },
      { name: "project_name", label: "Project name", type: "text", max: 200 },
      {
        name: "admin_response",
        label: "Public admin response",
        type: "textarea",
        max: 1200,
        wide: true,
      },
      { name: "avatar_url", label: "Avatar URL", type: "image", max: 500 },
      {
        name: "is_verified",
        label: "Verified client review",
        type: "boolean",
        hint: "Keep enabled only when the submission is linked to a confirmed client relationship.",
      },
      { name: "is_public", label: "Public", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },

  posts: {
    key: "posts",
    label: "Blog posts",
    singular: "Post",
    table: "blog_posts",
    section: "posts",
    capability: "content",
    supports: contentSupports(true),
    defaultOrder: { column: "created_at", asc: false },
    publicBase: "/blog",
    slugSource: "title",
    actorColumns: true,
    listColumns: [
      { name: "title", label: "Title" },
      { name: "status", label: "Status", render: "status" },
      { name: "published_at", label: "Published", render: "datetime" },
    ],
    searchFields: ["title", "slug", "excerpt"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 200 },
      { name: "slug", label: "Slug", type: "slug", required: true, max: 200 },
      { name: "excerpt", label: "Excerpt", type: "textarea", max: 400, wide: true },
      { name: "content", label: "Content (markdown)", type: "markdown", max: 100000, wide: true },
      { name: "cover_image_url", label: "Cover image URL", type: "image", max: 500 },
      {
        name: "category_id",
        label: "Category",
        type: "select",
        hint: "Managed under Blog categories.",
      },
      { name: "reading_minutes", label: "Reading minutes", type: "number" },
      {
        name: "published_at",
        label: "Publish date",
        type: "datetime",
        hint: "Empty = publish immediately when status is Published.",
      },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
      ...seoFields,
      { name: "og_image_url", label: "OG image URL", type: "image", max: 500 },
    ],
  },

  categories: {
    key: "categories",
    label: "Blog categories",
    singular: "Category",
    table: "blog_categories",
    section: "categories",
    capability: "content",
    supports: {},
    defaultOrder: { column: "name", asc: true },
    slugSource: "name",
    listColumns: [
      { name: "name", label: "Category" },
      { name: "slug", label: "Slug" },
    ],
    searchFields: ["name", "slug"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 80 },
      { name: "slug", label: "Slug", type: "slug", required: true, max: 80 },
      { name: "description", label: "Description", type: "textarea", max: 400, wide: true },
    ],
  },

  tags: {
    key: "tags",
    label: "Blog tags",
    singular: "Tag",
    table: "blog_tags",
    section: "tags",
    capability: "content",
    supports: {},
    defaultOrder: { column: "name", asc: true },
    slugSource: "name",
    listColumns: [
      { name: "name", label: "Tag" },
      { name: "slug", label: "Slug" },
    ],
    searchFields: ["name", "slug"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 60 },
      { name: "slug", label: "Slug", type: "slug", required: true, max: 60 },
    ],
  },

  navigation: {
    key: "navigation",
    label: "Navigation",
    singular: "Navigation item",
    table: "navigation_items",
    section: "navigation",
    capability: "settings",
    supports: { activate: true, reorder: true },
    defaultOrder: { column: "sort_order", asc: true },
    listColumns: [
      { name: "label", label: "Label" },
      { name: "url", label: "URL" },
      { name: "location", label: "Location" },
      { name: "is_active", label: "Active", render: "boolean" },
    ],
    searchFields: ["label", "url"],
    fields: [
      { name: "label", label: "Label", type: "text", required: true, max: 80 },
      { name: "url", label: "URL", type: "text", required: true, max: 300 },
      {
        name: "location",
        label: "Location",
        type: "select",
        options: [
          { value: "header", label: "Header" },
          { value: "footer", label: "Footer" },
        ],
        required: true,
      },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
  },

  payments: {
    key: "payments",
    label: "Payment links",
    singular: "Payment link",
    table: "payment_links",
    section: "payments",
    capability: "settings",
    supports: { activate: true },
    defaultOrder: { column: "created_at", asc: false },
    actorColumns: true,
    listColumns: [
      { name: "title", label: "Title" },
      { name: "amount_label", label: "Amount" },
      { name: "is_active", label: "Active", render: "boolean" },
      { name: "expires_at", label: "Expires", render: "datetime" },
    ],
    searchFields: ["title", "description", "url"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 160 },
      { name: "description", label: "Description", type: "textarea", max: 1000, wide: true },
      { name: "amount_label", label: "Amount label", type: "text", max: 80 },
      {
        name: "url",
        label: "Secure external payment URL",
        type: "text",
        required: true,
        max: 500,
        hint: "Link to your payment gateway checkout — never collect card details here.",
      },
      { name: "expires_at", label: "Expires at", type: "datetime" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
  },

  offers: {
    key: "offers",
    label: "Offers",
    singular: "Offer",
    table: "offers",
    section: "offers",
    capability: "content",
    supports: { activate: true, reorder: true },
    defaultOrder: { column: "sort_order", asc: true },
    slugSource: "title",
    listColumns: [
      { name: "title", label: "Title" },
      { name: "discount_label", label: "Discount" },
      { name: "is_active", label: "Active", render: "boolean" },
    ],
    searchFields: ["title", "slug", "short_description"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 120 },
      { name: "slug", label: "Slug", type: "slug", required: true, max: 120 },
      { name: "short_description", label: "Short description", type: "textarea", max: 300, wide: true },
      { name: "full_description", label: "Full description (markdown)", type: "markdown", max: 10000, wide: true },
      { name: "image_url", label: "Image URL", type: "image", max: 500 },
      { name: "original_price", label: "Original price", type: "number" },
      { name: "offer_price", label: "Offer price", type: "number" },
      { name: "discount_label", label: "Discount label", type: "text", max: 80 },
      { name: "offer_code", label: "Offer code", type: "text", max: 40 },
      { name: "offer_type", label: "Offer type", type: "select", options: [
          { value: "discount", label: "Discount" }, { value: "free", label: "Free" }, { value: "bundle", label: "Bundle" }, { value: "limited_time", label: "Limited Time" }, { value: "launch", label: "Launch" }, { value: "seasonal", label: "Seasonal" }, { value: "custom", label: "Custom" }
        ], required: true },
      { name: "free_or_paid", label: "Free or Paid", type: "select", options: [
          { value: "paid", label: "Paid" }, { value: "free", label: "Free" }
        ], required: true },
      { name: "cta_label", label: "CTA label", type: "text", max: 60 },
      { name: "cta_url", label: "CTA link", type: "text", max: 200 },
      { name: "start_at", label: "Start at", type: "datetime" },
      { name: "end_at", label: "End at", type: "datetime" },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "popup_enabled", label: "Enable popup", type: "boolean" },
      { name: "popup_priority", label: "Popup priority", type: "number" },
      { name: "popup_frequency", label: "Popup frequency", type: "select", options: [
          { value: "every_visit", label: "Every visit" }, { value: "once_per_session", label: "Once per session" }, { value: "once_per_day", label: "Once per day" }, { value: "custom", label: "Custom hours" }
        ], required: true },
      { name: "popup_custom_hours", label: "Popup custom hours", type: "number" },
      { name: "show_on_home", label: "Show on homepage", type: "boolean" },
      { name: "seo_title", label: "SEO Title", type: "text", max: 120 },
      { name: "seo_description", label: "SEO Description", type: "textarea", max: 300, wide: true },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },

  announcements: {
    key: "announcements",
    label: "Announcements",
    singular: "Announcement",
    table: "announcements",
    section: "announcements",
    capability: "content",
    supports: { activate: true },
    defaultOrder: { column: "created_at", asc: false },
    slugSource: "title",
    listColumns: [
      { name: "title", label: "Title" },
      { name: "is_active", label: "Active", render: "boolean" },
    ],
    searchFields: ["title", "slug", "summary"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 120 },
      { name: "slug", label: "Slug", type: "slug", required: true, max: 120 },
      { name: "summary", label: "Summary", type: "textarea", max: 300, wide: true },
      { name: "body", label: "Body (markdown)", type: "markdown", max: 10000, wide: true },
      { name: "update_type", label: "Update type", type: "select", options: [
          { value: "product_update", label: "Product Update" }, { value: "new_feature", label: "New Feature" }, { value: "free_update", label: "Free Update" }, { value: "paid_update", label: "Paid Update" }, { value: "service_update", label: "Service Update" }, { value: "maintenance", label: "Maintenance" }, { value: "company_news", label: "Company News" }, { value: "promotion", label: "Promotion" }
        ], required: true },
      { name: "free_or_paid", label: "Free or Paid", type: "select", options: [
          { value: "free", label: "Free" }, { value: "paid", label: "Paid" }
        ], required: true },
      { name: "price_label", label: "Price label", type: "text", max: 80 },
      { name: "image_url", label: "Image URL", type: "image", max: 500 },
      { name: "icon", label: "Icon", type: "text", max: 60 },
      { name: "badge_label", label: "Badge label", type: "text", max: 60 },
      { name: "cta_label", label: "CTA label", type: "text", max: 60 },
      { name: "cta_url", label: "CTA link", type: "text", max: 200 },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "start_at", label: "Start at", type: "datetime" },
      { name: "end_at", label: "End at", type: "datetime" },
      { name: "priority", label: "Priority", type: "number" },
      { name: "display_position", label: "Display position", type: "select", options: [
          { value: "top_bar", label: "Top bar" }, { value: "homepage", label: "Homepage" }, { value: "side_floating", label: "Side floating" }, { value: "update_center", label: "Update center" }, { value: "footer", label: "Footer" }
        ], required: true },
      { name: "is_dismissible", label: "Dismissible", type: "boolean" },
      { name: "seo_title", label: "SEO Title", type: "text", max: 120 },
      { name: "seo_description", label: "SEO Description", type: "textarea", max: 300, wide: true },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },

  benefits: {
    key: "benefits",
    label: "Launch Benefits",
    singular: "Benefit",
    table: "launch_benefits",
    section: "benefits",
    capability: "content",
    supports: { activate: true, reorder: true },
    defaultOrder: { column: "sort_order", asc: true },
    listColumns: [
      { name: "title", label: "Title" },
      { name: "is_active", label: "Active", render: "boolean" },
    ],
    searchFields: ["title", "description"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 100 },
      { name: "description", label: "Description", type: "textarea", max: 300, wide: true },
      { name: "icon", label: "Icon", type: "text", max: 40 },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },

  "ai-methods": {
    key: "ai-methods",
    label: "AI Methods",
    singular: "AI Method",
    table: "ai_methods",
    section: "ai-methods",
    capability: "content",
    supports: { activate: true, reorder: true },
    defaultOrder: { column: "sort_order", asc: true },
    actorColumns: true,
    listColumns: [
      { name: "title", label: "Title" },
      { name: "url", label: "Link" },
      { name: "is_active", label: "Active", render: "boolean" },
    ],
    searchFields: ["title", "url", "description"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 120 },
      {
        name: "url",
        label: "Link URL",
        type: "text",
        required: true,
        max: 500,
        hint: "Secure https:// link the card opens — e.g. https://chat.openai.com/…",
      },
      {
        name: "description",
        label: "Short description",
        type: "textarea",
        max: 300,
        wide: true,
        hint: "Optional — shown under the title on the card.",
      },
      {
        name: "image_url",
        label: "Image URL",
        type: "image",
        max: 500,
        hint: "Optional — paste a Media Library (Supabase storage) URL.",
      },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },

  socials: {
    key: "socials",
    label: "Social Links",
    singular: "Social Link",
    table: "social_links",
    section: "socials",
    capability: "settings",
    supports: { activate: true, reorder: true },
    defaultOrder: { column: "sort_order", asc: true },
    listColumns: [
      { name: "label", label: "Label" },
      { name: "platform", label: "Platform" },
      { name: "is_active", label: "Active", render: "boolean" },
    ],
    searchFields: ["label", "platform", "url"],
    fields: [
      { name: "platform", label: "Platform", type: "select", options: [
          { value: "whatsapp", label: "WhatsApp" }, { value: "instagram", label: "Instagram" }, { value: "youtube", label: "YouTube" }, { value: "linkedin", label: "LinkedIn" }, { value: "facebook", label: "Facebook" }, { value: "x", label: "X (Twitter)" }, { value: "github", label: "GitHub" }, { value: "telegram", label: "Telegram" }, { value: "website", label: "Website" }
        ], required: true },
      { name: "label", label: "Label (optional)", type: "text", max: 60 },
      { name: "url", label: "URL", type: "text", required: true, max: 300 },
      { name: "is_active", label: "Active", type: "boolean" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },

  seo: {
    key: "seo",
    label: "SEO metadata",
    singular: "SEO entry",
    table: "seo_metadata",
    section: "seo",
    capability: "settings",
    supports: {},
    defaultOrder: { column: "path", asc: true },
    actorColumns: true,
    listColumns: [
      { name: "path", label: "Path" },
      { name: "title", label: "Title" },
      { name: "no_index", label: "No-index", render: "boolean" },
    ],
    searchFields: ["path", "title"],
    fields: [
      {
        name: "path",
        label: "Path",
        type: "text",
        required: true,
        max: 200,
        hint: "Site path starting with / — e.g. /services.",
      },
      { name: "title", label: "Title override", type: "text", max: 120 },
      { name: "description", label: "Description override", type: "textarea", max: 300 },
      { name: "og_image_url", label: "OG image URL", type: "image", max: 500 },
      { name: "no_index", label: "No-index this path", type: "boolean" },
    ],
  },

  redirects: {
    key: "redirects",
    label: "Redirects",
    singular: "Redirect",
    table: "redirects",
    section: "redirects",
    capability: "settings",
    supports: { activate: true },
    defaultOrder: { column: "from_path", asc: true },
    listColumns: [
      { name: "from_path", label: "From" },
      { name: "to_path", label: "To" },
      { name: "is_active", label: "Active", render: "boolean" },
    ],
    searchFields: ["from_path", "to_path"],
    fields: [
      {
        name: "from_path",
        label: "From path",
        type: "text",
        required: true,
        max: 300,
        hint: "Old path starting with /.",
      },
      { name: "to_path", label: "To path", type: "text", required: true, max: 300 },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
  },
};

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSafeInternalPath(value: string): boolean {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001f]/.test(value)
  );
}

export function isSafeNavigationTarget(value: string): boolean {
  if (isSafeInternalPath(value)) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Build a strict Zod schema from a resource's field definitions. Unknown keys
 * are stripped, so the write payload is allow-listed by construction.
 */
export function buildResourceSchema(config: ResourceConfig): z.ZodType<Record<string, unknown>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of config.fields) {
    const max = field.max ?? 500;
    switch (field.type) {
      case "text":
      case "textarea":
      case "markdown":
      case "image":
        shape[field.name] = field.required
          ? z.string().trim().min(1, `${field.label} is required`).max(max)
          : z.optional(z.string().trim().max(max));
        if (field.name === "auth_user_id") {
          shape[field.name] = z
            .string()
            .trim()
            .max(36)
            .refine((value) => value === "" || z.uuid().safeParse(value).success, {
              message: "Enter a valid Supabase user UUID or leave this blank",
            });
        }
        if (config.key === "navigation" && field.name === "url") {
          shape[field.name] = z
            .string()
            .trim()
            .min(1, "URL is required")
            .max(max)
            .refine(isSafeNavigationTarget, "Use a site path or a secure https:// URL");
        }
        if (config.key === "payments" && field.name === "url") {
          shape[field.name] = z
            .string()
            .trim()
            .min(1, "Payment URL is required")
            .max(max)
            .refine(isHttpsUrl, "Payment links must use https://");
        }
        if (config.key === "ai-methods" && field.name === "url") {
          shape[field.name] = z
            .string()
            .trim()
            .min(1, "URL is required")
            .max(max)
            .refine(isHttpsUrl, "AI method links must use https://");
        }
        if (config.key === "seo" && field.name === "path") {
          shape[field.name] = z
            .string()
            .trim()
            .min(1, "Path is required")
            .max(max)
            .refine(isSafeInternalPath, "Use a site path beginning with one /");
        }
        if (
          config.key === "redirects" &&
          (field.name === "from_path" || field.name === "to_path")
        ) {
          shape[field.name] = z
            .string()
            .trim()
            .min(1, `${field.label} is required`)
            .max(max)
            .refine(isSafeInternalPath, "Redirects must stay on this site and begin with one /");
        }
        break;
      case "slug":
        // An empty slug is allowed here so the server action can auto-generate
        // it from the slug source; non-empty values must still be well-formed.
        shape[field.name] = z
          .string()
          .trim()
          .max(max)
          .refine(
            (value) => value === "" || SLUG_PATTERN.test(value),
            "Use lowercase letters, numbers and hyphens only",
          );
        break;
      case "number":
        // Non-numeric input becomes a field error instead of silently
        // storing NULL or reaching the database as garbage.
        shape[field.name] = z
          .optional(
            z.union([
              z
                .string()
                .refine(
                  (value) => value === "" || Number.isFinite(Number(value)),
                  `${field.label} must be a number`,
                ),
              z.number(),
            ]),
          )
          .transform((value) => {
            if (value === undefined || value === "") return null;
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : null;
          });
        break;
      case "boolean":
        shape[field.name] = z
          .optional(z.union([z.literal("on"), z.boolean()]))
          .transform((value) => value === "on" || value === true);
        break;
      case "select":
        if (field.options) {
          const values = field.options.map((option) => option.value);
          shape[field.name] = z
            .string()
            .refine((value) => values.includes(value), `Choose a ${field.label.toLowerCase()}`);
        } else {
          shape[field.name] = z.optional(z.string().max(max));
        }
        break;
      case "lines":
        shape[field.name] = z.optional(z.string().max(40000));
        break;
      case "datetime":
        // Invalid date strings must fail validation here, not surface later
        // as a generic database error after Postgres rejects them.
        shape[field.name] = z
          .optional(
            z
              .string()
              .max(40)
              .refine(
                (value) => value === "" || !Number.isNaN(new Date(value).getTime()),
                `${field.label} must be a valid date/time`,
              ),
          )
          .transform((value) => (value && value !== "" ? value : null));
        break;
    }
  }
  const schema = z.object(shape);
  if (config.key !== "redirects") return schema;
  return schema.superRefine((values, ctx) => {
    if (values.from_path === values.to_path) {
      ctx.addIssue({
        code: "custom",
        path: ["to_path"],
        message: "The destination must differ from the source to prevent a redirect loop",
      });
    }
  });
}
