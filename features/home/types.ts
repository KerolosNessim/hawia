export interface HeroContent {
  title: string;
  description: string;
  sub_description: string;
}

export interface HeroMedia {
  image: string;
  images: string[];
  video_url: string;
}

export interface HeroSEO {
  meta_title: string | null;
  meta_description: string | null;
}

export interface HeroStatContent {
  title: string;
  number: string;
  description: string;
}

export interface HeroStat {
  id: number;
  sort_order: number;
  content: HeroStatContent;
  media?: unknown[];
  cta?: unknown[];
  stats?: unknown[];
  seo?: unknown[];
}

export interface Hero {
  id: number;
  slug: string;
  content: HeroContent;
  media: HeroMedia;
  phone: string;
  stats: HeroStat[];
  seo: HeroSEO;
  country_id?: number;
}

export interface AccreditationImage {
  id: number;
  url: string;
  image_alt?: string | { ar?: string | null; en?: string | null } | null;
  service_ids?: number[];
  services?: {
    id: number;
    slug?: string | null;
    slug_local?: { ar?: string | null; en?: string | null } | null;
    title?: string | { ar?: string | null; en?: string | null } | null;
  }[];
}

export interface Accreditation {
  id: number;
  title: string;
  description: string;
  images: AccreditationImage[];
}

export interface AccreditationResponse {
  status: string | boolean;
  message: string;
  data: Accreditation;
}

export interface PartnerImage {
  id: number;
  url: string;
  image_alt?: string | { ar?: string | null; en?: string | null } | null;
  service_ids?: number[];
  services?: AccreditationImage["services"];
}

export interface Partner {
  id: number;
  title: string;
  description: string;
  images: PartnerImage[];
  link: string | null;
  seo: HeroSEO;
}

export interface PartnersPaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PartnersResponse {
  status: string | boolean;
  message: string;
  data: {
    data: Partner[];
    meta: PartnersPaginatedMeta;
  };
}

export interface LandingPageData {
  hero?: Hero;
  accreditation?: Accreditation;
  partners?: Partner[] | { data?: Partner[] };
}

export interface LandingPageResponse {
  status: string | boolean;
  message: string;
  data: LandingPageData;
}


export interface WhyUsContent {
    title: string;
    description: string;
}

export interface WhyUsMedia {
    image?: string | { ar?: string; en?: string } | null;
    images?: { ar?: string; en?: string } | null;
    image_alt?: { ar?: string | null; en?: string | null } | string | null;
}

export interface WhyUsGalleryImage {
    id: number;
    url: string;
    image_alt?: { ar?: string | null; en?: string | null } | string | null;
}

export interface WhyUsItem {
    id: number;
    content: WhyUsContent;
    media: WhyUsMedia;
}

export interface WhyUsSeo {
    meta_title: string | null;
    meta_description: string | null;
}

export interface WhyUsData {
    id: number;
    slug: string;
    content: WhyUsContent;
    media?: WhyUsMedia;
    images?: WhyUsGalleryImage[];
    items: WhyUsItem[];
    seo: WhyUsSeo;
}

export interface WhyUsResponse {
    status: string | boolean;
    message: string;
    data: WhyUsData;
}
        

export interface SolutionSingleItem {
    id: number,
    slug: string | null,
    slug_local?: { ar?: string | null; en?: string | null } | null,
    title?: string,
    description?: string,
    content: {
        title: string,
        description: string
    },
    image: string,
    images: string[],
    seo: {
        meta_title: string | null,
        meta_description: string | null
    }
}

export interface AdsResponse {
    status: string | boolean,
    message: string,
    data: {
        id: number,
        content: {
            title: string,
            description: string
        },
        singles: SolutionSingleItem[],
    }
}
/** After `getStepsData`, `data` is always a list (normalized from the API envelope). */
export interface StepsResponse {
  status: string | boolean;
  message: string;
  data: SolutionSingleItem[];
}
export interface TestimonialItem {
    id: number;
    content: {
        name: string;
        job_title: string;
        content: string;
    };
    image: string;
    rate: number;
    sort_order: number;
    seo: {
        meta_title: string | null;
        meta_description: string | null;
    };
}

export interface TestimonialsData {
    id: number;
    content: {
        title: string;
        description: string;
    };
    testimonials: TestimonialItem[];
}

export interface TestimonialsResponse {
    status: string | boolean;
    message: string;
    data: TestimonialsData;
}

export interface FaqItem {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
}

export interface FaqData {
    id: number;
    title: string;
    description: string;
    meta_title: string | null;
    meta_description: string | null;
    items: FaqItem[];
    is_active: boolean;
    created_at: string;
}

export interface FaqResponse {
    status: string | boolean;
    message: string;
    data: FaqData;
}
