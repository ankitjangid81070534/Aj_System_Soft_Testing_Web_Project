# Post-Launch — Google Search Console Guide

For the owner. Do this once the site is live on the production domain.

## 1. Verify the property

1. Go to <https://search.google.com/search-console> → **Add property** → **URL prefix** → enter
   `https://your-domain.com`.
2. Choose the **HTML tag** method. Copy the `content="…"` value of the
   `google-site-verification` meta tag.
3. Put that value in `.env.local` (and the hosting platform's environment settings):
   ```
   GOOGLE_SITE_VERIFICATION=<paste-value>
   ```
4. Deploy/restart, then click **Verify** in Search Console (the meta tag is rendered site-wide).

## 2. Submit the sitemap

- Search Console → **Sitemaps** → enter `sitemap.xml` → Submit.
- The sitemap is generated at `https://your-domain.com/sitemap.xml` and refreshes hourly;
  new services/projects/posts appear automatically after the next revalidation.

## 3. Inspect key URLs

Use **URL Inspection** for: the home page, `/services`, one service page, `/projects`,
one case study, `/blog`, one article. Check: "URL is on Google" after indexing, canonical
selected, and that `/ajadmin` reports **excluded by noindex** (expected — do not fix).

## 4. Request indexing (optional, for important new pages)

URL Inspection → **Request Indexing** for the home page and top service pages. It does not
guarantee instant indexing — it only queues a crawl.

## 5. Monitor (weekly at first)

- **Page indexing** report: look for soft-404s, redirects, or noindex surprises.
- **Core Web Vitals** (after enough traffic): LCP/INP/CLS status.
- **Manual actions** and **Security issues**: should stay empty.

## 6. Content rhythm (the part that actually moves rankings)

- Publish genuinely useful articles (the Insights section) on a steady cadence.
- Keep service pages current as capabilities grow.
- Never add fake reviews, invented numbers or doorway pages for brand aliases — the
  Organization `alternateName` entries already cover "Ankit Jangid System Technology" and
  "Ankit System Technology" searches.

**Expectations:** technical readiness is our job; crawl timing and rankings are Google's.
No developer can guarantee a ranking position.
