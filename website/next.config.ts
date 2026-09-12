import type { NextConfig } from "next";

/**
 * Content-Security-Policy
 *
 * Required external origins (the ONLY services the site talks to):
 *   - https://*.supabase.co  → Supabase REST/Auth/Storage (connect) and CMS
 *                              media (img). wss://*.supabase.co is allowed for
 *                              Supabase Realtime if it is ever enabled.
 * Everything else is same-origin: Next.js chunks/styles, self-hosted Geist
 * font, and the admin-generated images.
 *
 * 'unsafe-inline' for scripts/styles is required by the Next.js App Router
 * bootstrap (no nonce pipeline is wired for the edge proxy yet). If a stricter
 * nonce-based CSP is wanted later, generate a nonce in proxy.ts and pass it
 * via the CSP header there instead of here.
 *
 * When adding a third party (e.g. analytics or a hosted payment frame), add
 * its origin to the matching directive AND document it in ../README.md.
 */
const supabaseOrigins = "https://*.supabase.co wss://*.supabase.co";
// Hero companion video (decorative, external CDN) — see components/site/HeroVideo.tsx
const heroVideoOrigin = "https://strvid.nyc3.cdn.digitaloceanspaces.com";

/**
 * Google AdSense origins — the complete set from Google's published CSP
 * guidance (https://support.google.com/adsense/answer/12345212). Missing any
 * of these makes ad requests, the site-verification ping or the Funding
 * Choices (consent) frame fail silently, which delays site approval.
 */
const adsenseScriptOrigins = [
  "https://pagead2.googlesyndication.com",
  "https://*.googlesyndication.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://*.gstatic.com",
  "https://*.googleadservices.com",
  "https://fundingchoicesmessages.google.com",
  "https://ep2.adtrafficquality.google",
  "https://*.adtrafficquality.google",
].join(" ");
const adsenseFrameOrigins = [
  "https://*.googlesyndication.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://fundingchoicesmessages.google.com",
  "https://ep2.adtrafficquality.google",
  "https://*.adtrafficquality.google",
].join(" ");
const adsenseImgOrigins = [
  "https://*.googlesyndication.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://*.gstatic.com",
  "https://*.googleusercontent.com",
  "https://*.adtrafficquality.google",
].join(" ");
const adsenseConnectOrigins = [
  "https://*.googlesyndication.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://*.gstatic.com",
  "https://fundingchoicesmessages.google.com",
  "https://ep1.adtrafficquality.google",
  "https://*.adtrafficquality.google",
].join(" ");
const isDevelopment = process.env.NODE_ENV !== "production";
// Only the sandbox's development server may be embedded in the preview.
// Production and ordinary local development retain clickjacking protection.
const isBase44Preview = isDevelopment && Boolean(process.env.BASE44_PUBLIC_HOST_SUFFIX);

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${adsenseScriptOrigins}${isDevelopment ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: ${supabaseOrigins.split(" ")[0]} ${adsenseImgOrigins}`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `media-src 'self' ${heroVideoOrigin}`,
  `connect-src 'self' ${supabaseOrigins} ${adsenseConnectOrigins}`,
  `frame-src ${adsenseFrameOrigins}`,
  // Funding Choices / consent messaging and ad iframes register a child
  // frame via 'child-src'; older engines fall back to it from frame-src.
  `child-src ${adsenseFrameOrigins}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isBase44Preview ? [] : ["frame-ancestors 'none'"]),
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isBase44Preview ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
  ...(isDevelopment
    ? []
    : [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ]),
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  // Allow the Base44 preview origin to access dev assets/HMR. The suffix
  // changes whenever the environment is recreated, so derive it from env.
  ...(process.env.BASE44_PUBLIC_HOST_SUFFIX
    ? { allowedDevOrigins: [`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`] }
    : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    // Serve the smallest supported format first.
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // The preview proxy forwards an internal host but keeps the browser's
    // public Origin. Trust only this sandbox's exact origin, in development.
    ...(isBase44Preview
      ? { serverActions: { allowedOrigins: [`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`] } }
      : {}),
    // Tree-shake icon imports (lucide) so only used icons ship.
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Belt and braces: private pages are noindexed by meta AND header.
        source: "/ajadmin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/account/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/auth/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/login",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/signup",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/forgot-password",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/reset-password",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/update-password",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // Machine-readable SEO endpoints can be cached for an hour.
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
    ];
  },
};

export default nextConfig;
