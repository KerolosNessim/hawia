import { normalizePublicBlogTags } from "@/features/blogs/lib/blog-tag";
import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { stripLeadingDuplicateHeading } from "@/features/shared/lib/strip-leading-duplicate-heading";
import { pickImageAlt } from "@/lib/image-alt";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { pickLocalizedField, pickSlugLocal } from "./pick-localized-field";
import { pickServiceCoverPath, resolveLocalizedImageUrl } from "./pick-service-cover";
import { buildPageSections } from "./collect-page-sections";
import { parseClientPortfolio } from "./parse-client-portfolio";
import type { Accreditation } from "@/features/home/types";
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
  ServiceClientPortfolio,
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

function pickSectionLink(o: Record<string, unknown>): string | null {
  const link = o.link;
  if (typeof link === "string" && link.trim()) return link.trim();
  return null;
}

function sectionImageUrl(
  o: Record<string, unknown>,
  locale: string,
): string | null {
  return resolveLocalizedImageUrl(o.image, locale, o.images);
}

function parseSection(raw: unknown, locale: string): Section | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const items = Array.isArray(o.items)
    ? o.items
        .map((item) => {
          const row = item as Record<string, unknown>;
          const itemLink = pickSectionLink(row);
          const iconRaw = row.icon;
          const icon =
            typeof iconRaw === "string" && iconRaw.trim() ? iconRaw.trim() : null;
          const title = pickLocalizedField(row.title, locale);
          const description = pickLocalizedField(row.description, locale);
          return {
            title,
            description: stripLeadingDuplicateHeading(description, title),
            sort_order: String(row.sort_order ?? "0"),
            link: itemLink,
            icon,
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
    title: pickLocalizedField(o.title, locale),
    description: pickLocalizedField(o.description, locale),
    image: sectionImageUrl(o, locale),
    image_alt: pickImageAlt(o.image_alt, locale) || null,
    items,
    sort_order: Number.isFinite(blockSort) && blockSort > 0 ? blockSort : undefined,
    link: pickSectionLink(o),
  };
}

function parsePackageItems(raw: unknown, locale: string): ServicePackageItem[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const section = raw as Record<string, unknown>;
  const rows = Array.isArray(section.items) ? section.items : [];
  const parsed = rows
    .map((item, idx) => {
      const o = item as Record<string, unknown>;
      const title = pickLocalizedField(o.title, locale).trim();
      if (!title) return null;
      const descHtml = pickLocalizedField(o.description, locale);
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
        imageAlt: pickLocalizedField(o.image_alt, locale) || null,
        link: pickSectionLink(o),
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
    title: pickLocalizedField(o.title, locale).trim(),
    description: pickLocalizedField(o.description, locale).trim(),
    image: sectionImageUrl(o, locale),
    image_alt: pickImageAlt(o.image_alt, locale) || null,
    items,
    sort_order: Number.isFinite(blockSort) && blockSort > 0 ? blockSort : undefined,
    link: pickSectionLink(o),
  };
}

function parseSocial(raw: unknown, locale: string): ServiceSocial | null {
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
          image:
            resolveLocalizedImageUrl(og.image, locale, og.images) ?? undefined,
          type: typeof og.type === "string" ? og.type : undefined,
          site_name: typeof og.site_name === "string" ? og.site_name : undefined,
        }
      : undefined,
    twitter: tw
      ? {
          card: typeof tw.card === "string" ? tw.card : undefined,
          title: typeof tw.title === "string" ? tw.title : undefined,
          description: typeof tw.description === "string" ? tw.description : undefined,
          image:
            resolveLocalizedImageUrl(tw.image, locale, tw.images) ?? undefined,
        }
      : undefined,
  };
}

function parseArticleTags(raw: unknown): ServiceArticleTag[] {
  return normalizePublicBlogTags(raw).map((t) => ({
    label: t.label,
    index: t.index,
    follow: t.follow,
  }));
}

function parseBenefitsBlock(
  o: Record<string, unknown>,
  locale: string,
): Benefits | null {
  const benefitsSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: pickLocalizedField(o.title, locale),
    description: pickLocalizedField(o.description, locale),
    image: sectionImageUrl(o, locale) ?? "",
    image_alt: pickImageAlt(o.image_alt, locale) || null,
    is_active: o.is_active !== false,
    sort_order: Number.isFinite(benefitsSort) && benefitsSort > 0 ? benefitsSort : undefined,
    link: pickSectionLink(o),
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

function parseToolsBlock(o: Record<string, unknown>, locale: string): Tools {
  const toolsSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: pickLocalizedField(o.title, locale),
    description: pickLocalizedField(o.description, locale),
    sub_title: pickLocalizedField(o.sub_title, locale) || null,
    sub_description: pickLocalizedField(o.sub_description, locale) || null,
    is_active: o.is_active !== false,
    sort_order: Number.isFinite(toolsSort) && toolsSort > 0 ? toolsSort : undefined,
    link: pickSectionLink(o),
  };
}

function parseToolsList(raw: unknown, locale: string): Tools[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item && typeof item === "object")
      .map((item) => parseToolsBlock(item as Record<string, unknown>, locale));
  }
  if (typeof raw === "object") {
    return [parseToolsBlock(raw as Record<string, unknown>, locale)];
  }
  return [];
}

function parseCtaBlock(o: Record<string, unknown>, locale: string): Cta {
  const ctasSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: pickLocalizedField(o.title, locale),
    description: pickLocalizedField(o.description, locale),
    button_text: pickLocalizedField(o.button_text, locale) || null,
    phone_number: String(o.phone_number ?? ""),
    sort_order: Number.isFinite(ctasSort) && ctasSort > 0 ? ctasSort : undefined,
    link: pickSectionLink(o),
  };
}

function parseCtasList(raw: unknown, locale: string): Cta[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item && typeof item === "object")
      .map((item) => parseCtaBlock(item as Record<string, unknown>, locale));
  }
  if (typeof raw === "object") {
    return [parseCtaBlock(raw as Record<string, unknown>, locale)];
  }
  return [];
}

function parseFaqsBlock(o: Record<string, unknown>, locale: string): Faqs {
  const items: FaqItem[] = Array.isArray(o.items)
    ? o.items
        .map((item) => {
          const row = item as Record<string, unknown>;
          const question = pickLocalizedField(row.question, locale).trim();
          const answer = stripLeadingDuplicateHeading(
            pickLocalizedField(row.answer, locale),
            question,
          ).trim();
          if (!question) return null;
          const sortOrder = Number.parseInt(String(row.sort_order ?? "0"), 10);
          return {
            question,
            answer,
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
            link: pickSectionLink(row),
          };
        })
        .filter(
          (
            x,
          ): x is {
            question: string;
            answer: string;
            sortOrder: number;
            link: string | null;
          } => x != null,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ question, answer, link }) => ({ question, answer, link }))
    : [];
  const faqsSort = Number(o.sort_order);
  return {
    id: Number(o.id ?? 0),
    title: pickLocalizedField(o.title, locale),
    description: pickLocalizedField(o.description, locale),
    items,
    sort_order: Number.isFinite(faqsSort) && faqsSort > 0 ? faqsSort : undefined,
    link: pickSectionLink(o),
  };
}

function parseFaqs(raw: unknown, locale: string): Faqs | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return parseFaqsBlock(raw as Record<string, unknown>, locale);
}

function parseFaqsList(raw: unknown, locale: string): Faqs[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item && typeof item === "object")
      .map((item) => parseFaqsBlock(item as Record<string, unknown>, locale));
  }
  if (typeof raw === "object") {
    return [parseFaqsBlock(raw as Record<string, unknown>, locale)];
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

function parseLinkedMediaServices(raw: unknown): Accreditation["images"][number]["services"] {
  if (!Array.isArray(raw)) return undefined;
  const services = raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      const slugLocal =
        row.slug_local && typeof row.slug_local === "object" && !Array.isArray(row.slug_local)
          ? (row.slug_local as { ar?: string | null; en?: string | null })
          : null;
      return {
        id: Number(row.id ?? 0),
        slug: typeof row.slug === "string" ? row.slug : null,
        slug_local: slugLocal,
        title:
          typeof row.title === "string" ||
          (row.title && typeof row.title === "object" && !Array.isArray(row.title))
            ? (row.title as string | { ar?: string | null; en?: string | null })
            : null,
      };
    })
    .filter((item) => item.id > 0);
  return services.length ? services : undefined;
}

function parseLinkedMediaBlock(raw: unknown, locale: string): Accreditation | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const imagesRaw = Array.isArray(row.images) ? row.images : [];
  const images = imagesRaw
    .map((item, index) => {
      const img = item as Record<string, unknown>;
      const url = resolveMediaUrl(
        typeof img.url === "string" ? img.url : pickLocalizedField(img.url, locale),
      );
      if (!url || url === "/blog.webp") return null;
      return {
        id: Number(img.id ?? index),
        url,
        image_alt: pickImageAlt(img.image_alt, locale) ?? null,
        service_ids: Array.isArray(img.service_ids)
          ? img.service_ids.map((id) => Number(id)).filter((id) => id > 0)
          : undefined,
        services: parseLinkedMediaServices(img.services),
      };
    })
    .filter((x): x is Accreditation["images"][number] => x != null);

  if (!images.length) return null;

  const title = pickLocalizedField(row.title, locale).trim();
  const description = pickLocalizedField(row.description, locale).trim();

  return {
    id: Number(row.id ?? 0),
    title: title || "",
    description,
    images,
  };
}

const parseOurAccreditations = parseLinkedMediaBlock;

/** Maps raw `/v1/services/{slug}` payload to `SingleService`. */
export function normalizeSingleService(
  raw: Record<string, unknown>,
  locale: string,
): SingleService {
  const image = pickServiceCoverPath(raw.image, locale, raw.images);

  const benefitsList = parseBenefitsList(raw.benefits, locale);
  const offeringsList = parseSectionList(raw.offerings, locale);
  const stepsList = parseSectionList(raw.steps, locale);
  const toolsList = parseToolsList(raw.tools, locale);
  const faqsList = parseFaqsList(raw.faqs, locale);
  const packagesList = parsePackagesList(raw.packages, locale);
  const ctasList = parseCtasList(raw.ctas, locale);
  const articleTags = parseArticleTags(
    raw.tags ?? raw.blog_tags ?? raw.article_tags,
  );

  const clientPortfolio = parseClientPortfolio(raw.client_portfolio, locale);

  const pageSections = buildPageSections({
    benefits: benefitsList,
    offerings: offeringsList,
    steps: stepsList,
    tools: toolsList,
    faqs: faqsList,
    packages: packagesList,
    ctas: ctasList,
    articleTags,
    clientPortfolio,
  });

  return {
    id: Number(raw.id ?? 0),
    slug: String(raw.slug ?? ""),
    slug_local: pickSlugLocal(raw),
    image: resolveMediaUrl(image),
    image_alt: pickImageAlt(raw.image_alt, locale) || null,
    title: plainTextFromHtml(pickLocalizedField(raw.title, locale)),
    singlePageTitle:
      plainTextFromHtml(pickLocalizedField(raw.single_page_title, locale)) ||
      plainTextFromHtml(pickLocalizedField(raw.singlePageTitle, locale)),
    pageScript:
      typeof raw.page_script === "string" && raw.page_script.trim()
        ? raw.page_script
        : typeof raw.pageScript === "string" && raw.pageScript.trim()
          ? raw.pageScript
          : null,
    subtitle: pickLocalizedField(raw.subtitle, locale),
    description: pickLocalizedField(raw.description, locale),
    inside_desc: pickLocalizedField(raw.inside_desc, locale),
    sort_order: Number(raw.sort_order ?? 0),
    show_footer: raw.show_footer !== false,
    highlight_description: pickLocalizedField(raw.highlight_description, locale),
    media_url: typeof raw.media_url === "string" ? raw.media_url : null,
    media_type: String(raw.media_type ?? "image"),
    meta_title: pickLocalizedField(raw.meta_title, locale),
    meta_description: pickLocalizedField(raw.meta_description, locale),
    social: parseSocial(raw.social, locale),
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
    ourAccreditations: parseOurAccreditations(raw.our_accreditations, locale),
    ourClients:
      parseLinkedMediaBlock(raw.our_clients, locale) ??
      parseLinkedMediaBlock(raw.partners, locale) ??
      parseLinkedMediaBlock(raw.clients, locale),
    clientPortfolio:
      firstPageSectionData<ServiceClientPortfolio>(pageSections, "clientPortfolio") ??
      clientPortfolio,
    created_at: String(raw.created_at ?? ""),
  };
}
