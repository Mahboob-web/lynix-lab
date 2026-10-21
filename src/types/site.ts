/**
 * Types for the central site configuration (src/config/site.ts).
 * Change content in site.ts — change these types only when you add new fields.
 */

export type PillarId = "create" | "build" | "automate";

export type IconName =
  | "camera"
  | "video"
  | "pen"
  | "palette"
  | "share"
  | "megaphone"
  | "film"
  | "layout"
  | "code"
  | "smartphone"
  | "workflow"
  | "message"
  | "mic"
  | "bot"
  | "cloud";

export interface NavItem {
  label: string;
  href: string;
}

export interface Pillar {
  id: PillarId;
  name: string;
  /** One line shown under the pillar name. */
  line: string;
  description: string;
}

export interface Service {
  slug: string;
  name: string;
  pillar: PillarId;
  icon: IconName;
  /** One sentence for cards and meta descriptions (≤ 160 chars). */
  summary: string;
  description: string;
  deliverables: string[];
  idealFor: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** true = sample copy. A "Sample" tag is shown until you replace it with a real, approved quote. */
  placeholder?: boolean;
}

export interface Project {
  slug: string;
  title: string;
  client: string;
  pillar: PillarId;
  services: string[];
  year: string;
  summary: string;
  challenge: string;
  solution: string;
  outcome: string;
  /** Optional cover image in /public (e.g. "/portfolio/clinic.jpg"). A generated block cover is used if omitted. */
  image?: string;
  /** true = illustrative project. A "Sample project" tag is shown until replaced with a real case study. */
  sample?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface Value {
  title: string;
  description: string;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  keywords: string[];
  brand: {
    colors: {
      graphite: string;
      lime: string;
      ivory: string;
      gray: string;
      white: string;
      muted: string;
    };
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    location: string;
    hours: string;
    responseTime: string;
  };
  primaryCta: NavItem;
  secondaryCta: NavItem;
  navigation: NavItem[];
  footerNavigation: { title: string; items: NavItem[] }[];
  social: SocialLink[];
  home: {
    headline: [string, string];
    intro: string;
    servicesHeading: string;
    servicesIntro: string;
    processHeading: string;
    workHeading: string;
    testimonialsHeading: string;
    ctaHeading: string;
    ctaText: string;
  };
  about: {
    heading: string;
    intro: string;
    story: string[];
    values: Value[];
  };
  pillars: Pillar[];
  services: Service[];
  process: ProcessStep[];
  pricing: {
    heading: string;
    intro: string;
    currencyNote: string;
    plans: PricingPlan[];
    alwaysIncluded: string[];
    faq: FaqItem[];
  };
  testimonials: Testimonial[];
  portfolio: Project[];
  contactForm: {
    heading: string;
    intro: string;
    budgets: string[];
    successMessage: string;
  };
  privacy: {
    lastUpdated: string;
    intro: string;
    sections: LegalSection[];
  };
}
