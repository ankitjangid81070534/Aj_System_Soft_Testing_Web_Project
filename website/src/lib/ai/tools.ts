/**
 * The in-app AI tool catalogue — config only, no provider code.
 *
 * Adding a tool means adding ONE entry here: id, label, category, the fields
 * its form renders, the system instruction and the prompt template. The runner
 * (`lib/ai/run.ts`) and the UI (`components/ai/*`) are fully generic, and this
 * module is safe to import from client components (it holds no secrets and no
 * server-only imports).
 *
 * `{field}` placeholders in a template are replaced with the submitted value.
 */

import type { AiProvider } from "@/lib/ai/providers.shared";

export type ToolFieldKind = "text" | "long" | "select";

export type ToolField = {
  name: string;
  label: string;
  kind: ToolFieldKind;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  maxLength?: number;
};

export type AiToolCategory =
  | "Writing"
  | "Marketing"
  | "SEO"
  | "Business"
  | "Code"
  | "Data"
  | "Support"
  | "Career"
  | "Learning";

export type AiTool = {
  id: string;
  name: string;
  category: AiToolCategory;
  description: string;
  provider: AiProvider;
  model: string;
  system: string;
  template: string;
  fields: ToolField[];
  maxTokens?: number;
};

export const AI_TOOL_CATEGORIES: AiToolCategory[] = [
  "Writing",
  "Marketing",
  "SEO",
  "Business",
  "Code",
  "Data",
  "Support",
  "Career",
  "Learning",
];

/** Long-form / reasoning work goes to Claude, fast structured work to GPT, translation + multilingual to Gemini. */
const GPT = { provider: "openai" as AiProvider, model: "gpt-4o-mini" };
const CLAUDE = { provider: "anthropic" as AiProvider, model: "claude-3-5-haiku-latest" };
const GEMINI = { provider: "google" as AiProvider, model: "gemini-2.0-flash" };

const TEXT = (name: string, label: string, placeholder?: string): ToolField => ({
  name,
  label,
  kind: "text",
  placeholder,
  required: true,
  maxLength: 400,
});

const LONG = (name: string, label: string, placeholder?: string): ToolField => ({
  name,
  label,
  kind: "long",
  placeholder,
  required: true,
  maxLength: 12000,
});

const OPTIONAL_TEXT = (name: string, label: string, placeholder?: string): ToolField => ({
  name,
  label,
  kind: "text",
  placeholder,
  required: false,
  maxLength: 400,
});

const SELECT = (name: string, label: string, options: string[]): ToolField => ({
  name,
  label,
  kind: "select",
  options,
  required: true,
});

const TONE = SELECT("tone", "Tone", [
  "Professional",
  "Friendly",
  "Persuasive",
  "Formal",
  "Casual",
  "Confident",
]);

const LANGUAGE = SELECT("language", "Output language", [
  "English",
  "Hindi",
  "Hinglish",
  "Marathi",
  "Gujarati",
  "Tamil",
  "Telugu",
  "Bengali",
  "Arabic",
  "Spanish",
  "French",
  "German",
]);

const BASE_SYSTEM =
  "You are a precise business assistant inside a software company's client portal. Return only the requested deliverable in clean Markdown — no preamble, no apologies, no mention of being an AI. Never invent facts, statistics, prices, client names or testimonials: if a detail is missing, leave a clearly marked [placeholder] instead.";

export const AI_TOOLS: AiTool[] = [
  // ---------------------------------------------------------------- Writing
  {
    id: "blog-post-writer",
    name: "Blog post writer",
    category: "Writing",
    description: "Turn a topic into a structured, publish-ready article draft.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a {length} blog article in {language} about: {topic}.\nAudience: {audience}.\nTone: {tone}.\nUse an H1, scannable H2 sections, short paragraphs and a closing summary.",
    fields: [
      TEXT("topic", "Topic", "How ERP software reduces billing errors"),
      OPTIONAL_TEXT("audience", "Audience", "Small business owners"),
      SELECT("length", "Length", ["short (400 words)", "medium (800 words)", "long (1400 words)"]),
      TONE,
      LANGUAGE,
    ],
    maxTokens: 2600,
  },
  {
    id: "article-rewriter",
    name: "Article rewriter",
    category: "Writing",
    description: "Rewrite existing text for clarity while keeping every fact.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Rewrite the text below in {language} with a {tone} tone. Keep every fact and number exactly as given, improve clarity and flow, and do not add new claims.\n\n---\n{content}",
    fields: [LONG("content", "Text to rewrite"), TONE, LANGUAGE],
    maxTokens: 2600,
  },
  {
    id: "summarizer",
    name: "Text summariser",
    category: "Writing",
    description: "Condense long documents into key points.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Summarise the text below in {language} as {style}. Preserve all numbers and names.\n\n---\n{content}",
    fields: [
      LONG("content", "Text to summarise"),
      SELECT("style", "Summary style", [
        "5 bullet points",
        "one short paragraph",
        "an executive summary with headings",
        "a one-line TL;DR",
      ]),
      LANGUAGE,
    ],
  },
  {
    id: "grammar-fixer",
    name: "Grammar & spelling fixer",
    category: "Writing",
    description: "Correct grammar and punctuation without changing meaning.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Correct all grammar, spelling and punctuation in the text below. Keep the original voice and meaning. Return the corrected text, then a short bullet list of the main corrections.\n\n---\n{content}",
    fields: [LONG("content", "Text")],
  },
  {
    id: "tone-changer",
    name: "Tone changer",
    category: "Writing",
    description: "Rewrite any message in a different tone.",
    ...GPT,
    system: BASE_SYSTEM,
    template: "Rewrite the message below in a {tone} tone, in {language}.\n\n---\n{content}",
    fields: [LONG("content", "Message"), TONE, LANGUAGE],
  },
  {
    id: "paragraph-expander",
    name: "Paragraph expander",
    category: "Writing",
    description: "Develop short notes into full paragraphs.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Expand these notes into {count} well-written paragraphs in {language}, without inventing facts.\n\n---\n{content}",
    fields: [
      LONG("content", "Notes"),
      SELECT("count", "Paragraphs", ["1", "2", "3", "4"]),
      LANGUAGE,
    ],
  },
  {
    id: "outline-builder",
    name: "Content outline builder",
    category: "Writing",
    description: "Generate a heading-by-heading outline before you write.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Create a detailed content outline in {language} for: {topic}. Include H2/H3 headings, one line of guidance per section, and suggested word counts.",
    fields: [TEXT("topic", "Topic"), LANGUAGE],
  },
  {
    id: "press-release",
    name: "Press release writer",
    category: "Writing",
    description: "Draft a standard-format press release.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a press release in {language} announcing: {announcement}. Company: {company}. Use headline, dateline, lead paragraph, two body paragraphs, a [quote placeholder] and a boilerplate section. Mark any missing detail as [placeholder].",
    fields: [
      TEXT("announcement", "Announcement"),
      TEXT("company", "Company name"),
      LANGUAGE,
    ],
  },
  {
    id: "story-writer",
    name: "Case story writer",
    category: "Writing",
    description: "Shape project notes into a problem → solution → result story.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Turn the project notes below into a case story in {language} with the sections Challenge, Approach, Solution and Outcome. Use ONLY the facts given; mark anything missing as [placeholder].\n\n---\n{content}",
    fields: [LONG("content", "Project notes"), LANGUAGE],
  },
  {
    id: "meeting-notes",
    name: "Meeting notes organiser",
    category: "Writing",
    description: "Turn raw meeting notes into minutes with action items.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Organise the raw meeting notes below into minutes in {language}: Summary, Decisions, Action items (owner + due date where stated), Open questions.\n\n---\n{content}",
    fields: [LONG("content", "Raw notes"), LANGUAGE],
  },

  // -------------------------------------------------------------- Marketing
  {
    id: "ad-copy",
    name: "Ad copy generator",
    category: "Marketing",
    description: "Write platform-ready ad variations for one offer.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write 5 {platform} ad variations in {language} for: {offer}. Audience: {audience}. Tone: {tone}. Respect the platform's character limits and include one call to action each.",
    fields: [
      TEXT("offer", "Product or offer"),
      OPTIONAL_TEXT("audience", "Audience"),
      SELECT("platform", "Platform", [
        "Google Search",
        "Facebook",
        "Instagram",
        "LinkedIn",
        "YouTube",
      ]),
      TONE,
      LANGUAGE,
    ],
  },
  {
    id: "social-captions",
    name: "Social caption writer",
    category: "Marketing",
    description: "Captions plus hashtags for any post idea.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write 5 {platform} captions in {language} for this post idea: {idea}. Tone: {tone}. Add 5 relevant hashtags per caption.",
    fields: [
      TEXT("idea", "Post idea"),
      SELECT("platform", "Platform", ["Instagram", "LinkedIn", "X", "Facebook", "WhatsApp status"]),
      TONE,
      LANGUAGE,
    ],
  },
  {
    id: "email-campaign",
    name: "Marketing email writer",
    category: "Marketing",
    description: "Subject lines plus body copy for a campaign email.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a marketing email in {language} for: {goal}. Audience: {audience}. Tone: {tone}. Give 3 subject line options, preview text, body copy and one clear CTA.",
    fields: [
      TEXT("goal", "Campaign goal"),
      OPTIONAL_TEXT("audience", "Audience"),
      TONE,
      LANGUAGE,
    ],
  },
  {
    id: "cold-outreach",
    name: "Cold outreach writer",
    category: "Marketing",
    description: "Short, specific first-touch messages.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a {channel} cold outreach message in {language} from {sender} to {recipient}. Offer: {offer}. Keep it under 120 words, specific and non-salesy, ending with a low-friction ask.",
    fields: [
      TEXT("recipient", "Who you are contacting"),
      TEXT("sender", "Who you are"),
      TEXT("offer", "What you offer"),
      SELECT("channel", "Channel", ["Email", "LinkedIn", "WhatsApp"]),
      LANGUAGE,
    ],
  },
  {
    id: "landing-copy",
    name: "Landing page copywriter",
    category: "Marketing",
    description: "Full section-by-section landing page copy.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write landing page copy in {language} for: {product}. Audience: {audience}. Tone: {tone}. Sections: hero headline + subhead, 3 benefits, how it works (3 steps), objection handling, FAQ (4 questions), final CTA. Do not invent statistics or client names.",
    fields: [TEXT("product", "Product or service"), OPTIONAL_TEXT("audience", "Audience"), TONE, LANGUAGE],
    maxTokens: 2600,
  },
  {
    id: "product-description",
    name: "Product description writer",
    category: "Marketing",
    description: "Sales-ready descriptions from plain specs.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a {length} product description in {language} from these specs. Include a benefit-led opening and a bullet list of features.\n\n---\n{content}",
    fields: [
      LONG("content", "Specs / features"),
      SELECT("length", "Length", ["short", "medium", "detailed"]),
      LANGUAGE,
    ],
  },
  {
    id: "video-script",
    name: "Video script writer",
    category: "Marketing",
    description: "Hook-to-CTA scripts for short video.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a {duration} video script in {language} about: {topic}. Format as a table of timestamp, on-screen visual and voiceover. Open with a 3-second hook and close with a CTA.",
    fields: [
      TEXT("topic", "Topic"),
      SELECT("duration", "Duration", ["30 second", "60 second", "3 minute"]),
      LANGUAGE,
    ],
  },
  {
    id: "brand-names",
    name: "Brand name generator",
    category: "Marketing",
    description: "Name ideas with rationale and domain suggestions.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Suggest 20 brand names for: {business}. Style: {style}. For each give a one-line rationale and a suggested .com/.in domain. Do not claim any domain is available.",
    fields: [
      TEXT("business", "What the business does"),
      SELECT("style", "Naming style", ["Modern", "Traditional", "Invented word", "Descriptive", "Short & punchy"]),
    ],
  },
  {
    id: "tagline-generator",
    name: "Tagline generator",
    category: "Marketing",
    description: "Short brand lines that actually say something.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write 15 taglines in {language} for {brand}, which does: {offer}. Keep each under 8 words. Tone: {tone}.",
    fields: [TEXT("brand", "Brand"), TEXT("offer", "What it does"), TONE, LANGUAGE],
  },
  {
    id: "whatsapp-broadcast",
    name: "WhatsApp broadcast writer",
    category: "Marketing",
    description: "Short broadcast messages that don't look like spam.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write 3 WhatsApp broadcast messages in {language} about: {announcement}. Under 60 words each, one emoji maximum, with a clear next step. Tone: {tone}.",
    fields: [TEXT("announcement", "What you're announcing"), TONE, LANGUAGE],
  },

  // -------------------------------------------------------------------- SEO
  {
    id: "meta-tags",
    name: "Meta title & description",
    category: "SEO",
    description: "Search snippets inside Google's length limits.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write 5 meta title (max 60 characters) and meta description (max 155 characters) pairs in {language} for a page about: {topic}. Primary keyword: {keyword}. Show the character count after each line.",
    fields: [TEXT("topic", "Page topic"), OPTIONAL_TEXT("keyword", "Primary keyword"), LANGUAGE],
  },
  {
    id: "keyword-ideas",
    name: "Keyword idea generator",
    category: "SEO",
    description: "Grouped keyword ideas with search intent.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Generate keyword ideas in {language} for: {seed}. Group them by search intent (informational, commercial, transactional, local) and mark long-tail variants. Do not invent search volumes.",
    fields: [TEXT("seed", "Seed keyword or topic"), LANGUAGE],
  },
  {
    id: "content-brief",
    name: "SEO content brief",
    category: "SEO",
    description: "A writer-ready brief for one target keyword.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Create an SEO content brief in {language} for the keyword: {keyword}. Include search intent, suggested title, H2/H3 structure, entities to cover, internal-link ideas, FAQ questions and a word-count target.",
    fields: [TEXT("keyword", "Target keyword"), LANGUAGE],
  },
  {
    id: "faq-schema",
    name: "FAQ generator",
    category: "SEO",
    description: "Question-and-answer blocks for a page.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write {count} frequently asked questions with concise answers in {language} about: {topic}. Answer in 2–3 sentences each and avoid invented specifics.",
    fields: [
      TEXT("topic", "Topic"),
      SELECT("count", "How many", ["5", "8", "12"]),
      LANGUAGE,
    ],
  },
  {
    id: "alt-text",
    name: "Image alt text writer",
    category: "SEO",
    description: "Accessible, descriptive alt text.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write alt text (under 125 characters) in {language} for an image described as: {description}. Page context: {context}. Return 3 options.",
    fields: [TEXT("description", "What the image shows"), OPTIONAL_TEXT("context", "Page context"), LANGUAGE],
  },
  {
    id: "blog-titles",
    name: "Headline & title tester",
    category: "SEO",
    description: "Multiple headline angles for one topic.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write 15 headline options in {language} for an article about: {topic}. Mix how-to, listicle, question and outcome angles. Mark the 3 strongest and say why in one line each.",
    fields: [TEXT("topic", "Article topic"), LANGUAGE],
  },
  {
    id: "local-seo",
    name: "Local business SEO helper",
    category: "SEO",
    description: "Local listing copy and service-area keywords.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "For a {business} serving {location}, write a Google Business Profile description (max 750 characters), 10 local keywords and 5 service-area page title ideas in {language}.",
    fields: [TEXT("business", "Business type"), TEXT("location", "City / area"), LANGUAGE],
  },
  {
    id: "internal-links",
    name: "Internal link planner",
    category: "SEO",
    description: "Suggest links between your existing pages.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Given this list of existing pages, suggest internal links for the new page '{page}': which pages should link to it, with natural anchor text, and which pages it should link out to. Use only the listed pages.\n\n---\n{content}",
    fields: [TEXT("page", "New page topic"), LONG("content", "Existing pages (one per line)")],
  },

  // --------------------------------------------------------------- Business
  {
    id: "proposal-writer",
    name: "Project proposal writer",
    category: "Business",
    description: "A structured proposal from requirement notes.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a client proposal in {language} from the requirement notes below. Sections: Understanding, Scope, Deliverables, Timeline, Assumptions, Exclusions, Next steps. Leave [placeholder] for any price, date or figure not stated in the notes — never invent commercial terms.\n\n---\n{content}",
    fields: [LONG("content", "Requirement notes"), LANGUAGE],
    maxTokens: 2600,
  },
  {
    id: "quotation-helper",
    name: "Scope & estimate breakdown",
    category: "Business",
    description: "Break a project into estimable work items.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Break the project below into a work breakdown in {language}: phases, tasks per phase, effort in working days per task, dependencies and risks. Do not state prices.\n\n---\n{content}",
    fields: [LONG("content", "Project description"), LANGUAGE],
  },
  {
    id: "invoice-note",
    name: "Invoice & payment reminder",
    category: "Business",
    description: "Polite, firm payment follow-ups.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a {stage} payment reminder in {language} to {client} regarding invoice {invoice}. Tone: {tone}. Keep it under 130 words and mark any amount or date not given as [placeholder].",
    fields: [
      TEXT("client", "Client name"),
      OPTIONAL_TEXT("invoice", "Invoice reference"),
      SELECT("stage", "Stage", ["first", "second", "final before escalation"]),
      TONE,
      LANGUAGE,
    ],
  },
  {
    id: "sop-writer",
    name: "SOP / process writer",
    category: "Business",
    description: "Turn a process into a numbered SOP.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a standard operating procedure in {language} for: {process}. Include purpose, scope, roles, numbered steps, quality checks and escalation.",
    fields: [TEXT("process", "Process"), LANGUAGE],
  },
  {
    id: "job-description",
    name: "Job description writer",
    category: "Business",
    description: "Role descriptions that attract the right people.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a job description in {language} for {role} ({level}). Include summary, responsibilities, must-have skills, nice-to-have skills and how to apply. Mark salary as [placeholder].",
    fields: [
      TEXT("role", "Role title"),
      SELECT("level", "Level", ["Intern", "Junior", "Mid-level", "Senior", "Lead"]),
      LANGUAGE,
    ],
  },
  {
    id: "swot-analysis",
    name: "SWOT analysis builder",
    category: "Business",
    description: "A structured SWOT from your own description.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Produce a SWOT analysis in {language} for the business described below, then 3 recommended actions. Base every point on the description only.\n\n---\n{content}",
    fields: [LONG("content", "Business description"), LANGUAGE],
  },
  {
    id: "business-plan",
    name: "Business plan outline",
    category: "Business",
    description: "A plan skeleton you can fill with real numbers.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Draft a business plan outline in {language} for: {idea}. Sections: problem, solution, market, competition, model, go-to-market, operations, team, risks, financial-assumption checklist. Leave every figure as [placeholder].",
    fields: [TEXT("idea", "Business idea"), LANGUAGE],
    maxTokens: 2600,
  },
  {
    id: "pricing-page",
    name: "Pricing page copy",
    category: "Business",
    description: "Plan names, inclusions and objection handling.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write pricing page copy in {language} for {product} with {plans} plans. For each plan: name, who it's for, inclusion bullets and CTA. Leave prices as [placeholder]. Add a 4-question pricing FAQ.",
    fields: [
      TEXT("product", "Product or service"),
      SELECT("plans", "How many plans", ["2", "3", "4"]),
      LANGUAGE,
    ],
  },
  {
    id: "risk-register",
    name: "Project risk register",
    category: "Business",
    description: "Risks, impact, likelihood and mitigation.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Build a risk register table in {language} for the project below: risk, category, likelihood, impact, mitigation, owner placeholder.\n\n---\n{content}",
    fields: [LONG("content", "Project description"), LANGUAGE],
  },
  {
    id: "policy-draft",
    name: "Internal policy drafter",
    category: "Business",
    description: "A first draft of an internal policy document.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Draft an internal {policy} policy in {language} for a {size} software company. Include purpose, scope, rules, responsibilities and review cycle. Add a note that legal review is required before adoption.",
    fields: [
      TEXT("policy", "Policy subject", "Remote work"),
      SELECT("size", "Company size", ["small (under 20)", "mid-size", "large"]),
      LANGUAGE,
    ],
  },

  // ------------------------------------------------------------------- Code
  {
    id: "code-explainer",
    name: "Code explainer",
    category: "Code",
    description: "Plain-language walkthrough of any snippet.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Explain the code below in {language}, line by line where it matters, then summarise what it does, its inputs/outputs and any edge cases.\n\n---\n{content}",
    fields: [LONG("content", "Code"), LANGUAGE],
  },
  {
    id: "code-reviewer",
    name: "Code reviewer",
    category: "Code",
    description: "Bugs, risks and improvements for a snippet.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Review the code below. List: correctness bugs, security issues, performance concerns, readability suggestions — each with the specific line and a concrete fix. Be strict and concise.\n\n---\n{content}",
    fields: [LONG("content", "Code")],
    maxTokens: 2200,
  },
  {
    id: "regex-builder",
    name: "Regex builder",
    category: "Code",
    description: "A tested regex with an explanation.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a regular expression for: {requirement}. Flavour: {flavour}. Give the pattern, a breakdown of each part, 3 matching and 3 non-matching examples.",
    fields: [
      TEXT("requirement", "What it must match"),
      SELECT("flavour", "Flavour", ["JavaScript", "Python", "PCRE", "POSIX"]),
    ],
  },
  {
    id: "sql-query-writer",
    name: "SQL query writer",
    category: "Code",
    description: "Turn a question plus schema into SQL.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a {dialect} query answering: {question}\n\nSchema:\n{schema}\n\nReturn the query, then a short explanation. Never use destructive statements.",
    fields: [
      TEXT("question", "What you want to know"),
      LONG("schema", "Table schema"),
      SELECT("dialect", "Dialect", ["PostgreSQL", "MySQL", "SQLite", "SQL Server"]),
    ],
  },
  {
    id: "unit-test-writer",
    name: "Unit test writer",
    category: "Code",
    description: "Test cases including edge cases.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write {framework} unit tests for the code below, covering happy path, edge cases and error handling. Return only runnable test code with brief comments.\n\n---\n{content}",
    fields: [
      LONG("content", "Code under test"),
      SELECT("framework", "Framework", ["Vitest", "Jest", "Pytest", "JUnit", "PHPUnit"]),
    ],
  },
  {
    id: "error-debugger",
    name: "Error message debugger",
    category: "Code",
    description: "Likely causes and fixes for a stack trace.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Diagnose this error. Give the most likely causes ranked, how to confirm each, and the fix.\n\nContext: {context}\n\n---\n{content}",
    fields: [LONG("content", "Error / stack trace"), OPTIONAL_TEXT("context", "Stack / framework")],
  },
  {
    id: "code-converter",
    name: "Code language converter",
    category: "Code",
    description: "Port a snippet to another language.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Convert the code below from {from} to {to}. Keep behaviour identical, use idiomatic {to}, and note anything that cannot be translated directly.\n\n---\n{content}",
    fields: [
      LONG("content", "Code"),
      TEXT("from", "From language", "PHP"),
      TEXT("to", "To language", "TypeScript"),
    ],
  },
  {
    id: "api-doc-writer",
    name: "API documentation writer",
    category: "Code",
    description: "Endpoint docs from route code or notes.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write API documentation in {language} for the endpoint(s) below: method, path, auth, request schema, response schema, status codes, and a curl example.\n\n---\n{content}",
    fields: [LONG("content", "Route code or notes"), LANGUAGE],
  },
  {
    id: "cron-explainer",
    name: "Cron & command explainer",
    category: "Code",
    description: "Decode a cron expression or shell command.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Explain exactly what this cron expression or shell command does, when it runs, and any risk in running it.\n\n---\n{content}",
    fields: [LONG("content", "Cron expression or command")],
  },
  {
    id: "commit-message",
    name: "Commit message writer",
    category: "Code",
    description: "Conventional commit messages from a diff.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a conventional-commit message for the change below: a subject line under 72 characters plus a short body explaining why. Then suggest a PR title and description.\n\n---\n{content}",
    fields: [LONG("content", "Diff or change summary")],
  },

  // ------------------------------------------------------------------- Data
  {
    id: "data-cleaner",
    name: "Messy data formatter",
    category: "Data",
    description: "Normalise pasted rows into clean CSV.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Convert the messy data below into clean CSV with a header row. Normalise casing, trim whitespace, standardise dates to YYYY-MM-DD and phone numbers to E.164 where possible. Never invent missing values — leave them empty and list every ambiguity after the CSV.\n\n---\n{content}",
    fields: [LONG("content", "Pasted data")],
  },
  {
    id: "data-insights",
    name: "Data insight reader",
    category: "Data",
    description: "Plain-language findings from a table.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Analyse the table below and report in {language}: what it shows, 5 notable findings with the numbers that support them, and 3 questions the data cannot answer. Do not extrapolate.\n\n---\n{content}",
    fields: [LONG("content", "CSV or table"), LANGUAGE],
  },
  {
    id: "excel-formula",
    name: "Excel / Sheets formula builder",
    category: "Data",
    description: "The formula plus how it works.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a {target} formula for: {requirement}. Columns: {columns}. Give the formula, an explanation of each part, and a common mistake to avoid.",
    fields: [
      TEXT("requirement", "What it should calculate"),
      OPTIONAL_TEXT("columns", "Columns / ranges", "A: date, B: amount"),
      SELECT("target", "Target", ["Excel", "Google Sheets"]),
    ],
  },
  {
    id: "json-helper",
    name: "JSON structure helper",
    category: "Data",
    description: "Fix, format or convert structured data.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "{action} the structured data below. Return the result in a code block, then list any problem you found.\n\n---\n{content}",
    fields: [
      LONG("content", "JSON / CSV / XML"),
      SELECT("action", "Action", [
        "Format and validate",
        "Convert JSON to CSV",
        "Convert CSV to JSON",
        "Infer a JSON schema for",
        "Flatten",
      ]),
    ],
  },
  {
    id: "report-writer",
    name: "Report writer",
    category: "Data",
    description: "Numbers in, written report out.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a {period} business report in {language} from the figures below: summary, what changed, likely drivers (clearly marked as hypotheses) and recommended next steps. Use only the given figures.\n\n---\n{content}",
    fields: [
      LONG("content", "Figures / notes"),
      SELECT("period", "Period", ["weekly", "monthly", "quarterly"]),
      LANGUAGE,
    ],
  },

  // ---------------------------------------------------------------- Support
  {
    id: "reply-writer",
    name: "Customer reply writer",
    category: "Support",
    description: "Answer a customer message properly, fast.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a reply in {language} to the customer message below. Tone: {tone}. Acknowledge the issue, answer clearly, state the next step and owner. Never promise a date or refund that is not in the message.\n\n---\n{content}",
    fields: [LONG("content", "Customer message"), TONE, LANGUAGE],
  },
  {
    id: "complaint-handler",
    name: "Complaint response writer",
    category: "Support",
    description: "De-escalating replies for unhappy customers.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a de-escalating response in {language} to this complaint: acknowledge specifically, take responsibility where warranted, give the correction plan and the follow-up commitment. Do not offer compensation unless stated.\n\n---\n{content}",
    fields: [LONG("content", "Complaint"), LANGUAGE],
  },
  {
    id: "review-response",
    name: "Review response writer",
    category: "Support",
    description: "Public replies to reviews of any rating.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a public response in {language} to this {rating}-star review. Keep it under 90 words, specific, and free of defensiveness.\n\n---\n{content}",
    fields: [
      LONG("content", "Review text"),
      SELECT("rating", "Rating", ["1", "2", "3", "4", "5"]),
      LANGUAGE,
    ],
  },
  {
    id: "help-article",
    name: "Help article writer",
    category: "Support",
    description: "Step-by-step help documentation.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a help centre article in {language} explaining how to: {task}. Include who it's for, prerequisites, numbered steps, a troubleshooting section and related questions.",
    fields: [TEXT("task", "Task to explain"), LANGUAGE],
  },
  {
    id: "chatbot-scripts",
    name: "Support macro builder",
    category: "Support",
    description: "Reusable canned replies for common questions.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write {count} reusable support macros in {language} for a {business}. For each: trigger question, reply text with [placeholders], and when not to use it.",
    fields: [
      TEXT("business", "Business type"),
      SELECT("count", "How many", ["5", "10", "15"]),
      LANGUAGE,
    ],
  },

  // ----------------------------------------------------------------- Career
  {
    id: "resume-writer",
    name: "Résumé bullet writer",
    category: "Career",
    description: "Achievement-focused résumé bullets.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Rewrite the experience below as achievement-focused résumé bullets in {language}, starting with strong verbs. Keep only the facts given; mark missing metrics as [metric].\n\n---\n{content}",
    fields: [LONG("content", "Your experience notes"), LANGUAGE],
  },
  {
    id: "cover-letter",
    name: "Cover letter writer",
    category: "Career",
    description: "A tailored letter for one specific role.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a cover letter in {language} for the role of {role} at {company}. Candidate background:\n{content}\n\nKeep it under 300 words, specific, and free of invented achievements.",
    fields: [
      TEXT("role", "Role"),
      TEXT("company", "Company"),
      LONG("content", "Your background"),
      LANGUAGE,
    ],
  },
  {
    id: "interview-questions",
    name: "Interview question set",
    category: "Career",
    description: "Role-specific questions with what to look for.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Create an interview question set in {language} for {role} ({level}): 5 technical, 5 behavioural, 3 scenario questions. For each, note what a strong answer contains.",
    fields: [
      TEXT("role", "Role"),
      SELECT("level", "Level", ["Intern", "Junior", "Mid-level", "Senior", "Lead"]),
      LANGUAGE,
    ],
  },
  {
    id: "linkedin-profile",
    name: "LinkedIn profile writer",
    category: "Career",
    description: "Headline and About section that read like you.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Write a LinkedIn headline (max 200 characters) and About section (max 250 words) in {language} from the background below. Tone: {tone}.\n\n---\n{content}",
    fields: [LONG("content", "Your background"), TONE, LANGUAGE],
  },
  {
    id: "performance-review",
    name: "Performance review writer",
    category: "Career",
    description: "Balanced, specific review text.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Write a {kind} performance review in {language} from the notes below: strengths with examples, development areas with concrete suggestions, and goals for the next cycle. Stay factual.\n\n---\n{content}",
    fields: [
      LONG("content", "Notes about the person"),
      SELECT("kind", "Type", ["self", "manager", "peer"]),
      LANGUAGE,
    ],
  },

  // --------------------------------------------------------------- Learning
  {
    id: "translator",
    name: "Translator",
    category: "Learning",
    description: "Natural translation, not word-for-word.",
    ...GEMINI,
    system: BASE_SYSTEM,
    template:
      "Translate the text below into {language}. Keep the meaning, tone and formatting. Return only the translation, then note any phrase that has no direct equivalent.\n\n---\n{content}",
    fields: [LONG("content", "Text to translate"), LANGUAGE],
  },
  {
    id: "explain-simply",
    name: "Explain it simply",
    category: "Learning",
    description: "Any concept, at the level you choose.",
    ...GEMINI,
    system: BASE_SYSTEM,
    template:
      "Explain {topic} in {language} at a {level} level. Use one everyday analogy, then a short list of the key points, then one common misconception.",
    fields: [
      TEXT("topic", "Concept"),
      SELECT("level", "Level", ["child", "beginner", "intermediate", "expert"]),
      LANGUAGE,
    ],
  },
  {
    id: "study-plan",
    name: "Study plan builder",
    category: "Learning",
    description: "A realistic week-by-week learning plan.",
    ...CLAUDE,
    system: BASE_SYSTEM,
    template:
      "Build a {weeks}-week study plan in {language} to learn {subject} from a {start} starting point, at {hours} hours per week. Give weekly goals, practice tasks and a checkpoint per week.",
    fields: [
      TEXT("subject", "Subject"),
      SELECT("start", "Starting point", ["absolute beginner", "some basics", "intermediate"]),
      SELECT("weeks", "Weeks", ["4", "8", "12"]),
      SELECT("hours", "Hours per week", ["3", "5", "10", "20"]),
      LANGUAGE,
    ],
  },
  {
    id: "quiz-maker",
    name: "Quiz maker",
    category: "Learning",
    description: "Questions with answers from any material.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Create a {count}-question {format} quiz in {language} from the material below, with an answer key and one-line explanations. Use only the material given.\n\n---\n{content}",
    fields: [
      LONG("content", "Source material"),
      SELECT("format", "Format", ["multiple choice", "true/false", "short answer", "mixed"]),
      SELECT("count", "Questions", ["5", "10", "20"]),
      LANGUAGE,
    ],
  },
  {
    id: "flashcards",
    name: "Flashcard generator",
    category: "Learning",
    description: "Question/answer pairs ready to revise.",
    ...GPT,
    system: BASE_SYSTEM,
    template:
      "Create {count} flashcards in {language} from the material below as a two-column table (front / back). Keep each side under 20 words.\n\n---\n{content}",
    fields: [
      LONG("content", "Source material"),
      SELECT("count", "How many", ["10", "20", "30"]),
      LANGUAGE,
    ],
  },
];

export const AI_TOOL_COUNT = AI_TOOLS.length;

const TOOL_INDEX = new Map(AI_TOOLS.map((tool) => [tool.id, tool]));

export function findTool(id: string): AiTool | undefined {
  return TOOL_INDEX.get(id);
}

/** Case-insensitive search across name, description and category. */
export function searchTools(query: string, category?: string): AiTool[] {
  const needle = query.trim().toLowerCase();
  return AI_TOOLS.filter((tool) => {
    if (category && category !== "All" && tool.category !== category) return false;
    if (!needle) return true;
    return (
      tool.name.toLowerCase().includes(needle) ||
      tool.description.toLowerCase().includes(needle) ||
      tool.category.toLowerCase().includes(needle)
    );
  });
}

/**
 * Fill `{field}` placeholders with submitted values. An empty optional field
 * becomes "not specified" so the prompt never contains a dangling placeholder.
 */
export function buildPrompt(tool: AiTool, values: Record<string, string>): string {
  return tool.template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = (values[key] ?? "").trim();
    return value || "not specified";
  });
}
