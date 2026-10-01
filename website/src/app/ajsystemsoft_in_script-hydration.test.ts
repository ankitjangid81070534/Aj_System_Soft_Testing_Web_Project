import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { transpileModule, ModuleKind } from "typescript";

const layout = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");
const adsense = readFileSync(new URL("../components/analytics/ajsystemsoft_in_AdSense.tsx", import.meta.url), "utf8");

describe("root script hydration safety", () => {
  it("keeps consent initialization in head before third-party scripts", () => {
    const head = layout.slice(layout.indexOf("<head>"), layout.indexOf("</head>"));
    expect(head).toContain('id="ajs-consent-boot"');
    expect(head).toContain("__html: consentBootScript");
    expect(head).not.toContain("adsbygoogle.js");
    expect(layout).toContain("<AdSense />");
    expect(layout).not.toContain('from "next/script"');
  });

  it("loads AdSense only after hydration, once, without unsupported attributes", () => {
    const effects: Array<() => void> = [];
    const scripts: Array<Record<string, unknown>> = [];
    const exports: { AdSense?: () => null } = {};
    runInNewContext(transpileModule(adsense, { compilerOptions: { module: ModuleKind.CommonJS } }).outputText, {
      exports,
      require: () => ({ useEffect: (effect: () => void) => effects.push(effect) }),
      document: {
        getElementById: (id: string) => scripts.find((script) => script.id === id),
        createElement: () => ({}),
        head: { appendChild: (script: Record<string, unknown>) => scripts.push(script) },
      },
    });
    expect(exports.AdSense?.()).toBeNull();
    expect(scripts).toHaveLength(0);
    expect(effects).toHaveLength(1);
    effects[0]();
    effects[0]();
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toEqual({
      id: "ajs-adsense",
      async: true,
      crossOrigin: "anonymous",
      src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5453930363427434",
    });
    expect(scripts[0]).not.toHaveProperty("data-nscript");
  });
});
