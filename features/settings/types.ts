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

export interface SettingsData {
  general: {
    site_name: string;
    site_description: string;
    logo: string;
    favicon: string;
    timezone: string;
    default_language: string;
  };
  contact: {
    email: string;
    phones: SettingPhone[];
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
