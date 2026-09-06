import { describe, expect, it } from "vitest";
import { localBusinessJsonLd, organizationJsonLd, webSiteJsonLd } from "@/lib/seo/jsonld";

describe("organizationJsonLd", () => {
  it("uses the primary brand name and all approved alternate names", () => {
    const organization = organizationJsonLd();
    expect(organization["@type"]).toBe("Organization");
    expect(organization.name).toBe("AJ System Soft Technology");
    expect(organization.alternateName).toEqual([
      "AJS Technology",
      "Ankit Jangid System Technology",
      "Ankit System Technology",
    ]);
  });

  it("points the URL at the site root and carries a stable @id", () => {
    expect(organizationJsonLd().url).toBe("http://localhost:3000/");
    expect(organizationJsonLd()["@id"]).toBe("http://localhost:3000/#organization");
  });

  it("always ships a logo so Knowledge Panel eligibility never depends on uploads", () => {
    expect(organizationJsonLd().logo.url).toBe("http://localhost:3000/opengraph-image");
  });

  it("omits sameAs until real social profiles are configured", () => {
    expect(organizationJsonLd().sameAs).toBeUndefined();
    expect(organizationJsonLd({ sameAs: ["https://github.com/example"] }).sameAs).toEqual([
      "https://github.com/example",
    ]);
  });

  it("emits a contactPoint only when a real email or phone is configured", () => {
    expect(organizationJsonLd().contactPoint).toBeUndefined();
    expect(organizationJsonLd({ contactEmail: "  " }).contactPoint).toBeUndefined();
    const withEmail = organizationJsonLd({ contactEmail: "hello@example.com" });
    expect(withEmail.contactPoint?.[0].email).toBe("hello@example.com");
    expect(withEmail.contactPoint?.[0].telephone).toBeUndefined();
  });
});

describe("webSiteJsonLd", () => {
  it("links to the organization publisher and declares an Indian-English site", () => {
    const site = webSiteJsonLd();
    expect(site.publisher["@id"]).toBe("http://localhost:3000/#organization");
    expect(site.inLanguage).toBe("en-IN");
    expect(site.potentialAction.target.urlTemplate).toContain("{search_term_string}");
  });
});

describe("localBusinessJsonLd", () => {
  it("always states the country and only real contact facts", () => {
    const business = localBusinessJsonLd();
    expect(business.address.addressCountry).toBe("IN");
    expect(business.email).toBeUndefined();
    expect(business.hasMap).toBeUndefined();
  });

  it("rejects non-https map links and trims configured values", () => {
    const business = localBusinessJsonLd({
      mapUrl: "http://maps.example.com/x",
      phone: " +91 99999 99999 ",
      addressLine: " Jaipur ",
    });
    expect(business.hasMap).toBeUndefined();
    expect(business.telephone).toBe("+91 99999 99999");
    expect(business.address.streetAddress).toBe("Jaipur");
  });
});
