
export interface Country {
  id: number;
  name: string;
  image: string;
  is_active: boolean;
}
export interface Service {
            id: number,
            slug: string,
            image: string,
            title: string,
            description: string,
            sort_order: number,
            is_active: boolean,
            highlight_description: string,
            media_url: string,
            media_type: string,
            meta_title: string,
            meta_description: string,
            countries : Country[],
            created_at: string
        }

        export interface GetServicesResponse {
    status: "true",
    message: string,
    data: Service[]
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

  countries: Country[]

  created_at: string
}


export interface GetSingleServiceResponse {
    status: string,
    message: string,
    data: SingleService
}