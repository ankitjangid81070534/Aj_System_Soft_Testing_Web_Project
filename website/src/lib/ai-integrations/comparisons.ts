import type { FAQItem } from "@/lib/seo/jsonld";

export type Comparison = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  intro: string;
  columns: string[];
  rows: { label: string; values: string[] }[];
  sections: { heading: string; body: string }[];
  verdict: string;
  faqs: FAQItem[];
};

export const COMPARISONS: Comparison[] = [
  {
    slug: "cursor-vs-github-copilot-vs-claude-code",
    title: "Cursor vs GitHub Copilot vs Claude Code: Which AI Coding Tool Should Your Team Use?",
    description:
      "An honest comparison of Cursor, GitHub Copilot and Claude Code from a software team that uses them daily — features, strengths and best fit.",
    publishedAt: "2026-09-28",
    intro:
      "All three tools make developers faster, but they work very differently. Here is how they compare in real project work at AJS.",
    columns: ["Cursor", "GitHub Copilot", "Claude Code"],
    rows: [
      { label: "Type", values: ["AI-first code editor (VS Code based)", "Plugin for VS Code, JetBrains, etc.", "Agent in the terminal"] },
      { label: "Best at", values: ["Multi-file edits & refactors", "Inline completions while typing", "Large tasks across a codebase"] },
      { label: "Learning curve", values: ["Low for VS Code users", "Very low", "Medium (command-line)"] },
      { label: "Works with your IDE", values: ["Replaces your editor", "Yes, most IDEs", "Any editor + terminal"] },
      { label: "Team fit", values: ["Product teams iterating fast", "Enterprises on GitHub", "Senior devs delegating tasks"] },
    ],
    sections: [
      { heading: "Cursor", body: "Cursor feels like VS Code with AI built into every action. Its chat understands your whole project and can edit several files at once, which makes refactors and new features quick. You still need to review changes carefully, as with any AI tool." },
      { heading: "GitHub Copilot", body: "Copilot is the easiest to adopt: install the extension and get suggestions as you type. It fits teams already on GitHub and adds chat and pull-request help. It is less aggressive at large multi-file changes than Cursor or Claude Code." },
      { heading: "Claude Code", body: "Claude Code runs in your terminal and can plan and carry out larger tasks — reading files, running tests and making commits. It suits experienced developers who want to delegate well-defined work and review the result." },
    ],
    verdict:
      "For most product teams: Copilot for everyday completions, Cursor for fast feature work, and Claude Code for larger delegated tasks. Many teams — including ours — use more than one. Whatever you pick, keep code review and tests mandatory.",
    faqs: [
      { question: "Is Cursor better than GitHub Copilot?", answer: "Cursor is stronger for multi-file edits and project-aware chat; Copilot is simpler and works inside your existing IDE. The better choice depends on how your team works." },
      { question: "Can AI coding tools replace developers?", answer: "No. They speed up experienced developers, but architecture, security, review and understanding the business still need skilled engineers." },
      { question: "Is my code safe with these tools?", answer: "Each offers business plans with data-privacy controls. Check the vendor's current policy and use business/enterprise plans for client code." },
    ],
  },
  {
    slug: "n8n-vs-zapier-vs-make",
    title: "n8n vs Zapier vs Make: Best Workflow Automation Tool for Businesses",
    description:
      "Compare n8n, Zapier and Make.com on ease of use, cost at scale, self-hosting, AI features and best use cases — practical guidance from an automation team.",
    publishedAt: "2026-09-28",
    intro:
      "Zapier, Make and n8n all connect your apps without heavy coding. The right choice depends on volume, budget, complexity and data privacy.",
    columns: ["n8n", "Zapier", "Make.com"],
    rows: [
      { label: "Hosting", values: ["Cloud or self-hosted", "Cloud only", "Cloud only"] },
      { label: "Ease of use", values: ["Medium (developer-friendly)", "Easiest", "Easy, visual"] },
      { label: "Complex logic", values: ["Excellent, supports code", "Basic to moderate", "Very good"] },
      { label: "Cost at high volume", values: ["Lowest when self-hosted", "Highest", "Moderate"] },
      { label: "App integrations", values: ["Hundreds + any API", "Thousands", "Thousands"] },
      { label: "AI / agents", values: ["Built-in AI agent nodes", "Zapier AI & Agents", "AI modules"] },
    ],
    sections: [
      { heading: "n8n", body: "n8n is source-available and can run on your own server, so your data stays with you and costs stay predictable at high volume. It supports custom code and AI agent workflows, making it a favourite for technical teams." },
      { heading: "Zapier", body: "Zapier has the largest app library and the easiest setup. It is ideal for simple triggers and actions, but costs grow quickly as task volume and multi-step flows increase." },
      { heading: "Make.com", body: "Make offers a visual canvas for branching, loops and data transformation at a lower cost than Zapier. It is a strong middle ground for operations teams." },
    ],
    verdict:
      "Choose Zapier for quick simple automations, Make for complex visual workflows on a budget, and n8n when you need self-hosting, data control or heavy volume. We build and maintain all three.",
    faqs: [
      { question: "Is n8n free?", answer: "The self-hosted community edition is free to use; you pay for your server. n8n Cloud is a paid hosted plan." },
      { question: "Can I move from Zapier to n8n?", answer: "Yes. We map your existing Zaps and rebuild them in n8n or Make, then run both in parallel until the new flows are verified." },
      { question: "Which is best for AI automation?", answer: "n8n offers the most flexibility for AI agents and custom logic; Zapier and Make are simpler for adding AI steps to standard flows." },
    ],
  },
];

export function getComparison(slug: string) {
  return COMPARISONS.find((c) => c.slug === slug);
}
