import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter_Tight } from "next/font/google";
import { buildRootMetadata } from "@/lib/seo/metadata";
import { RevealObserver } from "@/components/site/RevealObserver";
import { SceneMotion } from "@/components/motion/SceneMotion";
import { SurfaceMotion } from "@/components/motion/SurfaceMotion";
import "./globals.css";
import "./surface-system.css";
import "./accent-surfaces.css";
import "./action-surfaces.css";

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
 * Reveal effects start after hydration in RevealObserver. Core content stays
 * visible when JavaScript or the observer is unavailable.
 */
const themeBootScript = `(function(){
 try{if(localStorage.getItem("ajs-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}
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
      </body>
    </html>
  );
}
