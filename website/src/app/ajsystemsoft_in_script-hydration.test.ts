import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layout = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");

describe("root script hydration safety", () => {
  it("keeps consent initialization in head before third-party scripts", () => {
    const head = layout.slice(layout.indexOf("<head>"), layout.indexOf("</head>"));
    expect(head).toContain('id="ajs-consent-boot"');
    expect(head).toContain("__html: consentBootScript");
    expect(head).not.toContain("adsbygoogle.js");
  });

  it("loads AdSense through Next Script after hydration without changing the publisher", () => {
    expect(layout).toContain('import Script from "next/script"');
    expect(layout).toMatch(/<Script\s+id="ajs-adsense"\s+strategy="afterInteractive"/);
    expect(layout).toContain("adsbygoogle.js?client=ca-pub-5453930363427434");
    expect(layout.match(/adsbygoogle\.js/g)).toHaveLength(1);
  });
});
