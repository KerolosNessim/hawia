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
  image: string;
  title: string;
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
  id: number
  title: string
  description: string
  image: string
  is_active: boolean
}

// 🔹 Offerings / Steps (نفس الشكل)
export type Section = {
  id: number
  title: string
  description: string
  image: string | null
  items: unknown[] | null
}

// 🔹 Tools
export type Tools = {
  id: number
  title: string
  description: string
  sub_title: string | null
  sub_description: string | null
  is_active: boolean
}

// 🔹 FAQ Item
export type FaqItem = {
  question: string
  answer: string
}

// 🔹 FAQs
export type Faqs = {
  id: number
  title: string
  description: string
  items: FaqItem[]
}

// 🔹 CTA
export type Cta = {
  id: number
  title: string
  description: string
  button_text: string | null
  phone_number: string
}

// 🔹 Main Service Type
export type SingleService = {
  id: number
  slug: string
  image: string
  title: string
  description: string
  sort_order: number
  is_active: boolean
  highlight_description: string

  media_url: string | null
  media_type: string

  meta_title: string
  meta_description: string

  benefits: Benefits | null
  audits: unknown | null

  offerings: Section | null
  steps: Section | null

  tools: Tools | null
  faqs: Faqs | null

  packages: unknown | null
  ctas: Cta | null

  countries: ServiceCountry[]

  created_at: string
}


export interface GetSingleServiceResponse {
    status: string,
    message: string,
    data: SingleService
}