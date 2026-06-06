export type LocaleMap = { ar?: string | null; en?: string | null };

export type PromoBannerSlideApi = {
  id: number;
  sort_order: number;
  is_active: boolean;
  badge: LocaleMap;
  title: LocaleMap;
  subtitle: LocaleMap;
  description: LocaleMap;
  button_text: LocaleMap;
  button_link: LocaleMap;
  image: LocaleMap;
  image_alt: LocaleMap;
};

export type PromoBannersSectionApi = {
  eyebrow: LocaleMap;
  title: LocaleMap;
  subtitle: LocaleMap;
};

export type PromoBannersPayloadApi = {
  section: PromoBannersSectionApi;
  slides: PromoBannerSlideApi[];
};

/** Mapped slide for `PromoBannersSlider` (active locale). */
export type PromoBannerSlide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  imageAlt: string;
  /** Optional Tailwind gradient classes for slide background */
  themeClass?: string;
};
