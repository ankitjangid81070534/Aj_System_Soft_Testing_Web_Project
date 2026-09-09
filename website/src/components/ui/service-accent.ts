/** Presentation only: stable semantic colors, independent of card order. */
export function serviceAccent(href: string) {
  const slug = href.split("/").filter(Boolean).at(-1) ?? "";
  if (/(^ai-|automation|machine-learning|desktop|windows)/.test(slug)) return "violet";
  if (/(security|maintenance|support|testing|ecommerce|android|ios|mobile)/.test(slug)) return "emerald";
  if (/(cloud|saas|api-|integration)/.test(slug)) return "cyan";
  if (/(design|ui-ux|marketing|communication|web-application)/.test(slug)) return "coral";
  if (/(consult|erp|crm|business|inventory|website)/.test(slug)) return "amber";
  return "blue";
}
