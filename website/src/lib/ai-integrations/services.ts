import type { FAQItem } from "@/lib/seo/jsonld";

export type AiIntegrationService = {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  tools: string[];
  useCases: { title: string; text: string }[];
  process: string[];
  faqs: FAQItem[];
};

export const AI_INTEGRATION_SERVICES: AiIntegrationService[] = [
  {
    slug: "chatgpt-openai-integration",
    name: "ChatGPT / OpenAI Integration",
    title: "ChatGPT & OpenAI API Integration Services in India",
    description:
      "Add ChatGPT and OpenAI GPT models to your website, CRM, ERP or mobile app — secure API integration, custom assistants and automation by AJS.",
    intro:
      "We connect OpenAI's GPT models to your existing software so your team and customers get instant answers, drafts and summaries — using your own data, with your security rules.",
    tools: ["OpenAI API", "GPT models", "Assistants & function calling", "Embeddings / RAG"],
    useCases: [
      { title: "Customer support assistant", text: "Answers questions from your FAQs, policies and product data, and hands over to a human when needed." },
      { title: "Document & invoice extraction", text: "Reads PDFs, invoices and forms and fills your database automatically." },
      { title: "Sales & CRM helper", text: "Drafts follow-up emails, summarises leads and suggests next steps inside your CRM." },
      { title: "Internal knowledge search", text: "Staff ask questions in plain language and get answers from company documents." },
    ],
    process: ["Discovery call & use-case selection", "Data & privacy review", "Prototype with real samples", "Production integration with logging and cost limits", "Training and ongoing support"],
    faqs: [
      { question: "Can you integrate ChatGPT into my existing website or software?", answer: "Yes. We connect the OpenAI API to websites, web apps, CRMs, ERPs and mobile apps through a secure backend, so your API key and data are never exposed in the browser." },
      { question: "Is my business data used to train OpenAI models?", answer: "Data sent through the OpenAI API is not used for training by default. We also mask sensitive fields and store only what your use case needs." },
      { question: "How much does ChatGPT integration cost?", answer: "It depends on scope. We give a fixed estimate after a short discovery call, plus a clear forecast of monthly API usage costs." },
      { question: "Can it answer from my own documents?", answer: "Yes — we use retrieval (RAG) so answers come from your documents, with sources, instead of the model guessing." },
    ],
  },
  {
    slug: "claude-ai-integration",
    name: "Claude AI Integration",
    title: "Claude AI (Anthropic) Integration & Development Services",
    description:
      "Integrate Anthropic's Claude into your business software for long-document analysis, reliable assistants and AI agents — built by AJS.",
    intro:
      "Claude is strong at reading long documents, following detailed instructions and writing carefully. We build Claude-powered features directly into your products and workflows.",
    tools: ["Anthropic API", "Claude models", "Tool use / agents", "Prompt caching"],
    useCases: [
      { title: "Contract & report analysis", text: "Summarise long contracts, tenders and reports and flag important clauses." },
      { title: "Policy-aware assistants", text: "Assistants that follow your company rules and tone consistently." },
      { title: "AI agents with tools", text: "Claude calls your APIs to look up orders, create tickets or update records." },
      { title: "Content review", text: "Check drafts for accuracy, tone and compliance before publishing." },
    ],
    process: ["Use-case workshop", "Prompt & evaluation design", "Prototype with real samples", "Secure production rollout", "Monitoring and improvement"],
    faqs: [
      { question: "Why choose Claude over ChatGPT?", answer: "Claude is often preferred for very long documents and careful, instruction-following output. We can benchmark both on your real data and recommend the better fit — or support both." },
      { question: "Can Claude connect to my database or APIs?", answer: "Yes. Using tool use, Claude can call safe, permission-checked functions we build — for example fetching an order status or creating a support ticket." },
      { question: "Is Claude secure for business data?", answer: "Anthropic does not train on API data by default. We add access controls, audit logs and data minimisation on our side." },
    ],
  },
  {
    slug: "n8n-make-automation",
    name: "n8n & Make Automation",
    title: "n8n & Make.com Workflow Automation Services with AI",
    description:
      "Automate leads, invoices, reports and follow-ups with n8n, Make.com and Zapier — AI-powered workflow automation by AJS, India.",
    intro:
      "We design automations that move data between your apps, add AI where it helps, and remove hours of manual copy-paste every week.",
    tools: ["n8n (cloud or self-hosted)", "Make.com", "Zapier", "Webhooks & custom APIs"],
    useCases: [
      { title: "Lead capture to CRM", text: "Website, ads and WhatsApp leads land in your CRM with instant email/WhatsApp follow-up." },
      { title: "Invoice & payment flows", text: "Generate invoices, send reminders and reconcile payments automatically." },
      { title: "AI email triage", text: "Classify incoming emails, draft replies and route them to the right person." },
      { title: "Daily reports", text: "Pull numbers from multiple tools into one scheduled report." },
    ],
    process: ["Map current manual process", "Choose platform (n8n, Make or Zapier)", "Build & test with real data", "Error alerts and retries", "Handover documentation"],
    faqs: [
      { question: "Should I use n8n, Make or Zapier?", answer: "n8n is best when you want self-hosting and data control, Make for complex visual scenarios at lower cost, and Zapier for the quickest simple app-to-app connections. We recommend based on your volume, budget and privacy needs." },
      { question: "Can you self-host n8n for us?", answer: "Yes. We deploy n8n on your cloud or VPS with backups, SSL and monitoring so your data stays with you." },
      { question: "What happens if an automation fails?", answer: "We add retries, error branches and alerts (email or WhatsApp) so failures are caught and fixed quickly." },
    ],
  },
  {
    slug: "ai-chatbot-development",
    name: "AI Chatbot Development",
    title: "AI Chatbot Development — Voiceflow, Botpress, Rasa & Custom GPT Bots",
    description:
      "Custom AI chatbots for websites and WhatsApp using Voiceflow, Botpress, Rasa or custom GPT/Claude bots — trained on your business data.",
    intro:
      "We build chatbots that actually know your business — answering from your content, capturing leads and escalating to your team when needed.",
    tools: ["Voiceflow", "Botpress", "Rasa (open-source)", "Dialogflow", "Custom GPT / Claude bots"],
    useCases: [
      { title: "Website sales bot", text: "Answers product questions 24/7 and books calls or collects enquiries." },
      { title: "WhatsApp support bot", text: "Handles order status, FAQs and bookings on WhatsApp." },
      { title: "Internal HR/IT helpdesk", text: "Employees get instant answers about policies and processes." },
      { title: "On-premise bot", text: "Rasa-based bots for businesses that cannot send data to external clouds." },
    ],
    process: ["Define goals and conversation scope", "Collect knowledge sources", "Build and test conversations", "Launch on web / WhatsApp", "Review chats and improve monthly"],
    faqs: [
      { question: "Which chatbot platform is right for me?", answer: "Voiceflow and Botpress are fastest to launch and easy for your team to edit; Rasa suits strict data-privacy needs; a custom GPT/Claude bot gives full control inside your own app." },
      { question: "Can the chatbot work on WhatsApp?", answer: "Yes, through the WhatsApp Business Platform or an approved provider, alongside your website chat." },
      { question: "Will the bot give wrong answers?", answer: "We ground answers in your own content, limit the bot to approved topics and add human hand-off, which greatly reduces wrong answers." },
    ],
  },
  {
    slug: "ai-voice-agents",
    name: "AI Voice Agents",
    title: "AI Voice Agents & Text-to-Speech Integration (ElevenLabs)",
    description:
      "AI voice agents, IVR assistants and natural text-to-speech with ElevenLabs and similar platforms — including Hindi and Indian languages.",
    intro:
      "We add natural-sounding voices to your apps and build voice agents that answer calls, qualify leads and book appointments.",
    tools: ["ElevenLabs", "Play.ht", "Murf AI", "Speech-to-text APIs", "Telephony integrations"],
    useCases: [
      { title: "Appointment booking calls", text: "A voice agent answers calls and books slots into your calendar." },
      { title: "Lead qualification", text: "Calls back new enquiries, asks key questions and logs answers in your CRM." },
      { title: "App voiceovers", text: "Read-aloud and narration in English, Hindi and other languages." },
      { title: "Training content", text: "Consistent voiceovers for courses and product videos." },
    ],
    process: ["Pick voice & languages", "Design call script and guardrails", "Integrate with phone system / app", "Pilot with real calls", "Tune and scale"],
    faqs: [
      { question: "Can AI voice agents speak Hindi?", answer: "Yes. Platforms like ElevenLabs support Hindi and many Indian and global languages with natural voices." },
      { question: "Can the voice agent transfer to a human?", answer: "Yes — we design clear hand-off rules so complex or sensitive calls go to your team." },
      { question: "Is voice cloning allowed?", answer: "Only with the speaker's explicit consent. We follow each platform's consent and safety policies." },
    ],
  },
];

export function getAiIntegrationService(slug: string) {
  return AI_INTEGRATION_SERVICES.find((s) => s.slug === slug);
}
