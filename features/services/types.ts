import type { Accreditation } from "@/features/home/types";

/** Country as returned by GET /v1/countries — name is already a localized plain string */
export interface Country {
  id: number;
  name: string;
  image: string;
  is_active: boolean;
}

/** Country as embedded inside a Service or SingleService — name is a localized object */
export interface ServiceCountry {
  id: number;
  name: { ar: string; en: string };
  image: string;
  is_active: boolean;
}

export interface Service {
  id: number;
  slug: string;
  slug_local?: { ar?: string; en?: string };
  image: string;
  image_alt?: string | null;
  title: string;
  subtitle: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  highlight_description: string;
  media_url: string;
  media_type: string;
  meta_title: string;
  meta_description: string;
  countries: ServiceCountry[];
  created_at: string;
}

/** Paginated list payload inside API `data` for GET /v1/services */
export interface ServicesListPayload {
  data: Service[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/** Raw JSON from GET /v1/services */
export interface GetServicesApiRaw {
  status: string;
  message: string;
  data: ServicesListPayload;
}

/** Normalized response from `getServices()` (inner list unwrapped) */
export interface GetServicesResponse {
  status: string;
  message: string;
  data: Service[];
  meta?: ServicesListPayload["meta"];
}
        
export type Benefits = {
  id: number;
  title: string;
  description: string;
  image: string;
  image_alt?: string | null;
  is_active: boolean;
  sort_order?: number;
  link?: string | null;
};

export type SectionItem = {
  title: string;
  description: string;
  sort_order?: string;
  /** Per-card link (not the whole section). */
  link?: string | null;
  /** Optional Lucide icon key — see `section-card-icons.ts`. */
  icon?: string | null;
};

// 🔹 Offerings / Steps
export type Section = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  image_alt?: string | null;
  items: SectionItem[] | null;
  sort_order?: number;
  link?: string | null;
};

export type ServicePackageItem = {
  title: string;
  descriptionHtml: string;
  descriptionPlain: string;
  features: string[];
  price: string | null;
  currency: string | null;
  sortOrder: number;
  icon: "rocket" | "gem" | "target";
  isFeatured: boolean;
  image: string | null;
  imageAlt?: string | null;
  /** When set, clicking the package card navigates here. */
  link?: string | null;
};

export type ServicePackagesSection = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  image_alt?: string | null;
  items: ServicePackageItem[];
  sort_order?: number;
  link?: string | null;
};

export type ServiceSocial = {
  open_graph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    site_name?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
};

// 🔹 Tools
export type Tools = {
  id: number
  title: string
  description: string
  sub_title: string | null
  sub_description: string | null
  is_active: boolean
  sort_order?: number
  link?: string | null
}

// 🔹 FAQ Item
export type FaqItem = {
  question: string
  answer: string
  /** When set, the FAQ row is clickable (no accordion). */
  link?: string | null
}

// 🔹 FAQs
export type Faqs = {
  id: number
  title: string
  description: string
  items: FaqItem[]
  sort_order?: number
  link?: string | null
}

/** Service وسم — same shape as public blog tags. */
export type ServiceArticleTag = {
  label: string;
  index: boolean;
  follow: boolean;
};

// 🔹 CTA
export type Cta = {
  id: number
  title: string
  description: string
  button_text: string | null
  phone_number: string
  sort_order?: number
  link?: string | null
}

export type ServiceClientPortfolioItem = {
  id: number;
  sortOrder: number;
  category: string;
  clientTag: string;
  headline: string;
  period: string;
  client: string;
  challenge: string;
  whatWeDid: string;
  results: string;
  metrics: string[];
  image: string;
  imageAlt: string | null;
  caseStudyLink: { href: string; external: boolean } | null;
  readCaseStudyButtonText: string | null;
};

export type ServiceClientPortfolio = {
  id: number;
  title: string;
  subtitle: string;
  sort_order?: number;
  viewAllLink: { href: string; external: boolean } | null;
  viewAllButtonText: string | null;
  viewAllCard: {
    title: string;
    description: string;
    buttonText: string | null;
    link: { href: string; external: boolean } | null;
  } | null;
  defaultReadCaseStudyText: string | null;
  items: ServiceClientPortfolioItem[];
};

export type ServicePageSectionKey =
  | "benefits"
  | "offerings"
  | "steps"
  | "tools"
  | "clientPortfolio"
  | "faqs"
  | "packages"
  | "articleTags"
  | "ctas";

export type ServicePageSectionInstance = {
  key: ServicePageSectionKey;
  index: number;
  sort_order: number;
  data:
    | Benefits
    | Section
    | Faqs
    | Tools
    | Cta
    | ServicePackagesSection
    | ServiceClientPortfolio
    | ServiceArticleTag[];
};

// 🔹 Main Service Type
export type SingleService = {
  id: number;
  slug: string;
  slug_local?: { ar?: string; en?: string };
  image: string;
  image_alt?: string | null;
  title: string;
  /** Hero on detail page only; empty → use `title`. */
  singlePageTitle: string;
  pageScript: string | null;
  subtitle: string;
  description: string;
  inside_desc: string;
  sort_order: number;
  show_footer?: boolean;
  highlight_description: string;

  media_url: string | null;
  media_type: string;

  meta_title: string;
  meta_description: string;
  social?: ServiceSocial | null;

  /**
   * All page blocks in display order (`sort_order` from API).
   * Source of truth for rendering — supports multiple blocks per type.
   */
  pageSections: ServicePageSectionInstance[];

  benefits: Benefits | null;
  audits: unknown | null;

  offerings: Section | null;
  steps: Section | null;

  tools: Tools | null;
  faqs: Faqs | null;

  packages: ServicePackagesSection | null;
  ctas: Cta | null;

  /** Article tags — each links to `/blogs/tag/{label}`. */
  articleTags: ServiceArticleTag[];

  countries: ServiceCountry[];

  /** Per-service accreditations block from API `our_accreditations`. */
  ourAccreditations?: Accreditation | null;

  /** Per-service client logos block from API `our_clients` / `partners`. */
  ourClients?: Accreditation | null;

  /** @deprecated Use `pageSections` */
  clientPortfolio?: ServiceClientPortfolio | null;

  created_at: string;
};


export interface GetSingleServiceResponse {
    status: string,
    message: string,
    data: SingleService
}
