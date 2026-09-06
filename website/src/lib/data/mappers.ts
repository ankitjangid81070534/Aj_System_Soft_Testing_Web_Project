/**
 * Pure row→teaser mappers for home-page content. Kept free of Supabase
 * imports so they are unit-testable and reusable.
 */

export type ServiceTeaser = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: string | null;
  icon: string | null;
};

export type ProjectTeaser = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  coverUrl: string | null;
  platformType: string | null;
  industry: string | null;
  clientName: string | null;
  status: string;
  isFeatured: boolean;
};

export type TeamTeaser = {
  id: string;
  name: string;
  roleTitle: string;
  shortBio: string | null;
  photoUrl: string | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  email: string | null;
};

export type TestimonialTeaser = {
  id: string;
  quote: string;
  rating: number;
  title: string | null;
  projectName: string | null;
  adminResponse: string | null;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
};

export type ServiceRowLike = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  category: string | null;
  icon: string | null;
};

export type ProjectRowLike = {
  id: string;
  slug: string;
  name: string;
  short_summary: string | null;
  cover_image_url: string | null;
  platform_type: string | null;
  industry: string | null;
  is_featured: boolean;
  status: string;
};

export type TeamRowLike = {
  id: string;
  name: string;
  role_title: string | null;
  short_bio: string | null;
  profile_photo_url: string | null;
  skills: unknown;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  email: string | null;
  public_email: boolean;
};

export type TestimonialRowLike = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  rating?: number | null;
  title?: string | null;
  project_name?: string | null;
  admin_response?: string | null;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function toServiceTeaser(row: ServiceRowLike): ServiceTeaser {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    category: row.category,
    icon: row.icon,
  };
}

export function toProjectTeaser(row: ProjectRowLike, clientName?: string | null): ProjectTeaser {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.short_summary ?? "",
    coverUrl: row.cover_image_url,
    platformType: row.platform_type,
    industry: row.industry,
    clientName: clientName ?? null,
    status: row.status,
    isFeatured: row.is_featured,
  };
}

export function toTeamTeaser(row: TeamRowLike): TeamTeaser {
  return {
    id: row.id,
    name: row.name,
    roleTitle: row.role_title ?? "",
    shortBio: row.short_bio,
    photoUrl: row.profile_photo_url,
    skills: asStringArray(row.skills),
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    portfolioUrl: row.portfolio_url,
    // Email is shown only when the member opted in via public_email.
    email: row.public_email && row.email ? row.email : null,
  };
}

export function toTestimonialTeaser(row: TestimonialRowLike): TestimonialTeaser {
  return {
    id: row.id,
    quote: row.quote,
    rating: row.rating ?? 5,
    title: row.title ?? null,
    projectName: row.project_name ?? null,
    adminResponse: row.admin_response ?? null,
    authorName: row.author_name,
    authorRole: row.author_role,
    authorCompany: row.author_company,
  };
}
