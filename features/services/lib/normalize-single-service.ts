import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { pickImageAlt } from "@/lib/image-alt";
import { buildPageSections } from "./collect-page-sections";
import type {
  Benefits,
  Cta,
  FaqItem,
  Faqs,
  Section,
  ServiceArticleTag,
  ServicePackagesSection,
  ServicePackageItem,
  ServicePageSectionInstance,
  ServicePageSectionKey,
  ServiceSocial,
  Tools,
  SingleService,
} from "../types";

/** First block of a given type in display order (for legacy single-field accessors). */
function firstPageSectionData<T>(
  pageSections: ServicePageSectionInstance[],
  key: ServicePageSectionKey,
): T | null {
  const hit = pageSections.find((section) => section.key === key);
  return hit ? (hit.data as T) : null;
}

const PACKAGE_ICONS = ["rocket", "gem", "target"] as const;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pickLoc(field: unknown, locale: string): string {
  if (field == null) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && !Array.isArray(field)) {
    const o = field as Record<string, unknown>;
    const key = locale.startsWith("ar") ? "ar" : "en";
    const primary = o[key];
    if (typeof primary === "string" && primary.trim()) return primary.trim();
    const fallback = o.en ?? o.ar;
    if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
  }
  return "";
}

function parseSection(raw: unknown, locale: string): Section | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const items = Array.isArray(o.items)
    ? o.items
        .map((item) => {
          const row = item as Record<string, unknown>;
          return {
            title: String(row.title ?? ""),
            description: String(row.description ?? ""),
            sort_order: String(row.sort_order ?? "0"),
          };
        })
        .sort(
          (a, b) =>
            Number.parseInt(a.sort_order, 10) - Number.parseInt(b.sort_order, 10),
        )
    : null;
  const blockSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: String(o.title ?? ""),
    description: String(o.description ?? ""),
    image: typeof o.image === "string" ? o.image : null,
    image_alt: pickImageAlt(o.image_alt, locale) || null,
    items,
    sort_order: Number.isFinite(blockSort) && blockSort > 0 ? blockSort : undefined,
  };
}

function parsePackageItems(raw: unknown, locale: string): ServicePackageItem[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const section = raw as Record<string, unknown>;
  const rows = Array.isArray(section.items) ? section.items : [];
  const parsed = rows
    .map((item, idx) => {
      const o = item as Record<string, unknown>;
      const title = String(o.title ?? "").trim();
      if (!title) return null;
      const descHtml = typeof o.description === "string" ? o.description : "";
      const features = Array.isArray(o.features)
        ? o.features.filter((f): f is string => typeof f === "string" && f.trim())
        : [];
      const sortOrder = Number.parseInt(String(o.sort_order ?? idx), 10);
      return {
        title,
        descriptionHtml: descHtml,
        descriptionPlain: stripHtml(descHtml),
        features,
        price: o.price != null && String(o.price).trim() ? String(o.price).trim() : null,
        currency: typeof o.currency === "string" && o.currency.trim() ? o.currency.trim() : null,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : idx,
        imageAlt: pickLoc(o.image_alt, locale) || null,
      };
    })
    .filter((x): x is Omit<ServicePackageItem, "icon" | "isFeatured"> => x != null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const featuredIndex = parsed.length >= 3 ? 1 : parsed.length === 2 ? 1 : -1;

  return parsed.map((p, i) => ({
    ...p,
    icon: PACKAGE_ICONS[i % PACKAGE_ICONS.length],
    isFeatured: i === featuredIndex,
  }));
}

function parsePackages(raw: unknown, locale: string): ServicePackagesSection | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const items = parsePackageItems(raw, locale);
  if (!items.length && !o.title) return null;
  const blockSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: String(o.title ?? "").trim(),
    description: String(o.description ?? "").trim(),
    image: typeof o.image === "string" ? o.image : null,
    image_alt: pickImageAlt(o.image_alt, locale) || null,
    items,
    sort_order: Number.isFinite(blockSort) && blockSort > 0 ? blockSort : undefined,
  };
}

function parseSocial(raw: unknown): ServiceSocial | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const og =
    o.open_graph && typeof o.open_graph === "object"
      ? (o.open_graph as Record<string, unknown>)
      : null;
  const tw =
    o.twitter && typeof o.twitter === "object" ? (o.twitter as Record<string, unknown>) : null;
  return {
    open_graph: og
      ? {
          title: typeof og.title === "string" ? og.title : undefined,
          description: typeof og.description === "string" ? og.description : undefined,
          image: typeof og.image === "string" ? resolveMediaUrl(og.image) : undefined,
          type: typeof og.type === "string" ? og.type : undefined,
          site_name: typeof og.site_name === "string" ? og.site_name : undefined,
        }
      : undefined,
    twitter: tw
      ? {
          card: typeof tw.card === "string" ? tw.card : undefined,
          title: typeof tw.title === "string" ? tw.title : undefined,
          description: typeof tw.description === "string" ? tw.description : undefined,
          image: typeof tw.image === "string" ? resolveMediaUrl(tw.image) : undefined,
        }
      : undefined,
  };
}

function parseArticleTags(raw: unknown): ServiceArticleTag[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: ServiceArticleTag[] = [];
  for (const item of raw) {
    let label = "";
    if (typeof item === "string") label = item.trim();
    else if (item && typeof item === "object" && !Array.isArray(item)) {
      const o = item as Record<string, unknown>;
      label = String(o.name ?? o.title ?? o.label ?? o.tag ?? "").trim();
    }
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label });
  }
  return out;
}

function parseBenefitsBlock(
  o: Record<string, unknown>,
  locale: string,
): Benefits | null {
  const benefitsSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: String(o.title ?? ""),
    description: String(o.description ?? ""),
    image: typeof o.image === "string" ? resolveMediaUrl(o.image) : "",
    image_alt: pickImageAlt(o.image_alt, locale) || null,
    is_active: o.is_active !== false,
    sort_order: Number.isFinite(benefitsSort) && benefitsSort > 0 ? benefitsSort : undefined,
  };
}

function parseBenefitsList(raw: unknown, locale: string): Benefits[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => parseBenefitsBlock(item as Record<string, unknown>, locale))
      .filter((x): x is Benefits => x != null);
  }
  if (typeof raw === "object") {
    const one = parseBenefitsBlock(raw as Record<string, unknown>, locale);
    return one ? [one] : [];
  }
  return [];
}

function parseSectionList(raw: unknown, locale: string): Section[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => parseSection(item, locale))
      .filter((x): x is Section => x != null);
  }
  const one = parseSection(raw, locale);
  return one ? [one] : [];
}

function parseToolsBlock(o: Record<string, unknown>): Tools {
  const toolsSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: String(o.title ?? ""),
    description: String(o.description ?? ""),
    sub_title: typeof o.sub_title === "string" ? o.sub_title : null,
    sub_description: typeof o.sub_description === "string" ? o.sub_description : null,
    is_active: o.is_active !== false,
    sort_order: Number.isFinite(toolsSort) && toolsSort > 0 ? toolsSort : undefined,
  };
}

function parseToolsList(raw: unknown): Tools[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item && typeof item === "object")
      .map((item) => parseToolsBlock(item as Record<string, unknown>));
  }
  if (typeof raw === "object") {
    return [parseToolsBlock(raw as Record<string, unknown>)];
  }
  return [];
}

function parseCtaBlock(o: Record<string, unknown>): Cta {
  const ctasSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: String(o.title ?? ""),
    description: String(o.description ?? ""),
    button_text: typeof o.button_text === "string" ? o.button_text : null,
    phone_number: String(o.phone_number ?? ""),
    sort_order: Number.isFinite(ctasSort) && ctasSort > 0 ? ctasSort : undefined,
  };
}

function parseCtasList(raw: unknown): Cta[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item && typeof item === "object")
      .map((item) => parseCtaBlock(item as Record<string, unknown>));
  }
  if (typeof raw === "object") {
    return [parseCtaBlock(raw as Record<string, unknown>)];
  }
  return [];
}

function parseFaqsBlock(o: Record<string, unknown>): Faqs {
  const items: FaqItem[] = Array.isArray(o.items)
    ? o.items
        .map((item) => {
          const row = item as Record<string, unknown>;
          const question = String(row.question ?? "").trim();
          const answer = String(row.answer ?? "").trim();
          if (!question) return null;
          return { question, answer };
        })
        .filter((x): x is FaqItem => x != null)
    : [];
  const faqsSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: String(o.title ?? ""),
    description: String(o.description ?? ""),
    items,
    sort_order: Number.isFinite(faqsSort) && faqsSort > 0 ? faqsSort : undefined,
  };
}

function parseFaqs(raw: unknown): Faqs | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return parseFaqsBlock(raw as Record<string, unknown>);
}

function parseFaqsList(raw: unknown): Faqs[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item && typeof item === "object")
      .map((item) => parseFaqsBlock(item as Record<string, unknown>));
  }
  if (typeof raw === "object") {
    return [parseFaqsBlock(raw as Record<string, unknown>)];
  }
  return [];
}

function parsePackagesList(raw: unknown, locale: string): ServicePackagesSection[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => parsePackages(item, locale))
      .filter((x): x is ServicePackagesSection => x != null && x.items.length > 0);
  }
  const one = parsePackages(raw, locale);
  return one && one.items.length > 0 ? [one] : [];
}

/** Maps raw `/v1/services/{slug}` payload to `SingleService`. */
export function normalizeSingleService(
  raw: Record<string, unknown>,
  locale: string,
): SingleService {
  const images = raw.images;
  let image = typeof raw.image === "string" ? raw.image : "";
  if (images && typeof images === "object" && !Array.isArray(images)) {
    const localized = pickLoc(images, locale);
    if (localized) image = localized;
  }

  const benefitsList = parseBenefitsList(raw.benefits, locale);
  const offeringsList = parseSectionList(raw.offerings, locale);
  const stepsList = parseSectionList(raw.steps, locale);
  const toolsList = parseToolsList(raw.tools);
  const faqsList = parseFaqsList(raw.faqs);
  const packagesList = parsePackagesList(raw.packages, locale);
  const ctasList = parseCtasList(raw.ctas);
  const articleTags = parseArticleTags(
    raw.tags ?? raw.blog_tags ?? raw.article_tags,
  );

  const pageSections = buildPageSections({
    benefits: benefitsList,
    offerings: offeringsList,
    steps: stepsList,
    tools: toolsList,
    faqs: faqsList,
    packages: packagesList,
    ctas: ctasList,
    articleTags,
  });

  return {
    id: Number(raw.id ?? 0),
    slug: String(raw.slug ?? ""),
    slug_local:
      raw.slug_local && typeof raw.slug_local === "object"
        ? {
            ar: pickLoc((raw.slug_local as Record<string, unknown>).ar, "ar") || undefined,
            en: pickLoc((raw.slug_local as Record<string, unknown>).en, "en") || undefined,
          }
        : undefined,
    image: resolveMediaUrl(image),
    image_alt: pickImageAlt(raw.image_alt, locale) || null,
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    inside_desc: String(raw.inside_desc ?? ""),
    sort_order: Number(raw.sort_order ?? 0),
    show_footer: raw.show_footer !== false,
    highlight_description: String(raw.highlight_description ?? ""),
    media_url: typeof raw.media_url === "string" ? raw.media_url : null,
    media_type: String(raw.media_type ?? "image"),
    meta_title: String(raw.meta_title ?? ""),
    meta_description: String(raw.meta_description ?? ""),
    social: parseSocial(raw.social),
    pageSections,
    /** @deprecated Use `pageSections` — first benefits block in display order only. */
    benefits: firstPageSectionData<Benefits>(pageSections, "benefits"),
    audits: raw.audits ?? null,
    /** @deprecated Use `pageSections` */
    offerings: firstPageSectionData<Section>(pageSections, "offerings"),
    /** @deprecated Use `pageSections` */
    steps: firstPageSectionData<Section>(pageSections, "steps"),
    /** @deprecated Use `pageSections` */
    tools: firstPageSectionData<Tools>(pageSections, "tools"),
    /** @deprecated Use `pageSections` */
    faqs: firstPageSectionData<Faqs>(pageSections, "faqs"),
    /** @deprecated Use `pageSections` */
    packages: firstPageSectionData<ServicePackagesSection>(pageSections, "packages"),
    /** @deprecated Use `pageSections` */
    ctas: firstPageSectionData<Cta>(pageSections, "ctas"),
    articleTags,
    countries: Array.isArray(raw.countries)
      ? (raw.countries as SingleService["countries"])
      : [],
    created_at: String(raw.created_at ?? ""),
  };
}
