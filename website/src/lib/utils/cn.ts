/**
 * Join class names, skipping falsy values. Tiny dependency-free alternative
 * to clsx — sufficient for this design system's needs.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
