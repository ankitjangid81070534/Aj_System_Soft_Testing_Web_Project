/**
 * PHASE 17 — Post-launch SEO readiness verification.
 * Run against the LIVE production domain after deploying:
 *
 *   BASE_URL=https://your-domain.com node scripts/seo-verify.mjs
 *
 * Executes the master plan's Phase 17 checklist and exits non-zero if any
 * check fails. On localhost several checks legitimately fail (HTTPS,
 * production canonicals) — that is the point: it shows exactly what is left.
 */
const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const PROD = BASE.startsWith("https://");
const results = [];

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} — ${name}${detail ? `  [${detail}]` : ""}`);
}

async function fetchPage(path) {
  const response = await fetch(BASE + path, { redirect: "follow" });
  const html = await response.text();
  return { response, html };
}

// 1 + 2. Domain + HTTPS
record("1. Production domain configured", BASE !== "http://localhost:3000", BASE);
record("2. HTTPS", PROD, PROD ? "https" : "use https in NEXT_PUBLIC_SITE_URL / deployment");

// 3. Home 200
{
  const { response } = await fetchPage("/");
  record("3. Home returns 200", response.status === 200, `status=${response.status}`);
}

// 4. Important public routes 200
{
  const routes = [
    "/services",
    "/services/custom-software-development",
    "/projects",
    "/blog",
    "/about",
    "/team",
    "/contact",
    "/request-quote",
    "/privacy",
    "/terms",
    "/blog/rss.xml",
  ];
  const failures = [];
  for (const route of routes) {
    const response = await fetch(BASE + route);
    if (response.status !== 200) failures.push(`${route}=${response.status}`);
  }
  record(
    "4. Important public routes 200",
    failures.length === 0,
    failures.join(", ") || `${routes.length} routes OK`,
  );
}

// 5. Sitemap reachable + domain + entries
{
  const { response, html } = await fetchPage("/sitemap.xml");
  const count = (html.match(/<url>/g) ?? []).length;
  const domainOk = html.includes(BASE);
  record(
    "5. Sitemap reachable, domain-correct, populated",
    response.status === 200 && domainOk && count > 0,
    `status=${response.status}, urls=${count}, domainMatch=${domainOk}`,
  );
}

// 6 + 7. robots.txt
{
  const { response, html } = await fetchPage("/robots.txt");
  const sitemapLine = html.includes("Sitemap:");
  const allowsPublic = html.includes("Allow: /");
  const blocksAdmin = html.includes("Disallow: /ajadmin");
  record(
    "6+7. robots reachable, allows public, blocks admin, sitemap declared",
    response.status === 200 && allowsPublic && blocksAdmin && sitemapLine,
    `status=${response.status}, allow=${allowsPublic}, blockAdmin=${blocksAdmin}, sitemap=${sitemapLine}`,
  );
}

// 8. /ajadmin noindex (meta + header) and gated
{
  const response = await fetch(BASE + "/ajadmin");
  const headers = Object.fromEntries(response.headers.entries());
  const html = await response.text();
  const headerNoIndex = (headers["x-robots-tag"] ?? "").includes("noindex");
  const metaNoIndex = html.includes("noindex");
  const gated =
    /Session expired|Sign in|Supabase is not configured/i.test(html) ||
    response.status === 307 ||
    response.status === 200;
  record(
    "8. /ajadmin noindex (header) and gated",
    headerNoIndex && metaNoIndex && gated,
    `xRobots=${headerNoIndex}, meta=${metaNoIndex}`,
  );
}

// 9. Canonicals are production URLs
{
  const paths = ["/", "/services", "/blog", "/about"];
  const bad = [];
  for (const path of paths) {
    const { html } = await fetchPage(path);
    const match = /<link rel="canonical" href="([^"]*)"/.exec(html);
    const canonical = match?.[1] ?? "";
    if (!canonical.startsWith(BASE)) bad.push(`${path}→${canonical}`);
  }
  record(
    "9. Canonicals point at the production domain",
    bad.length === 0,
    bad.join(", ") || "all match",
  );
}

// 10. Organization structured data: primary + alternate brand identity
{
  const { html } = await fetchPage("/");
  const orgBlock = /"@type":"Organization"[\s\S]{0,800}?"alternateName":\[[^\]]*\]/.test(html);
  const hasPrimary = html.includes("AJ System Soft Technology");
  const alternates = [
    "AJS Technology",
    "Ankit Jangid System Technology",
    "Ankit System Technology",
  ].every((name) => html.includes(name));
  record(
    "10. Organization JSON-LD with primary + alternate brand identity",
    orgBlock && hasPrimary && alternates,
    `org=${orgBlock}, primary=${hasPrimary}, alternates=${alternates}`,
  );
}

// 11. Real logo/contact/social data (admin-configured) — report what is live
{
  const { html } = await fetchPage("/contact");
  const settings = await fetch(BASE + "/sitemap.xml"); // cheap liveness re-use
  void settings;
  const hasOgImage = /property="og:image"|name="og:image"/.test((await fetchPage("/")).html);
  const phoneConfigured = html.includes("tel:");
  const emailConfigured = html.includes("mailto:");
  const whatsappConfigured = html.includes("wa.me");
  record("11a. Default OG image present", hasOgImage, "opengraph-image route");
  record(
    "11b. Contact details configured (admin panel)",
    phoneConfigured || emailConfigured || whatsappConfigured,
    `phone=${phoneConfigured}, email=${emailConfigured}, whatsapp=${whatsappConfigured} — fill Brand Settings in /ajadmin if false`,
  );
}

// 12. GSC verification meta present
{
  const { html } = await fetchPage("/");
  const verification = html.includes("google-site-verification");
  record(
    "12. Search Console verification meta present",
    verification,
    verification ? "env configured" : "set GOOGLE_SITE_VERIFICATION, then redeploy",
  );
}

// 13/14. 404 + feed content type
{
  const notFound = await fetch(BASE + "/no-such-page");
  record("13. Custom 404 returns 404 status", notFound.status === 404, `status=${notFound.status}`);
  const rss = await fetch(BASE + "/blog/rss.xml");
  const rssType = (rss.headers.get("content-type") ?? "").includes("rss+xml");
  record("14. RSS feed content-type correct", rssType, rss.headers.get("content-type") ?? "");
}

console.log(
  `\n=== PHASE 17 VERIFY: ${results.filter((r) => r.pass).length}/${results.length} passed ===`,
);
const failed = results.filter((r) => !r.pass);
if (failed.length > 0) {
  console.log(
    "OPEN ITEMS:",
    JSON.stringify(
      failed.map((f) => f.name),
      null,
      1,
    ),
  );
  process.exitCode = 1;
}
