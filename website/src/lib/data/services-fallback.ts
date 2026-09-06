import type { ServiceDetail } from "@/lib/data/services";

/**
 * Default service content — real capability copy for the fifteen core
 * services, used until / real content is published from /ajadmin. Everything
 * here is overridable from the CMS (services + service_faqs tables).
 */

export const SERVICE_CATEGORIES = [
  "Software & Applications",
  "Mobile & Desktop",
  "Business Systems",
  "Industry Solutions",
] as const;

export const FALLBACK_SERVICES: ServiceDetail[] = [
  {
    status: "published",
    id: "fallback-custom-software-development",
    slug: "custom-software-development",
    name: "Custom Software Development",
    category: "Software & Applications",
    icon: "code",
    shortDescription:
      "Software designed and built around your exact business requirements, from first draft to deployment.",
    longDescription:
      "Off-the-shelf tools force your business to adapt to them. We do the opposite: we study how your team actually works and build software that fits those workflows exactly — whether that is a single internal tool or a complete system that runs your daily operations.\n\nEvery engagement starts with written requirements, continues with working software you can review, and ends with a deployment your team owns outright.",
    problems: [
      "Teams juggling spreadsheets, WhatsApp messages and paper registers for the same data",
      "Paying monthly for ready-made software full of features you never use",
      "Critical processes that live in one person's head instead of a system",
      "No single, reliable source of truth for orders, stock or customer records",
    ],
    deliverables: [
      "Written requirements and feature specification",
      "Complete working software deployed to your environment",
      "Admin panel and user documentation",
      "Source code ownership and handover",
      "Post-launch support window",
    ],
    platforms: ["Web", "Windows desktop", "Android", "iOS"],
    features: [
      "Custom modules built from your requirements",
      "Role-based access for staff and managers",
      "Reports and exports your accountant will actually use",
      "Integrations with the tools you already rely on",
      "Audit trail of important changes",
    ],
    processSteps: [
      "Map your current workflow and agree the must-have requirements",
      "Finalise scope, platform and a transparent estimate",
      "Build in reviewable iterations with your feedback at every step",
      "Deploy, train your team and support the system after launch",
    ],
    industries: ["Retail", "Healthcare", "Manufacturing", "Logistics"],
    faqs: [
      {
        question: "How much does custom software cost?",
        answer:
          "It depends on scope. After a short discovery call we provide a written estimate broken down by feature, so you can decide what to build first and what can wait.",
      },
      {
        question: "How long does a custom build take?",
        answer:
          "A focused internal tool often ships in weeks. Larger systems take months and are delivered in usable stages, so your team gains value before the final release.",
      },
      {
        question: "Who owns the software?",
        answer:
          "You do. Source code, documentation and credentials are handed over — you are never locked into working with us.",
      },
    ],
    seoTitle: "Custom Software Development Company in India",
    seoDescription:
      "Custom software built around your exact requirements — specification, development, deployment and support, with full source code ownership.",
  },
  {
    status: "published",
    id: "fallback-saas-development",
    slug: "saas-development",
    name: "SaaS Development",
    category: "Software & Applications",
    icon: "cloud",
    shortDescription:
      "Multi-tenant SaaS products with subscriptions, roles, dashboards and the APIs your customers expect.",
    longDescription:
      "Turning a service idea into a subscription product takes more than a pretty UI: tenancy, billing, onboarding, roles and usage reporting all have to work from day one. We build SaaS platforms with that operational backbone included.\n\nWe also help you plan the parts that are easy to forget — data isolation between customers, admin tooling for your own team, and a pricing structure your billing system can actually support.",
    problems: [
      "A validated service idea that still runs on manual work and spreadsheets",
      "Customers asking for self-service access instead of phone calls",
      "No reliable way to onboard, bill and support many customers at once",
      "Fear of scaling a product built on a shaky technical foundation",
    ],
    deliverables: [
      "Multi-tenant application with customer onboarding",
      "Subscription and plan management",
      "Customer-facing dashboard and admin panel",
      "REST APIs for integrations",
      "Deployment, monitoring and support setup",
    ],
    platforms: ["Web", "Cloud"],
    features: [
      "Tenant isolation with row-level security",
      "Plan limits, upgrades and trial handling",
      "Usage and revenue reporting",
      "Email notifications and onboarding flows",
      "Admin tooling for your own team",
    ],
    processSteps: [
      "Define the core product, tenancy model and pricing",
      "Build the customer-facing product and admin panel",
      "Pilot with a small group of real customers",
      "Launch, measure and iterate on feedback",
    ],
    industries: ["Professional services", "Education", "Logistics", "Healthcare"],
    faqs: [
      {
        question: "Can you build on top of our existing product?",
        answer:
          "Yes. We regularly extend existing platforms with new modules, APIs or a proper multi-tenant architecture — after assessing what can be safely reused.",
      },
      {
        question: "Which billing systems do you integrate?",
        answer:
          "We integrate with the gateway you choose and keep card data entirely inside that provider. Our side stores only references and subscription status.",
      },
      {
        question: "Can the product start small and grow?",
        answer:
          "That is the recommended path: launch with the smallest useful feature set, then add modules as paying customers demand them.",
      },
    ],
    seoTitle: "SaaS Development Company in India",
    seoDescription:
      "Multi-tenant SaaS development: onboarding, subscriptions, dashboards, APIs and admin tooling, built to scale from pilot to product.",
  },
  {
    status: "published",
    id: "fallback-web-application-development",
    slug: "web-application-development",
    name: "Web Application Development",
    category: "Software & Applications",
    icon: "globe",
    shortDescription:
      "Fast, secure web applications for daily operations — portals, dashboards, workflows and reporting.",
    longDescription:
      "A web application is software your team and customers use every day, so speed, reliability and clarity matter more than decoration. We build operational web apps that stay quick under real data loads and remain easy to change as your processes evolve.\n\nSecurity is part of the foundation, not a final check: validated inputs, role-based access and protected data come standard.",
    problems: [
      "Internal tools that slow to a crawl as your data grows",
      "Important workflows that only work from one office computer",
      "Teams sharing one login because per-user access was never built",
      "Reporting that means exporting to Excel and manual rework",
    ],
    deliverables: [
      "Responsive web application accessible from any modern browser",
      "User roles, permissions and secure authentication",
      "Dashboards, filters and exports for reporting",
      "API endpoints where other systems need access",
      "Hosting setup with backups and monitoring",
    ],
    platforms: ["Web", "Cloud"],
    features: [
      "Server-rendered pages for speed and search visibility",
      "Optimised database queries and pagination",
      "File uploads with safe validation",
      "Activity logs for sensitive actions",
      "Accessible, keyboard-friendly interfaces",
    ],
    processSteps: [
      "Document the workflows the application must support",
      "Design data model and screen flows",
      "Build core features first, then refine with user feedback",
      "Deploy with backups, monitoring and a support plan",
    ],
    industries: ["Logistics", "Education", "Manufacturing", "Professional services"],
    faqs: [
      {
        question: "Will the application work on mobile devices?",
        answer:
          "Yes — interfaces are responsive by default, so staff can use the same application from phones, tablets and desktops.",
      },
      {
        question: "Can it connect to our existing software?",
        answer:
          "Usually, yes. We integrate with accounting tools, payment gateways, WhatsApp APIs and legacy databases through documented interfaces.",
      },
      {
        question: "What happens if traffic grows suddenly?",
        answer:
          "We build on infrastructure that scales horizontally and keep queries indexed, so growth is a configuration task rather than a rewrite.",
      },
    ],
    seoTitle: "Web Application Development Company in India",
    seoDescription:
      "Secure, fast web applications: portals, dashboards, role-based access, reporting and integrations — built to handle real daily workloads.",
  },
  {
    status: "published",
    id: "fallback-website-development",
    slug: "website-development",
    name: "Website Development",
    category: "Software & Applications",
    icon: "monitor",
    shortDescription:
      "Professional, fast-loading company websites that build trust and turn visitors into enquiries.",
    longDescription:
      "Your website is often the first serious conversation a customer has with your business. We build sites that load quickly, read clearly on every screen size and make the next step — calling, messaging or requesting a quote — effortless.\n\nTechnical SEO is included from the start: clean URLs, structured data, sitemaps and metadata, so search engines can understand and index your pages properly.",
    problems: [
      "An outdated site that makes a serious business look careless",
      "Pages that take too long to load and lose mobile visitors",
      "No way to update content without calling a developer",
      "Invisible in search results because the basics were never done",
    ],
    deliverables: [
      "Responsive website designed around your brand",
      "Contact and enquiry forms with spam protection",
      "CMS access to update text, images and pages",
      "Technical SEO: metadata, sitemap, structured data",
      "Analytics-ready setup with fast page loads",
    ],
    platforms: ["Web"],
    features: [
      "Mobile-first responsive layouts",
      "Optimised images and fonts for Core Web Vitals",
      "Accessible markup (WCAG 2.2 AA target)",
      "Editable content through a protected admin panel",
      "Clean, permanent URLs and redirects",
    ],
    processSteps: [
      "Understand your business, audience and the actions that matter",
      "Design page structure and content flow",
      "Build, test across devices and optimise speed",
      "Launch with SEO basics and hand over editing access",
    ],
    industries: ["Professional services", "Retail", "Manufacturing", "Education"],
    faqs: [
      {
        question: "Can we update the website ourselves?",
        answer:
          "Yes. The built-in admin panel lets you edit text, images and pages without touching code — with sensible limits so the design stays intact.",
      },
      {
        question: "Will the site rank on Google?",
        answer:
          "We make the site technically ready to be crawled and indexed — clean structure, metadata, speed and sitemaps. Ranking also depends on content and competition, which no developer can guarantee.",
      },
      {
        question: "Can you redesign our existing site?",
        answer:
          "Yes — including preserving your existing URLs with redirects so old links and search listings keep working.",
      },
    ],
    seoTitle: "Website Development Company in India",
    seoDescription:
      "Professional business websites: responsive design, fast loading, CMS editing, contact forms and technical SEO done properly from day one.",
  },
  {
    status: "published",
    id: "fallback-ecommerce-development",
    slug: "ecommerce-development",
    name: "Ecommerce Development",
    category: "Software & Applications",
    icon: "cart",
    shortDescription:
      "Online stores with clean product catalogues, smooth checkout, payments and order management.",
    longDescription:
      "An online store succeeds on details: accurate stock, clear product pages, a checkout that does not fight the customer, and orders that reach your packing desk without retyping. We build ecommerce on those details.\n\nWhether you sell fifty products or fifty thousand, the catalogue, search and checkout are engineered around how your business actually fulfils orders.",
    problems: [
      "Selling only through marketplaces, with no direct customer relationship",
      "Stock numbers that differ between the shop, the website and reality",
      "Abandoned checkouts caused by slow or confusing payment flows",
      "Orders handled by screenshot and manual entry into other systems",
    ],
    deliverables: [
      "Online store with product catalogue and search",
      "Secure payment gateway integration",
      "Order management workflow for your team",
      "Stock synchronisation with your inventory rules",
      "Order notifications and customer emails",
    ],
    platforms: ["Web", "Cloud"],
    features: [
      "Product variants, pricing rules and discounts",
      "Guest checkout and saved-customer flows",
      "Payment gateway with server-side verification",
      "Shipping zones and tax handling",
      "Sales and inventory reports",
    ],
    processSteps: [
      "Map your catalogue, fulfilment and payment requirements",
      "Configure catalogue structure and checkout rules",
      "Integrate payments, test end-to-end with real orders",
      "Launch, then refine based on customer behaviour",
    ],
    industries: ["Retail", "Pharmacy", "Food & beverage", "Manufacturing"],
    faqs: [
      {
        question: "Which payment gateways can we use?",
        answer:
          "The gateway of your choice — integrated server-side with webhook verification, so a payment is only marked successful when the provider confirms it.",
      },
      {
        question: "Can the store connect to our shop's billing software?",
        answer:
          "Yes, stock and orders can be synchronised with your existing POS or inventory system through an integration layer.",
      },
      {
        question: "Who handles product photos and descriptions?",
        answer:
          "You provide product data; we import it, set up the catalogue structure and can help with bulk formatting and templates.",
      },
    ],
    seoTitle: "Ecommerce Website Development Company in India",
    seoDescription:
      "Online store development: catalogue, secure payments, order management, stock sync and reporting — engineered around how you fulfil orders.",
  },
  {
    status: "published",
    id: "fallback-android-app-development",
    slug: "android-app-development",
    name: "Android App Development",
    category: "Mobile & Desktop",
    icon: "smartphone",
    shortDescription:
      "Native Android apps — customer-facing products and internal field tools that work reliably on real devices.",
    longDescription:
      "Android runs on an enormous range of devices with different screens, budgets and network conditions. We build Android apps that behave well on all of them: fast startup, small downloads, offline tolerance where it matters and updates that reach users smoothly.\n\nFor customer-facing products we focus on onboarding and retention; for internal tools we focus on reliability in the field — warehouse floors, delivery routes and sales visits.",
    problems: [
      "Field staff filling paper forms that reach the office days later",
      "A mobile-unfriendly website that customers abandon on phones",
      "Apps that crash on the older devices your users actually own",
      "No way to push updates or know what version customers run",
    ],
    deliverables: [
      "Android app published to your Play Store account",
      "Backend APIs and data synchronisation",
      "Offline-capable flows where the use case needs them",
      "Crash and usage monitoring",
      "Play Store listing assets and release management",
    ],
    platforms: ["Android"],
    features: [
      "Modern Kotlin implementation",
      "Push notifications for time-sensitive updates",
      "Camera, location and barcode capabilities",
      "Secure login with device-friendly sessions",
      "Staged rollouts for safe releases",
    ],
    processSteps: [
      "Define users, devices and the core journeys",
      "Design screens and prototype the main flow",
      "Develop with regular builds you can install and test",
      "Release via Play Store and monitor real-world behaviour",
    ],
    industries: ["Logistics", "Retail", "Field services", "Healthcare"],
    faqs: [
      {
        question: "Do you publish the app under our account?",
        answer:
          "Yes — the Play Store developer account stays yours, and we handle the technical release process under it.",
      },
      {
        question: "Can the app work without internet?",
        answer:
          "Where the workflow needs it, yes: data is captured offline and synchronised when connectivity returns.",
      },
      {
        question: "Should we build Android and iOS together?",
        answer:
          "If both audiences matter from day one, a cross-platform approach may save cost. We recommend the platform mix after understanding your users, not before.",
      },
    ],
    seoTitle: "Android App Development Company in India",
    seoDescription:
      "Native Android app development: Play Store release, backend APIs, offline support, push notifications and crash monitoring.",
  },
  {
    status: "published",
    id: "fallback-ios-app-development",
    slug: "ios-app-development",
    name: "iOS App Development",
    category: "Mobile & Desktop",
    icon: "smartphone",
    shortDescription:
      "Native iOS apps that feel at home on iPhone and iPad — polished, secure and App Store ready.",
    longDescription:
      "iOS users notice quality. We build iPhone and iPad apps that follow platform conventions, respect privacy expectations and pass App Store review without drama.\n\nWhether it is a customer product or an internal tool for a leadership team that lives on iPhones, the app is engineered around the specific devices your audience holds.",
    problems: [
      "A web app that feels clumsy next to native iOS experiences",
      "App Store rejections blocking your launch timeline",
      "Customer data handled loosely on executive devices",
      "An Android app with no way to reach iOS customers",
    ],
    deliverables: [
      "iOS app released through your App Store account",
      "Backend APIs, authentication and sync",
      "App Store listing, screenshots and review preparation",
      "Crash reporting and analytics hooks",
      "Ongoing OS-version compatibility updates",
    ],
    platforms: ["iOS", "iPadOS"],
    features: [
      "Native Swift implementation",
      "Secure storage and biometric login options",
      "Push notifications and deep links",
      "iPad-optimised layouts where relevant",
      "Privacy manifest and permissions done correctly",
    ],
    processSteps: [
      "Define the audience, devices and core journeys",
      "Design and prototype the experience",
      "Develop with TestFlight builds for your feedback",
      "App Store submission, review support and release",
    ],
    industries: ["Professional services", "Healthcare", "Retail", "Education"],
    faqs: [
      {
        question: "Do we need a Mac or an Apple developer account?",
        answer:
          "You need an Apple Developer Program membership for release; we handle the tooling and build pipeline on our side.",
      },
      {
        question: "Can one app serve both iOS and Android?",
        answer:
          "Often yes, using a cross-platform framework — decided after weighing your users, budget and device-specific needs.",
      },
      {
        question: "How do you handle App Store review?",
        answer:
          "We prepare the listing, privacy declarations and demo account, and support the review process until the app is approved.",
      },
    ],
    seoTitle: "iOS App Development Company in India",
    seoDescription:
      "Native iOS app development with Swift: App Store release support, secure authentication, push notifications and ongoing OS updates.",
  },
  {
    status: "published",
    id: "fallback-desktop-software-development",
    slug: "desktop-software-development",
    name: "Desktop Software Development",
    category: "Mobile & Desktop",
    icon: "app-window",
    shortDescription:
      "Windows desktop and EXE software for shops, offices and labs that need dependable local machines.",
    longDescription:
      "Some work belongs on the desktop: billing counters with printers, labs with local instruments, offices with unreliable internet. We build Windows desktop software that installs simply, runs offline and talks to local hardware where needed.\n\nWhen a central database makes sense, the desktop app syncs with it; when fully offline is the requirement, the software stands alone.",
    problems: [
      "Cloud-only tools that stop working when the internet drops",
      "Counter staff fighting with browser print dialogs and dot-matrix printers",
      "Old software that no longer installs on modern Windows",
      "Needing an EXE your team can install without IT support",
    ],
    deliverables: [
      "Windows desktop application with a simple installer",
      "Local or central database, per your workflow",
      "Printer and peripheral integration",
      "Auto-update mechanism where internet is available",
      "Source code and documentation handover",
    ],
    platforms: ["Windows"],
    features: [
      "Fast keyboard-first operation for busy counters",
      "Hardware integration: printers, barcode scanners,weighing scales",
      "Offline operation with optional synchronisation",
      "Role-based access and daily closing reports",
      "Backup and restore built in",
    ],
    processSteps: [
      "Understand the counter or office workflow and hardware",
      "Agree feature scope and data storage model",
      "Develop and pilot on your real machines",
      "Install, train staff and provide ongoing support",
    ],
    industries: ["Retail", "Pharmacy", "Manufacturing", "Healthcare"],
    faqs: [
      {
        question: "Can the desktop software run without internet?",
        answer:
          "Yes. Fully offline operation is a common requirement and a normal configuration — with optional syncing to a central server when connectivity exists.",
      },
      {
        question: "Can it print to our existing printer?",
        answer:
          "In most cases yes, including thermal and dot-matrix printers — confirmed during discovery with your actual hardware.",
      },
      {
        question: "Which Windows versions are supported?",
        answer:
          "We target currently supported Windows versions and test on the machines you actually use, including older hardware where feasible.",
      },
    ],
    seoTitle: "Desktop & Windows Software Development Company in India",
    seoDescription:
      "Windows desktop software development: simple installers, offline operation, printer and barcode hardware integration, auto-updates.",
  },
  {
    status: "published",
    id: "fallback-erp-business-software",
    slug: "erp-business-software",
    name: "ERP & Business Software",
    category: "Business Systems",
    icon: "dashboard",
    shortDescription:
      "ERP, CRM and inventory systems that bring sales, stock, accounts and reporting into one place.",
    longDescription:
      "An ERP succeeds when it mirrors how your business actually operates — not when it forces a generic process on every department. We implement and build ERP-style systems sized to your business, from focused inventory-and-billing systems to multi-department platforms.\n\nThe goal is always the same: one reliable place where sales, stock, purchasing and accounts agree with each other.",
    problems: [
      "Stock figures that differ between the shop floor, the store and the books",
      "Departments exchanging the same data by WhatsApp and re-entry",
      "Management decisions made on month-old spreadsheets",
      "Paying for enterprise ERP modules a business of your size never uses",
    ],
    deliverables: [
      "Requirement study and module plan",
      "Core modules: sales, purchase, inventory, accounts-facing reports",
      "Role-based access across departments",
      "Data migration from your existing records",
      "Training, documentation and support",
    ],
    platforms: ["Web", "Windows desktop", "Cloud"],
    features: [
      "Live stock across locations",
      "Order-to-delivery and purchase-to-pay workflows",
      "GST-ready invoicing and tax reports",
      "Dashboards for owners and managers",
      "Approval workflows for sensitive actions",
    ],
    processSteps: [
      "Study current processes across departments",
      "Design the module plan and data flows",
      "Implement in stages with real data migration",
      "Train users, go live and stabilise with support",
    ],
    industries: ["Manufacturing", "Retail", "Logistics", "Wholesale & distribution"],
    faqs: [
      {
        question: "Should we buy a standard ERP or build one?",
        answer:
          "If standard ERP fits your processes, we will say so. Building makes sense when your workflows are the differentiator or standard systems keep fighting your operations.",
      },
      {
        question: "Can it start with just inventory and billing?",
        answer:
          "Yes — phased adoption is the sensible path. Start with the modules that hurt most, add others once the foundation is trusted.",
      },
      {
        question: "How is our existing data migrated?",
        answer:
          "We map your current records, clean them together with your team and migrate with verification counts before go-live.",
      },
    ],
    seoTitle: "ERP & CRM Software Development Company in India",
    seoDescription:
      "ERP, CRM and inventory software: live stock, invoicing, approvals and management dashboards — implemented in stages with data migration.",
  },
  {
    status: "published",
    id: "fallback-hospital-clinic-software",
    slug: "hospital-clinic-software",
    name: "Hospital & Clinic Software",
    category: "Industry Solutions",
    icon: "stethoscope",
    shortDescription:
      "OPD, IPD, appointments, prescriptions and billing — software shaped by clinical workflows.",
    longDescription:
      "Hospitals and clinics cannot afford software that slows the front desk or the doctor. We build healthcare software around clinical routines: quick patient registration, legible prescription history, transparent billing and reports the administration actually needs.\n\nPatient data is treated with the care it deserves — role-based access and audit trails come standard.",
    problems: [
      "Patient history scattered across paper files and registers",
      "Front desk queues during peak hours because the system is slow",
      "Billing disputes caused by unclear charges across departments",
      "No quick answer to 'which medicines was this patient prescribed?'",
    ],
    deliverables: [
      "Patient registration and records management",
      "Appointments, OPD/IPD workflows and queue display",
      "Prescription and treatment history",
      "Departmental billing with consolidated invoices",
      "Reports for administration and compliance",
    ],
    platforms: ["Web", "Windows desktop"],
    features: [
      "Fast search across patients by name, phone or ID",
      "Doctor-wise schedules and consultation records",
      "Pharmacy and lab billing integration",
      "Role-based access with audit trail",
      "Print formats for prescriptions and bills",
    ],
    processSteps: [
      "Observe front desk, doctor and billing workflows",
      "Configure patient flows, departments and rate lists",
      "Pilot at the counter with real registrations",
      "Go live department by department with support",
    ],
    industries: ["Healthcare"],
    faqs: [
      {
        question: "Can it work for a single-doctor clinic?",
        answer:
          "Yes — the same system scales from a single consulting room to multi-department hospitals; you only switch on the modules you need.",
      },
      {
        question: "How is patient data protected?",
        answer:
          "Role-based access, audit trails and database-level security policies; staff see only what their role requires.",
      },
      {
        question: "Can existing patient records be imported?",
        answer:
          "Yes — from spreadsheets or your previous software, with verification before go-live.",
      },
    ],
    seoTitle: "Hospital & Clinic Software Development Company in India",
    seoDescription:
      "Hospital and clinic management software: patient records, appointments, prescriptions, departmental billing and role-based data protection.",
  },
  {
    status: "published",
    id: "fallback-pharmacy-software",
    slug: "pharmacy-software",
    name: "Pharmacy Software",
    category: "Industry Solutions",
    icon: "pill",
    shortDescription:
      "Medicine stock, batches, expiry tracking, substitutions and counter billing for pharmacies.",
    longDescription:
      "A pharmacy counter lives and dies by speed and accuracy: the right batch, the right expiry, the right price, instantly. We build pharmacy software that keeps the counter moving while quietly handling the discipline — batch and expiry tracking, purchase records and stock alerts.\n\nSubstitutions and alternative-medicine lookups are built for real counter conversations, not catalogue perfection.",
    problems: [
      "Expired stock discovered only at the annual count",
      "Long counter queues during rush hours",
      "No quick view of which alternatives are in stock",
      "Purchase records scattered across supplier bills",
    ],
    deliverables: [
      "Counter billing with barcode support",
      "Batch, expiry and rack tracking",
      "Purchase entry and supplier ledgers",
      "Stock alerts: low stock, near-expiry, dead stock",
      "Sales, margin and GST reports",
    ],
    platforms: ["Windows desktop", "Web"],
    features: [
      "Fast search by brand, generic name or composition",
      "Substitute suggestions from available stock",
      "Wholesale/retail rate handling",
      "Customer credit (khata) management",
      "Daily cash and stock closing summary",
    ],
    processSteps: [
      "Set up your medicine catalogue and rate structure",
      "Migrate existing stock with batch and expiry data",
      "Train counter staff on the billing flow",
      "Review reports and tighten stock rules over the first month",
    ],
    industries: ["Pharmacy", "Healthcare", "Retail"],
    faqs: [
      {
        question: "Can we import our existing medicine list?",
        answer:
          "Yes — from your current software or spreadsheets, including batches, expiry dates and rates where available.",
      },
      {
        question: "Does it handle both retail and wholesale billing?",
        answer: "Yes, with separate rate structures and formats for each type of customer.",
      },
      {
        question: "Will it run on the computer at our counter?",
        answer:
          "We test on your actual machine during the pilot — including barcode scanners and printers you already own.",
      },
    ],
    seoTitle: "Pharmacy Software Development Company in India",
    seoDescription:
      "Pharmacy management software: fast counter billing, batch and expiry tracking, substitute lookups, supplier ledgers and GST reports.",
  },
  {
    status: "published",
    id: "fallback-retail-pos-inventory",
    slug: "retail-pos-inventory",
    name: "Retail POS & Inventory",
    category: "Industry Solutions",
    icon: "store",
    shortDescription:
      "Billing counters and stockrooms working from the same numbers — POS, inventory and daily closing.",
    longDescription:
      "Retail software earns its keep at two moments: the second a customer is waiting at the counter, and the moment you need to know what actually sold. We build POS and inventory systems that make both fast.\n\nFrom a single shop counter to multiple locations, the software keeps billing quick, stock honest and the day's closing a five-minute job instead of an evening project.",
    problems: [
      "Stock registers that never match what is on the shelf",
      "Counter queues during sale days because billing is slow",
      "Day-end closing that takes hours of manual tallying",
      "Theft and shrinkage visible only when profits look wrong",
    ],
    deliverables: [
      "Fast POS billing with barcode and printer support",
      "Live inventory across counters and godowns",
      "Daily closing, cash reconciliation and shrinkage reports",
      "Purchase entry and supplier management",
      "Loyalty or customer credit features where useful",
    ],
    platforms: ["Windows desktop", "Web", "Android"],
    features: [
      "Keyboard shortcuts for high-speed billing",
      "Held bills, splits and returns handling",
      "Reorder alerts based on sales velocity",
      "Multiple counters on one stock pool",
      "Owner dashboard: sales, margin, top items",
    ],
    processSteps: [
      "Map counter layout, hardware and product categories",
      "Load inventory and configure taxes and rates",
      "Train cashiers and pilot on one counter",
      "Roll out, then review reports after the first trading weeks",
    ],
    industries: ["Retail", "Wholesale & distribution", "Food & beverage"],
    faqs: [
      {
        question: "Can multiple counters share one stock?",
        answer:
          "Yes — every counter bills against the same live stock, with per-counter cash summaries at closing.",
      },
      {
        question: "Does it work with barcode scanners and thermal printers?",
        answer:
          "Yes, standard scanners and receipt printers are supported; we verify your specific models during setup.",
      },
      {
        question: "Can the owner check sales from home?",
        answer:
          "With the web or cloud configuration, yes — a secure owner dashboard works from any browser.",
      },
    ],
    seoTitle: "Retail POS & Inventory Software Development Company in India",
    seoDescription:
      "POS and inventory software: fast counter billing, live multi-location stock, daily closing reports and owner dashboards.",
  },
  {
    status: "published",
    id: "fallback-hotel-management-software",
    slug: "hotel-management-software",
    name: "Hotel Management Software",
    category: "Industry Solutions",
    icon: "hotel",
    shortDescription:
      "Front desk, room availability, check-ins, housekeeping and billing for hotels and guest houses.",
    longDescription:
      "A hotel's day is a moving puzzle: arrivals, departures, room status, payments and the occasional walk-in during a full house. We build hotel software that keeps the front desk in control and the owner informed.\n\nRoom racks, tariffs, taxes and agent commissions all follow your property's rules — not a generic template.",
    problems: [
      "Room availability tracked on a whiteboard or register",
      "Double bookings during peak season",
      "Housekeeping finding out about a checkout from the guest",
      "Month-end billing confusion across agents and corporate accounts",
    ],
    deliverables: [
      "Front desk operations: check-in, check-out, room moves",
      "Live room availability and booking calendar",
      "Tariff plans, taxes and split billing",
      "Housekeeping status workflow",
      "Occupancy, revenue and agent reports",
    ],
    platforms: ["Web", "Windows desktop"],
    features: [
      "Walk-in, phone and online booking entries in one calendar",
      "Group booking and event handling",
      "Guest history and preferences",
      "Agent/corporate rate contracts and ledgers",
      "Night audit and daily cash summary",
    ],
    processSteps: [
      "Configure room types, tariffs and tax rules",
      "Migrate current bookings and guest records",
      "Train front desk and housekeeping teams",
      "Go live with support through the first full season",
    ],
    industries: ["Hospitality"],
    faqs: [
      {
        question: "Can it handle both rooms and a restaurant?",
        answer:
          "Yes — restaurant or service charges can post to the same folio so the guest settles one bill at checkout.",
      },
      {
        question: "Does it support online bookings from our website?",
        answer:
          "Availability can be exposed to your own website's booking form; marketplace integrations are added based on the channels you use.",
      },
      {
        question: "What about different tariff seasons?",
        answer:
          "Season-wise tariffs, weekend rates and special plans are configured per room type with date ranges.",
      },
    ],
    seoTitle: "Hotel Management Software Development Company in India",
    seoDescription:
      "Hotel software: room availability calendar, check-in/out, housekeeping workflow, split billing, agent ledgers and occupancy reports.",
  },
  {
    status: "published",
    id: "fallback-api-system-integrations",
    slug: "api-system-integrations",
    name: "API & System Integrations",
    category: "Business Systems",
    icon: "server",
    shortDescription:
      "Connecting the software you already use — payments, WhatsApp, accounting, marketplaces and legacy systems.",
    longDescription:
      "Most businesses do not need another app; they need their existing apps to talk to each other. We design and build the integration layer: payment confirmations reaching your ERP, orders flowing from marketplace to warehouse, and customer messages triggered by real events.\n\nIntegrations are built to fail safely — retries, logs and alerts — because a silent failure is worse than no integration at all.",
    problems: [
      "Staff re-typing the same data between two systems every day",
      "Payment statuses updated by hand from the gateway dashboard",
      "Two systems that each hold half the truth",
      "An old database nobody wants to touch but everybody needs",
    ],
    deliverables: [
      "Integration design document with data flows",
      "API endpoints, webhooks and sync jobs",
      "Error handling, retries and delivery logs",
      "Monitoring and failure alerts",
      "Documentation for future maintenance",
    ],
    platforms: ["Web", "Cloud", "Server"],
    features: [
      "Payment gateway webhooks with signature verification",
      "WhatsApp Business and SMS notifications",
      "Accounting software data exchange",
      "Marketplace order imports",
      "Legacy database bridges",
    ],
    processSteps: [
      "Map the systems, data owners and trigger points",
      "Agree the integration contract and failure behaviour",
      "Implement and test with sandbox and real data",
      "Monitor in production and document edge cases",
    ],
    industries: ["Retail", "Logistics", "Manufacturing", "Professional services"],
    faqs: [
      {
        question: "Can you integrate with our old legacy software?",
        answer:
          "Often yes — through its database, file exports or any interface it exposes. We assess feasibility honestly before committing.",
      },
      {
        question: "What happens when one side goes down?",
        answer:
          "Integrations queue and retry with full logs, and you get alerted — so nothing is silently lost between systems.",
      },
      {
        question: "Is it safe to share API keys with you?",
        answer:
          "Credentials stay in protected server configuration, never in code or logs, and are rotated after handover.",
      },
    ],
    seoTitle: "API Integration Services Company in India",
    seoDescription:
      "System integration services: payment webhooks, WhatsApp and SMS, accounting exchanges, marketplace imports and legacy bridges — built to fail safely.",
  },
  {
    status: "published",
    id: "fallback-cloud-deployment-maintenance",
    slug: "cloud-deployment-maintenance",
    name: "Cloud Deployment & Maintenance",
    category: "Business Systems",
    icon: "cloud",
    shortDescription:
      "Reliable hosting, deployments, backups, monitoring and ongoing maintenance for business software.",
    longDescription:
      "Software is not finished at launch — it has to stay fast, safe and up to date. We deploy applications on sensible cloud infrastructure and keep them healthy: automated backups, security updates, monitoring with real alerts and a maintenance rhythm that prevents surprises.\n\nYou get predictable care instead of emergency firefighting.",
    problems: [
      "A live system with no backups — or backups nobody has ever tested",
      "Software that breaks every time someone deploys an update",
      "Nobody noticing an outage until a customer calls",
      "Security updates postponed until something forces the issue",
    ],
    deliverables: [
      "Production deployment with staging environment",
      "Automated backups with tested restore procedure",
      "Uptime and error monitoring with alerts",
      "Security updates and dependency patches",
      "A maintenance plan with clear response times",
    ],
    platforms: ["Cloud", "Server"],
    features: [
      "Zero-downtime or low-window deployments",
      "Environment variables and secrets managed properly",
      "Performance monitoring and slow-query fixes",
      "Restore drills, not just backup schedules",
      "Documentation of the whole setup",
    ],
    processSteps: [
      "Audit the current hosting, backups and risks",
      "Set up proper deployment pipeline and monitoring",
      "Verify restore and rollback procedures",
      "Move to a scheduled maintenance rhythm",
    ],
    industries: ["Professional services", "Retail", "Healthcare", "Education"],
    faqs: [
      {
        question: "Can you maintain software you did not build?",
        answer:
          "Usually yes — it starts with an audit of the codebase and infrastructure, after which we agree an honest maintenance scope.",
      },
      {
        question: "Which cloud providers do you work with?",
        answer:
          "The practical choice for your workload — Vercel, Supabase, common VPS and cloud providers — keeping your setup portable rather than locked in.",
      },
      {
        question: "How quickly do you respond to an outage?",
        answer:
          "Monitoring alerts us immediately; the response time is defined in the maintenance agreement you choose.",
      },
    ],
    seoTitle: "Cloud Application Modernization & Maintenance in India",
    seoDescription:
      "Cloud deployment and maintenance: pipelines, automated backups with tested restores, monitoring with alerts and scheduled security updates.",
  },
];
