import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter_Tight } from "next/font/google";
import { buildRootMetadata } from "@/lib/seo/metadata";
import { RevealObserver } from "@/components/site/RevealObserver";
import { SceneMotion } from "@/components/motion/SceneMotion";
import { SurfaceMotion } from "@/components/motion/SurfaceMotion";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";
import "./surface-system.css";
import "./accent-surfaces.css";
import "./action-surfaces.css";
import "./mobile-polish.css";
import "./catalogue-polish.css";
import "./inner-pages.css";
import "./page-transitions.css";

export const metadata: Metadata = buildRootMetadata();

/**
 * Site typeface: a tight geometric grotesque (Inter Tight). It is published under
 * the existing `--font-geist-sans` variable name, so every token, CSS module and
 * utility that already referenced it picks up the new family unchanged.
 */
const siteSans = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

/**
 * Runs before first paint. Theme: LIGHT is the default; dark is applied only
 * when the visitor chose it (persisted in localStorage) — the system color
 * scheme is never auto-applied.
 * Motion: FULL is the default on every device. Reduced motion is an explicit
 * in-site choice (`ajs-motion` = "reduce" → `data-motion="reduce"` on <html>),
 * not the OS flag — Windows reports `prefers-reduced-motion` whenever its
 * "Animation effects" toggle is off, which made the whole site look static on
 * many PCs. See `components/motion/motion-preference.ts`.
 * Reveal effects start after hydration in RevealObserver. Core content stays
 * visible when JavaScript or the observer is unavailable.
 */
const themeBootScript = `(function(){
 try{if(localStorage.getItem("ajs-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}
 try{if(localStorage.getItem("ajs-motion")==="reduce")document.documentElement.setAttribute("data-motion","reduce")}catch(e){}
 })();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={siteSans.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5453930363427434"
        />
      </head>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {children}
        <RevealObserver />
        <SceneMotion />
        <SurfaceMotion />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
