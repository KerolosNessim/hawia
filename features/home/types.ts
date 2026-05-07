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
}

export interface AccreditationImage {
  id: number;
  url: string;
}

export interface Accreditation {
  id: number;
  title: string;
  description: string;
  images: AccreditationImage[];
}

export interface PartnerImage {
  id: number;
  url: string;
}

export interface Partner {
  id: number;
  title: string;
  description: string;
  images: PartnerImage[];
  link: string | null;
  seo: HeroSEO;
}

export interface LandingPageData {
  hero: Hero;
  accreditation: Accreditation;
  partners: Partner[];
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
    image: string;
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
export interface StepsResponse {
    status: string | boolean,
    message: string,
    data:SolutionSingleItem[],
}
  