/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LYNIX LAB — CENTRAL SITE CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every piece of editable website content lives here: brand, colours, contact
 *  details, navigation, services, pricing, portfolio, testimonials, social links
 *  and the privacy policy. Pages and components only *read* from this file.
 *
 *  Before going live, search this file for "TODO" and replace placeholders
 *  (contact details, social links, sample testimonials and sample projects).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { SiteConfig } from "@/types/site";

export const siteConfig: SiteConfig = {
  name: "Lynix Lab",
  legalName: "Lynix Lab", // TODO: registered company name for legal pages
  tagline: "Build. Automate. Create.",
  description:
    "Lynix Lab is a digital, technology and AI agency. We create brands and content, build websites and apps, and automate the busywork with chatbots, voice agents and AI agents.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  locale: "en_US",
  keywords: [
    "digital agency",
    "AI agency",
    "web development",
    "mobile app development",
    "business automation",
    "AI chatbots",
    "AI voice agents",
    "branding",
    "social media management",
    "digital marketing",
  ],

  // Brand palette (from the Lynix Lab identity board). Changing these updates the whole site.
  brand: {
    colors: {
      graphite: "#171B19",
      lime: "#A7F51B",
      ivory: "#F5F7EF",
      gray: "#E4E8E2",
      white: "#FFFFFF",
      muted: "#5B625E",
    },
  },

  contact: {
    email: "hello@lynixlab.com", // TODO: real inbox
    phone: "", // TODO: e.g. "+92 300 1234567" — hidden when empty
    whatsapp: "", // TODO: international format without "+", e.g. "923001234567" — hidden when empty
    location: "Remote-first studio, working with clients worldwide",
    hours: "Monday to Friday, 9:00–18:00 (PKT)",
    responseTime: "We reply to every enquiry within one working day.",
  },

  primaryCta: { label: "Book a free call", href: "/contact" },
  secondaryCta: { label: "See our work", href: "/portfolio" },

  navigation: [
    { label: "Services", href: "/services" },
    { label: "Work", href: "/portfolio" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  footerNavigation: [
    {
      title: "Studio",
      items: [
        { label: "About", href: "/about" },
        { label: "Work", href: "/portfolio" },
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Popular services",
      items: [
        { label: "Web development", href: "/services/web-development" },
        { label: "AI voice agents", href: "/services/ai-voice-agents" },
        { label: "Chatbots", href: "/services/chatbots" },
        { label: "Branding", href: "/services/branding" },
      ],
    },
    {
      title: "Legal",
      items: [{ label: "Privacy policy", href: "/privacy-policy" }],
    },
  ],

  // TODO: add your profile URLs. Links with an empty href are not shown.
  social: [
    { label: "LinkedIn", href: "" },
    { label: "Instagram", href: "" },
    { label: "Facebook", href: "" },
    { label: "YouTube", href: "" },
  ],

  home: {
    headline: ["Small parts.", "Bigger possibilities."],
    intro:
      "We are a small team that designs, builds and automates. Brand, content, websites, apps and AI agents, all made to fit together so your business runs with fewer moving parts.",
    servicesHeading: "Fifteen services, three ways we help",
    servicesIntro:
      "Pick one block or combine several. Every service is scoped on its own, and they're built to work together.",
    processHeading: "How a project runs",
    workHeading: "Recent work",
    testimonialsHeading: "What clients say",
    ctaHeading: "Have a project in mind?",
    ctaText: "Tell us what you want to build, automate or launch. A 30-minute call is free and you'll leave with a clear next step.",
  },

  about: {
    heading: "A studio built from small, solid parts",
    intro:
      "Lynix Lab brings creative, engineering and AI work under one roof, so you don't have to manage five freelancers to ship one idea.",
    story: [
      "Most businesses don't need a bigger agency. They need the right pieces, built properly and connected: a brand people remember, a website that loads fast and converts, and systems that answer customers at 2 a.m.",
      "That's how we work. We break projects into small, well-defined parts, deliver them quickly, and make sure each one fits the next. A chatbot plugs into your CRM. Your campaign lands on a page built to convert it. Your servers are monitored and backed up.",
      "Our team combines designers, video creators, developers and cloud engineers. We use AI wherever it saves time, and we keep people in the loop wherever judgement matters.",
    ],
    values: [
      {
        title: "Small parts, done properly",
        description: "Clear scope, short cycles, finished work. We would rather ship one solid piece this week than a half-built everything next quarter.",
      },
      {
        title: "Plain language",
        description: "No jargon in proposals or reports. You always know what we're doing, what it costs and why.",
      },
      {
        title: "You own what we build",
        description: "Code, designs, accounts and data are yours. We document everything so you're never locked in.",
      },
      {
        title: "Security from day one",
        description: "Access control, backups and monitoring are part of the build, not an upsell after something breaks.",
      },
    ],
  },

  pillars: [
    {
      id: "create",
      name: "Create",
      line: "Brand, content and campaigns",
      description: "Identity, photography, video and the marketing that puts them in front of the right people.",
    },
    {
      id: "build",
      name: "Build",
      line: "Websites, apps and infrastructure",
      description: "Fast, accessible websites, mobile apps and the cloud setup that keeps them running.",
    },
    {
      id: "automate",
      name: "Automate",
      line: "AI agents and workflows",
      description: "Chatbots, voice agents and automations that handle the repetitive work around the clock.",
    },
  ],

  services: [
    // ── Create ──
    {
      slug: "photography",
      name: "Photography",
      pillar: "create",
      icon: "camera",
      summary: "Product, team and location photography that makes your brand look as good as your work.",
      description:
        "We plan and shoot product catalogues, team portraits, workplace stories and event coverage. Every shoot comes with art direction, professional retouching and files sized for web, social and print.",
      deliverables: ["Shot list and art direction", "On-location or studio shoot", "Colour grading and retouching", "Web, social and print exports", "Usage rights for your channels"],
      idealFor: "New websites, product launches, menus and catalogues, and team pages.",
    },
    {
      slug: "videography",
      name: "Videography",
      pillar: "create",
      icon: "video",
      summary: "Brand films, testimonials and short-form video planned, shot and delivered ready to post.",
      description:
        "From a 60-second brand story to a full product walkthrough, we handle script, storyboard, filming, audio and lighting. You get footage that works on your website, in ads and across social feeds.",
      deliverables: ["Concept and script", "Storyboard and shot plan", "Filming crew and equipment", "Licensed music and sound", "Edits in 16:9, 9:16 and 1:1"],
      idealFor: "Brand launches, customer stories, product demos and recruitment.",
    },
    {
      slug: "graphic-design",
      name: "Graphic Design",
      pillar: "create",
      icon: "pen",
      summary: "Social posts, brochures, pitch decks and ad creatives that stay on brand every time.",
      description:
        "We design the everyday material your business needs: social templates, flyers, presentations, packaging and ad creatives. Everything follows your brand guidelines and comes as editable source files.",
      deliverables: ["Social media templates", "Brochures and flyers", "Pitch and sales decks", "Ad creatives in every size", "Editable source files"],
      idealFor: "Teams that publish often and need a consistent look without an in-house designer.",
    },
    {
      slug: "branding",
      name: "Branding",
      pillar: "create",
      icon: "palette",
      summary: "Names, logos and visual identities with guidelines your whole team can use.",
      description:
        "We start with your audience and positioning, then design a logo system, colour palette, typography and tone of voice. The result is a brand book and asset kit your team and partners can use straight away.",
      deliverables: ["Positioning workshop", "Logo system and icon", "Colour and type palette", "Brand guidelines book", "Stationery and social kit"],
      idealFor: "New businesses, rebrands, and companies whose look has drifted over time.",
    },
    {
      slug: "social-media-management",
      name: "Social Media Management",
      pillar: "create",
      icon: "share",
      summary: "A monthly content plan, design, posting and community replies, handled for you.",
      description:
        "We plan a monthly calendar, design and write every post, schedule it at the right time and reply to comments and messages. A monthly report shows what worked and what we'll change next month.",
      deliverables: ["Monthly content calendar", "Post and reel production", "Scheduling and publishing", "Comment and inbox replies", "Monthly performance report"],
      idealFor: "Businesses that want an active, consistent presence without spending hours a week on it.",
    },
    {
      slug: "digital-marketing",
      name: "Digital Marketing",
      pillar: "create",
      icon: "megaphone",
      summary: "Paid ads, SEO and email campaigns tied to leads and sales you can measure.",
      description:
        "We run Meta and Google ad campaigns, technical and local SEO, and email sequences. Tracking is set up first, so every rupee or dollar spent can be traced to an enquiry or a sale.",
      deliverables: ["Analytics and conversion tracking", "Meta and Google Ads management", "Technical and local SEO", "Email and WhatsApp campaigns", "Monthly ROI reporting"],
      idealFor: "Businesses ready to grow enquiries with a clear monthly budget.",
    },
    {
      slug: "video-editing",
      name: "Video Editing",
      pillar: "create",
      icon: "film",
      summary: "Your raw footage turned into reels, YouTube videos and ads with captions and motion graphics.",
      description:
        "Send us your footage and we'll cut it into finished videos: reels, shorts, YouTube episodes, podcasts and ads. We add captions, colour, sound design and branded motion graphics.",
      deliverables: ["Story edit and pacing", "Captions and subtitles", "Colour correction", "Sound clean-up and music", "Branded intros and lower thirds"],
      idealFor: "Creators, coaches and teams who film regularly but don't have time to edit.",
    },

    // ── Build ──
    {
      slug: "web-design",
      name: "Web Design",
      pillar: "build",
      icon: "layout",
      summary: "Clear, conversion-focused website designs, prototyped and tested before a line of code.",
      description:
        "We map your visitors' journey, write the page structure and design every screen for mobile and desktop. You review a clickable prototype before development starts, so there are no surprises.",
      deliverables: ["Sitemap and user journeys", "Wireframes", "High-fidelity UI design", "Clickable prototype", "Design system for future pages"],
      idealFor: "New websites, redesigns and landing pages for campaigns.",
    },
    {
      slug: "web-development",
      name: "Web Development",
      pillar: "build",
      icon: "code",
      summary: "Fast, secure websites and web apps built with Next.js, connected to your CRM and tools.",
      description:
        "We build marketing sites, portals and custom web apps with modern frameworks. Pages load fast, rank well and are accessible. Forms feed straight into your CRM, and you get documentation and handover.",
      deliverables: ["Responsive front-end build", "CMS or admin panel", "Forms, payments and integrations", "SEO and performance tuning", "Hosting, SSL and handover docs"],
      idealFor: "Businesses that have outgrown page builders or need custom functionality.",
    },
    {
      slug: "mobile-app-development",
      name: "Mobile App Development",
      pillar: "build",
      icon: "smartphone",
      summary: "iOS and Android apps from one codebase, from prototype to store launch.",
      description:
        "We design and build cross-platform apps with Flutter or React Native, connect them to a secure backend and handle App Store and Google Play submission. Updates and support are available after launch.",
      deliverables: ["Product scoping and UX", "Cross-platform app build", "API and backend", "Store listing and submission", "Analytics and crash reporting"],
      idealFor: "Booking, ordering, membership and internal field-team apps.",
    },
    {
      slug: "cloud-devops",
      name: "Cloud & DevOps",
      pillar: "build",
      icon: "cloud",
      summary: "Hosting, CI/CD, backups, monitoring and security hardening for apps that must stay up.",
      description:
        "We set up and look after your infrastructure on AWS, VPS or managed platforms. Deployments become one click, backups are tested, servers are monitored, and access is locked down and logged.",
      deliverables: ["Cloud or VPS setup", "CI/CD pipelines", "Automated, tested backups", "Monitoring and alerts", "Security hardening and access control"],
      idealFor: "Teams running production apps, ERPs or client portals without a DevOps engineer.",
    },

    // ── Automate ──
    {
      slug: "business-automation",
      name: "Business Automation",
      pillar: "automate",
      icon: "workflow",
      summary: "Connect your apps and remove manual steps: invoices, follow-ups, reports and data entry.",
      description:
        "We map how work moves through your business, then automate the repetitive steps with tools like n8n, Make or custom code. Leads get followed up, invoices go out and reports build themselves.",
      deliverables: ["Process mapping workshop", "Workflow automation build", "App and API integrations", "Error alerts and logging", "Team training and docs"],
      idealFor: "Teams copying data between spreadsheets, inboxes and apps every day.",
    },
    {
      slug: "chatbots",
      name: "Chatbots",
      pillar: "automate",
      icon: "message",
      summary: "Website and WhatsApp chatbots that answer questions, qualify leads and book appointments.",
      description:
        "We build chatbots trained on your services, prices and policies. They answer customers instantly, collect lead details into your CRM, book appointments and hand over to a person when needed.",
      deliverables: ["Conversation design", "Knowledge base setup", "Website and WhatsApp channels", "CRM and calendar integration", "Human handover rules"],
      idealFor: "Clinics, schools, real estate, retail and service businesses with repeat questions.",
    },
    {
      slug: "ai-voice-agents",
      name: "AI Voice Agents",
      pillar: "automate",
      icon: "mic",
      summary: "Natural-sounding phone agents that answer calls, book appointments and follow up 24/7.",
      description:
        "Our voice agents pick up inbound calls, answer common questions, take bookings and make reminder or follow-up calls. Every call is transcribed and logged, and urgent calls go to your team.",
      deliverables: ["Call flow and script design", "Voice and language selection", "Phone number setup", "Calendar and CRM integration", "Call transcripts and analytics"],
      idealFor: "Businesses that miss calls after hours or spend hours on reminder calls.",
    },
    {
      slug: "ai-agents",
      name: "AI Agents",
      pillar: "automate",
      icon: "bot",
      summary: "Custom AI agents that research, draft, triage and act inside your tools, with guardrails.",
      description:
        "We design AI agents for specific jobs: triaging support tickets, drafting proposals, researching leads or summarising documents. Each agent has clear permissions, audit logs and human approval where it matters.",
      deliverables: ["Use-case discovery", "Agent design and guardrails", "Tool and data integrations", "Evaluation and testing", "Monitoring and audit logs"],
      idealFor: "Teams with high-volume, repeatable knowledge work.",
    },
  ],

  process: [
    { title: "Discover", description: "A free call to understand your goals, audience and constraints." },
    { title: "Plan", description: "A written scope with deliverables, timeline and a fixed quote." },
    { title: "Build", description: "Short cycles with a review at the end of each one, so you see progress weekly." },
    { title: "Launch", description: "We test, go live, train your team and hand over every file and login." },
    { title: "Improve", description: "Optional monthly care: updates, reports and the next round of improvements." },
  ],

  pricing: {
    heading: "Clear starting prices",
    intro: "Every project gets a fixed quote after a discovery call. These packages show where most projects start.",
    currency: "USD",
    currencyNote: "Prices in USD, excluding taxes, ad spend and third-party subscriptions.",
    plans: [
      {
        id: "launch",
        name: "Launch",
        price: 1200,
        cadence: "one-off, from",
        description: "A custom website that looks right, loads fast and turns visitors into enquiries.",
        features: [
          "Custom design, up to 6 pages",
          "Mobile-first, accessible build",
          "On-page SEO and analytics",
          "Contact form connected to your CRM",
          "30 days of post-launch support",
        ],
        cta: "Start a website project",
      },
      {
        id: "grow",
        name: "Grow",
        price: 900,
        cadence: "per month",
        description: "Consistent social media and marketing, planned and produced for you.",
        features: [
          "Up to 3 social platforms",
          "12 posts and 4 short videos a month",
          "Ad campaign management",
          "Community replies on weekdays",
          "Monthly performance report",
        ],
        cta: "Start growing",
        featured: true,
      },
      {
        id: "automate",
        name: "Automate",
        price: 1500,
        cadence: "one-off, from",
        description: "A chatbot or voice agent that answers customers and books work around the clock.",
        features: [
          "Website, WhatsApp or phone channel",
          "Trained on your services and policies",
          "CRM and calendar integration",
          "Human handover and call logs",
          "60 days of tuning and support",
        ],
        cta: "Automate my enquiries",
      },
    ],
    alwaysIncluded: [
      "A fixed quote before work starts",
      "Weekly progress updates",
      "You own all code, designs and accounts",
      "Documentation and handover",
    ],
    faq: [
      {
        question: "Why do you show starting prices instead of fixed prices?",
        answer: "Every business is different. After a free call we send a fixed quote, and that number doesn't change unless you change the scope.",
      },
      {
        question: "How do payments work?",
        answer: "One-off projects are usually 50% upfront and 50% on launch. Monthly services are billed at the start of each month.",
      },
      {
        question: "Can I cancel a monthly plan?",
        answer: "Yes. Monthly plans run month to month and can be cancelled with 30 days' notice.",
      },
      {
        question: "Do you work with clients outside Pakistan?",
        answer: "Yes. We work remotely with clients worldwide and schedule calls in your time zone.",
      },
    ],
  },

  // TODO: replace with real, approved client quotes and set placeholder to false.
  testimonials: [
    {
      quote: "The voice agent now handles our after-hours calls and books appointments straight into the calendar. Our front desk starts every morning with a clear schedule.",
      name: "Clinic operations lead",
      role: "Healthcare client",
      placeholder: true,
    },
    {
      quote: "They rebuilt our website and connected every form to a CRM. For the first time we can see exactly where our enquiries come from.",
      name: "Managing director",
      role: "Professional services client",
      placeholder: true,
    },
    {
      quote: "One team for our brand, social content and website meant one brief, one invoice and a consistent look everywhere.",
      name: "Founder",
      role: "Food and retail client",
      placeholder: true,
    },
  ],

  // TODO: replace sample projects with real case studies (and set sample to false).
  portfolio: [
    {
      slug: "clinic-voice-agent",
      image: "/brand/project-clinic-voice-agent.jpg",
      title: "After-hours booking line for a dental clinic",
      client: "Dental clinic",
      pillar: "automate",
      services: ["AI Voice Agents", "Business Automation"],
      year: "2026",
      summary: "A voice agent that answers calls outside office hours, books appointments and sends reminders.",
      challenge: "The clinic missed evening and weekend calls, and staff spent the first hour of each day returning voicemails.",
      solution: "We built a voice agent with the clinic's services, prices and booking rules, connected it to their calendar and set up reminder calls the day before each appointment.",
      outcome: "Every call is now answered, bookings land directly in the calendar, and staff review a short summary each morning instead of a voicemail backlog.",
      sample: true,
    },
    {
      slug: "bakery-rebrand",
      image: "/brand/project-bakery-rebrand.jpg",
      title: "Brand refresh and launch content for a home bakery",
      client: "Home bakery",
      pillar: "create",
      services: ["Branding", "Photography", "Social Media Management"],
      year: "2026",
      summary: "A new identity, product photography and a three-month social launch plan.",
      challenge: "A growing bakery with great products but an inconsistent look across packaging, Instagram and delivery apps.",
      solution: "We designed a logo system and packaging labels, shot the full menu and produced a content calendar with reels for the launch.",
      outcome: "One recognisable look across every channel and a library of photos the team reuses for menus and listings.",
      sample: true,
    },
    {
      slug: "logistics-portal",
      image: "/brand/project-logistics-portal.jpg",
      title: "Customer portal for a logistics company",
      client: "Logistics company",
      pillar: "build",
      services: ["Web Design", "Web Development", "Cloud & DevOps"],
      year: "2025",
      summary: "A secure portal where customers track shipments, download invoices and raise requests.",
      challenge: "Customers called and emailed for every status update, and invoices were sent manually each week.",
      solution: "We designed and built a Next.js portal connected to the company's ERP, with role-based access, automated invoice delivery and monitored hosting.",
      outcome: "Customers serve themselves for tracking and invoices, and the operations team handles exceptions instead of routine questions.",
      sample: true,
    },
    {
      slug: "real-estate-chatbot",
      image: "/brand/project-real-estate-chatbot.jpg",
      title: "WhatsApp lead assistant for a real-estate agency",
      client: "Real-estate agency",
      pillar: "automate",
      services: ["Chatbots", "Digital Marketing"],
      year: "2025",
      summary: "A WhatsApp chatbot that qualifies ad leads and books property viewings.",
      challenge: "Ad campaigns generated hundreds of WhatsApp messages a week, and agents couldn't reply fast enough.",
      solution: "We built a chatbot that asks budget, location and timing questions, shares matching listings and books viewings into the agents' calendars.",
      outcome: "Leads get an instant reply, and agents only speak to buyers who are ready for a viewing.",
      sample: true,
    },
    {
      slug: "fitness-studio-launch",
      image: "/brand/project-fitness-studio-launch.jpg",
      title: "Launch campaign for a boutique fitness studio",
      client: "Fitness studio",
      pillar: "create",
      services: ["Videography", "Video Editing", "Digital Marketing"],
      year: "2025",
      summary: "A brand film, short-form ads and a landing page for opening month.",
      challenge: "A new studio needed founding members before opening day, with a modest ad budget.",
      solution: "We filmed a short brand story and class clips, cut them into vertical ads and built a landing page with a founding-member offer.",
      outcome: "A complete launch kit the studio still uses for seasonal campaigns.",
      sample: true,
    },
    {
      slug: "school-app",
      image: "/brand/project-school-app.jpg",
      title: "Parent app for a school network",
      client: "School network",
      pillar: "build",
      services: ["Mobile App Development", "AI Agents"],
      year: "2025",
      summary: "An Android and iOS app for attendance, progress reports and announcements.",
      challenge: "Parents received updates through scattered WhatsApp groups and paper notes.",
      solution: "We built a Flutter app with secure parent logins, progress reports and an AI assistant that answers common questions about fees and schedules.",
      outcome: "One official channel for every campus, with announcements and reports in parents' pockets.",
      sample: true,
    },
  ],

  contactForm: {
    heading: "Let's talk about your project",
    intro: "Tell us a little about what you need. We'll reply within one working day with next steps or a time for a call.",
    budgets: ["Under $1,000", "$1,000 – $3,000", "$3,000 – $10,000", "$10,000+", "Not sure yet"],
    successMessage: "Thanks, your message has reached us. We'll reply within one working day.",
  },

  // TODO: have this reviewed by a qualified lawyer for your jurisdiction before launch.
  privacy: {
    lastUpdated: "21 October 2026",
    intro:
      "This policy explains what personal data Lynix Lab collects through this website, why we collect it, and the choices you have. We collect as little as we need to respond to you and run our services.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "Contact form: your name, email address, and optionally your phone number, company, service of interest, budget range and message.",
          "Technical data: your IP address and browser user agent, recorded with form submissions to prevent spam and abuse.",
          "Cookies: this website does not use advertising or tracking cookies. Our team's CRM uses a strictly necessary session cookie to keep staff signed in.",
        ],
      },
      {
        heading: "How we use your information",
        body: [
          "To reply to your enquiry and provide quotes or services you request.",
          "To keep records of our conversations and agreements in our customer relationship management (CRM) system.",
          "To protect the website from spam, fraud and abuse.",
          "We do not sell your personal data, and we do not use it for automated decisions that affect you legally.",
        ],
      },
      {
        heading: "Legal basis",
        body: [
          "We process enquiry data because you asked us to (steps prior to a contract) and because we have a legitimate interest in responding to business enquiries and securing our systems. Where required, we ask for your consent.",
        ],
      },
      {
        heading: "Sharing and processors",
        body: [
          "We use trusted providers to host this website and our database. They process data only on our instructions and under appropriate data-protection terms.",
          "We may disclose information if required by law or to protect our rights.",
        ],
      },
      {
        heading: "How long we keep data",
        body: [
          "Enquiries that don't become projects are deleted or anonymised within 24 months. Client records are kept for as long as needed for the contract and legal obligations such as tax records.",
        ],
      },
      {
        heading: "Security",
        body: [
          "Data is transmitted over HTTPS and stored in a protected database. CRM access requires an individual login, permissions are role-based, and access to records is logged.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask to access, correct or delete your personal data, object to processing, or ask us to restrict it. Email us and we'll respond within 30 days.",
        ],
      },
      {
        heading: "Contact",
        body: ["Questions about this policy or your data: email hello@lynixlab.com."], // TODO: keep in sync with contact.email
      },
    ],
  },
};

/** Helpers so components don't repeat lookups. */
export const getService = (slug: string) => siteConfig.services.find((s) => s.slug === slug);
export const getServicesByPillar = (pillar: string) => siteConfig.services.filter((s) => s.pillar === pillar);
export const getProject = (slug: string) => siteConfig.portfolio.find((p) => p.slug === slug);
export const getPillar = (id: string) => siteConfig.pillars.find((p) => p.id === id);
export const activeSocialLinks = () => siteConfig.social.filter((s) => s.href.trim() !== "");
