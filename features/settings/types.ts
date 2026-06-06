export interface SettingPhone {
  label: string;
  number: string;
  type: "phone" | "whatsapp";
}

export interface SettingOffice {
  id: number;
  title: string;
  address: string;
}

export interface SettingSocialMedia {
  platform: string;
  link: string;
}

export interface SettingSeo {
  page_key: string;
  page_name: string;
  meta_title: string;
  meta_description: string;
}

export interface SettingsFooterCountry {
  id: number;
  name: string | { ar: string; en: string };
  image?: string | null;
  image_alt?: string | null;
}

export interface SettingsFooterService {
  id: number;
  slug: string;
  slug_local?: { ar?: string; en?: string };
  title: string;
  highlight_description?: string;
  meta_title?: string;
  image_alt?: string | null;
  sort_order?: number;
  countries: SettingsFooterCountry[];
}

export interface SettingsData {
  general: {
    site_name: string;
    site_description: string;
    /** Home page meta from general settings (fallback if `seo` has no `home` row). */
    home_meta_title?: string | null;
    home_meta_description?: string | null;
    logo: string;
    favicon: string;
    timezone: string;
    default_language: string;
  };
  contact: {
    email: string;
    phones: SettingPhone[];
    /** WhatsApp / phone for course enrollment (from dashboard settings). */
    courses_phone?: string | null;
    address_ar?: string | null;
    address_en?: string | null;
  };
  offices: SettingOffice[];
  working_hours: {
    from_day: string;
    to_day: string;
    from_hour: string;
    to_hour: string;
    show_on_site: boolean;
  };
  social_media: SettingSocialMedia[];
  seo: SettingSeo[];
  scripts?: ScriptsData;
  footer?: {
    services?: SettingsFooterService[];
  };
}

export interface SettingsResponse {
  status: string;
  message: string;
  data: SettingsData;
}

export interface ScriptsData {
  custom_head_scripts: string | null;
  custom_body_scripts: string | null;
  robots_txt: string | null;
}

export interface ScriptsResponse {
  status: string;
  message: string;
  data: ScriptsData;
}
