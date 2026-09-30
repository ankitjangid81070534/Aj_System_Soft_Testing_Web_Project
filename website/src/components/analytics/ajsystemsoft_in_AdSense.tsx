"use client";

import { useEffect } from "react";

/** Load after hydration without Next Script's unsupported data-nscript attribute. */
export function AdSense() {
  useEffect(() => {
    if (document.getElementById("ajs-adsense")) return;

    const script = document.createElement("script");
    script.id = "ajs-adsense";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5453930363427434";
    document.head.appendChild(script);
    // Keep the singleton across Strict Mode effects and client navigation.
  }, []);

  return null;
}
