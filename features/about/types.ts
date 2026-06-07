export interface AboutUsResponse {
  status: string;
  message: string;
  data: AboutUsData;
}

export interface AboutUsData {
  id: number;
  title: string;
  description: string;
  image: string;
  video_url: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
  vision_sections: VisionSection[];
  sections: AboutSection[];
  info_sections: InfoSection[];
  contact_sections: ContactSection[];
  why_us_sections: WhyUsSection[];
  who_we_are_sections?: WhoWeAreSection[];
  created_at: string;
}

export interface VisionSection {
  id: number;
  vision_title: string;
  vision_description: string;
  message_title: string;
  message_description: string;
  vision_image: string;
  message_image: string;
}

export interface AboutSection {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface InfoSection {
  id: number;
  title: string;
  description: string;
}

export interface ContactSection {
  id: number;
  title: string;
  description: string;
  phone: string;
}

export interface WhyUsSection {
  id: number;
  title: string;
  description: string;
  values_title: string;
  values_description: string;
  image: string;
}

export interface WhoWeAreSection {
  id: number;
  title: string;
  description: string;
}