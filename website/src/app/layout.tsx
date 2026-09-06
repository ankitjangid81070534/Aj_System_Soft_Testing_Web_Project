import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { buildRootMetadata } from "@/lib/seo/metadata";
import { RevealObserver } from "@/components/site/RevealObserver";
import { SceneMotion } from "@/components/motion/SceneMotion";
import { SurfaceMotion } from "@/components/motion/SurfaceMotion";
import "./globals.css";
import "./surface-system.css";
import "./accent-surfaces.css";

export const metadata: Metadata = buildRootMetadata();

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
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
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
