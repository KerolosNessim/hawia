import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type {
  PromoBannerSlideApi,
  PromoBannersPayloadApi,
  PromoBannersSectionApi,
} from "@/features/home/types/promo-banners";
import type { PromoBannerSlide } from "@/features/home/types/promo-banners";
import { pickLocalizedField } from "@/features/services/lib/pick-localized-field";
import { apiClient } from "@/lib/api";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { homeCountryQuery } from "../lib/country-query";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pickLocaleText(field: unknown, locale: Locale): string {
  return pickLocalizedField(field, locale).trim();
}

function pickLocaleMap(row: Record<string, unknown>, key: string): { ar?: string | null; en?: string | null } {
  const raw = row[key];
  if (raw == null) return { ar: null, en: null };
  if (typeof raw === "string") return { ar: raw, en: raw };
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    return {
      ar: typeof o.ar === "string" ? o.ar : o.ar == null ? null : String(o.ar),
      en: typeof o.en === "string" ? o.en : o.en == null ? null : String(o.en),
    };
  }
  return { ar: null, en: null };
}

function normalizeSection(row: Record<string, unknown>): PromoBannersSectionApi {
  const section = asRecord(row.section) ?? row;
  return {
    eyebrow: pickLocaleMap(section, "eyebrow"),
    title: pickLocaleMap(section, "title"),
    subtitle: pickLocaleMap(section, "subtitle"),
  };
}

function normalizeSlide(raw: unknown, index: number): PromoBannerSlideApi | null {
  const row = asRecord(raw);
  if (!row) return null;

  const isActive = row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true;
  if (!isActive) return null;

  return {
    id: Number(row.id ?? index),
    sort_order: Number(row.sort_order ?? index),
    is_active: true,
    badge: pickLocaleMap(row, "badge"),
    title: pickLocaleMap(row, "title"),
    subtitle: pickLocaleMap(row, "subtitle"),
    description: pickLocaleMap(row, "description"),
    button_text: pickLocaleMap(row, "button_text"),
    button_link: pickLocaleMap(row, "button_link"),
    image: pickLocaleMap(row, "image"),
    image_alt: pickLocaleMap(row, "image_alt"),
  };
}

function extractPayload(raw: unknown): PromoBannersPayloadApi | null {
  const rec = asRecord(raw);
  if (!rec) return null;

  const data = asRecord(rec.data) ?? rec;
  const slidesRaw = Array.isArray(data.slides) ? data.slides : [];

  const slides = slidesRaw
    .map((item, i) => normalizeSlide(item, i))
    .filter((s): s is PromoBannerSlideApi => s != null)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  return {
    section: normalizeSection(data),
    slides,
  };
}

function mapSlideToUi(slide: PromoBannerSlideApi, locale: Locale): PromoBannerSlide {
  const imageRaw = pickLocaleText(slide.image, locale);
  const image = imageRaw ? resolveMediaUrl(imageRaw) : "";

  return {
    id: String(slide.id),
    badge: pickLocaleText(slide.badge, locale),
    title: pickLocaleText(slide.title, locale),
    subtitle: pickLocaleText(slide.subtitle, locale),
    description: pickLocaleText(slide.description, locale),
    buttonText: pickLocaleText(slide.button_text, locale),
    buttonLink: pickLocaleText(slide.button_link, locale),
    image,
    imageAlt: pickLocaleText(slide.image_alt, locale),
  };
}

export type ResolvedHomePromoBanners = {
  sectionLabel: string;
  sectionEyebrow: string;
  sectionTitle: string;
  sectionSubtitle: string;
  slides: PromoBannerSlide[];
};

function hasVisibleSectionHeader(section: PromoBannersSectionApi, locale: Locale): boolean {
  return ["eyebrow", "title", "subtitle"].some((key) => {
    const text = plainTextFromHtml(pickLocaleText(section[key as keyof PromoBannersSectionApi], locale));
    return Boolean(text);
  });
}

/** Public home carousel from `GET /v1/home/promo-banners`. */
export async function getHomePromoBanners(
  locale: Locale,
  countryId?: number,
): Promise<ResolvedHomePromoBanners | null> {
  const query = homeCountryQuery(countryId);
  try {
    const raw = await apiClient.get<unknown>("/v1/home/promo-banners", {
      query: query ?? undefined,
    });
    const payload = extractPayload(raw);
    if (!payload?.slides.length) return null;

    const t = await getTranslations({ locale, namespace: "homePromoBanners" });
    const section = payload.section;
    const showSection = hasVisibleSectionHeader(section, locale);

    return {
      sectionLabel: t("sectionLabel"),
      sectionEyebrow: showSection ? pickLocaleText(section.eyebrow, locale) : "",
      sectionTitle: showSection ? pickLocaleText(section.title, locale) : "",
      sectionSubtitle: showSection ? pickLocaleText(section.subtitle, locale) : "",
      slides: payload.slides.map((s) => mapSlideToUi(s, locale)),
    };
  } catch {
    return null;
  }
}

/** API data with next-intl fallback for home `PromoBannersSlider`. */
export async function resolveHomePromoBanners(
  locale: Locale,
  countryId?: number,
): Promise<ResolvedHomePromoBanners | null> {
  const fromApi = await getHomePromoBanners(locale, countryId);
  if (fromApi?.slides.length) return fromApi;

  const t = await getTranslations({ locale, namespace: "homePromoBanners" });
  const slides = t.raw("slides") as PromoBannerSlide[];
  if (!slides?.length) return null;

  return {
    sectionLabel: t("sectionLabel"),
    sectionEyebrow: t("sectionEyebrow"),
    sectionTitle: t("sectionTitle"),
    sectionSubtitle: t("sectionSubtitle"),
    slides,
  };
}
