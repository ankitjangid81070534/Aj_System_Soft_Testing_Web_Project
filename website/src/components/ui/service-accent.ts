/** Presentation only: stable semantic colors, independent of card order. */
export function serviceAccent(href: string) {
  const slug = href.split("/").filter(Boolean).at(-1) ?? "";
  if (/(^ai-|automation|machine-learning)/.test(slug)) return "violet";
  if (/(security|maintenance|support|testing)/.test(slug)) return "emerald";
  if (/(cloud|saas|api-|integration)/.test(slug)) return "cyan";
  if (/(design|ui-ux|marketing|communication)/.test(slug)) return "coral";
  if (/(consult|erp|crm|business|inventory)/.test(slug)) return "amber";
  return "blue";
}
