import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { pickImageAlt } from "@/lib/image-alt";
import type {
  FaqItem,
  Faqs,
  Section,
  ServiceArticleTag,
  ServicePackagesSection,
  ServicePackageItem,
  ServiceSocial,
  SingleService,
} from "../types";

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
    sort_order: Number.isFinite(blockSort) ? blockSort : undefined,
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
    sort_order: Number.isFinite(blockSort) ? blockSort : undefined,
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

function parseFaqs(raw: unknown): Faqs | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
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
    sort_order: Number.isFinite(faqsSort) ? faqsSort : undefined,
  };
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

  const benefitsRaw = raw.benefits;
  let benefits = null;
  if (benefitsRaw && typeof benefitsRaw === "object" && !Array.isArray(benefitsRaw)) {
    const b = benefitsRaw as Record<string, unknown>;
    const benefitsSort = Number(b.sort_order);
    benefits = {
      id: Number(b.id ?? 0),
      title: String(b.title ?? ""),
      description: String(b.description ?? ""),
      image: typeof b.image === "string" ? resolveMediaUrl(b.image) : "",
      image_alt: pickImageAlt(b.image_alt, locale) || null,
      is_active: b.is_active !== false,
      sort_order: Number.isFinite(benefitsSort) ? benefitsSort : undefined,
    };
  }

  const toolsRaw = raw.tools;
  let tools = null;
  if (toolsRaw && typeof toolsRaw === "object" && !Array.isArray(toolsRaw)) {
    const t = toolsRaw as Record<string, unknown>;
    const toolsSort = Number(t.sort_order);
    tools = {
      id: Number(t.id ?? 0),
      title: String(t.title ?? ""),
      description: String(t.description ?? ""),
      sub_title: typeof t.sub_title === "string" ? t.sub_title : null,
      sub_description: typeof t.sub_description === "string" ? t.sub_description : null,
      is_active: t.is_active !== false,
      sort_order: Number.isFinite(toolsSort) ? toolsSort : undefined,
    };
  }

  const ctasRaw = raw.ctas;
  let ctas = null;
  if (ctasRaw && typeof ctasRaw === "object" && !Array.isArray(ctasRaw)) {
    const c = ctasRaw as Record<string, unknown>;
    const ctasSort = Number(c.sort_order);
    ctas = {
      id: Number(c.id ?? 0),
      title: String(c.title ?? ""),
      description: String(c.description ?? ""),
      button_text: typeof c.button_text === "string" ? c.button_text : null,
      phone_number: String(c.phone_number ?? ""),
      sort_order: Number.isFinite(ctasSort) ? ctasSort : undefined,
    };
  }

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
    benefits,
    audits: raw.audits ?? null,
    offerings: parseSection(raw.offerings, locale),
    steps: parseSection(raw.steps, locale),
    tools,
    faqs: parseFaqs(raw.faqs),
    packages: parsePackages(raw.packages, locale),
    ctas,
    articleTags: parseArticleTags(
      raw.tags ?? raw.blog_tags ?? raw.article_tags,
    ),
    countries: Array.isArray(raw.countries)
      ? (raw.countries as SingleService["countries"])
      : [],
    created_at: String(raw.created_at ?? ""),
  };
}
