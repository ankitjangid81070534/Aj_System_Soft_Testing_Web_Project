import { describe, expect, it } from "vitest";
import {
  toProjectTeaser,
  toTeamTeaser,
  toTestimonialTeaser,
  type ProjectRowLike,
  type TeamRowLike,
} from "@/lib/data/mappers";

describe("toProjectTeaser", () => {
  const row: ProjectRowLike = {
    id: "p1",
    slug: "hospital-management",
    name: "Hospital Management System",
    short_summary: "OPD, IPD, pharmacy and billing in one system.",
    cover_image_url: "https://example.supabase.co/storage/project/cover.webp",
    platform_type: "Web + Windows",
    industry: "Healthcare",
    is_featured: true,
    status: "published",
  };

  it("maps all display fields", () => {
    const teaser = toProjectTeaser(row, "City Hospital");
    expect(teaser).toEqual({
      id: "p1",
      slug: "hospital-management",
      name: "Hospital Management System",
      summary: "OPD, IPD, pharmacy and billing in one system.",
      coverUrl: "https://example.supabase.co/storage/project/cover.webp",
      platformType: "Web + Windows",
      industry: "Healthcare",
      clientName: "City Hospital",
      status: "published",
      isFeatured: true,
    });
  });

  it("leaves optional fields null when absent", () => {
    const teaser = toProjectTeaser({ ...row, short_summary: null });
    expect(teaser.summary).toBe("");
    expect(teaser.clientName).toBeNull();
  });
});

describe("toTeamTeaser — public_email consent is enforced", () => {
  const base: TeamRowLike = {
    id: "t1",
    name: "Ankit Jangid",
    role_title: "Founder & Developer",
    short_bio: null,
    profile_photo_url: null,
    skills: ["TypeScript", "PostgreSQL", 42],
    linkedin_url: "https://www.linkedin.com/in/example",
    github_url: null,
    portfolio_url: null,
    email: "private@example.com",
    public_email: false,
  };

  it("hides the email when public_email is false", () => {
    expect(toTeamTeaser(base).email).toBeNull();
  });

  it("exposes the email only when public_email is true", () => {
    expect(toTeamTeaser({ ...base, public_email: true }).email).toBe("private@example.com");
  });

  it("keeps only string entries from the skills jsonb array", () => {
    expect(toTeamTeaser(base).skills).toEqual(["TypeScript", "PostgreSQL"]);
  });
});

describe("toTestimonialTeaser", () => {
  it("maps quote and attribution", () => {
    const teaser = toTestimonialTeaser({
      id: "q1",
      quote: "Real quote from a real client.",
      author_name: "Real Person",
      author_role: "Owner",
      author_company: "Real Business",
    });
    expect(teaser.authorName).toBe("Real Person");
    expect(teaser.authorRole).toBe("Owner");
    expect(teaser.authorCompany).toBe("Real Business");
  });
});
