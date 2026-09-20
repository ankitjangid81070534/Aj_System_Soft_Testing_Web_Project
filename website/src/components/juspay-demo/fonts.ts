import { Manrope, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Typefaces for the Juspay-style presentation: a geometric grotesque for
 * headings and Manrope for body. Exposed as CSS variables consumed by
 * `juspay-demo.module.css`, so the look is scoped to whichever root carries
 * `juspayFontClassName`.
 */
const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-jd-heading",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-jd-body",
});

export const juspayFontClassName = `${heading.variable} ${body.variable}`;
