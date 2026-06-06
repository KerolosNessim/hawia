import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { pickImageAlt } from "@/lib/image-alt";
import { pickLocalizedField } from "./pick-localized-field";
import { pickServiceCoverPath } from "./pick-service-cover";
import { resolvePortfolioHref } from "./resolve-portfolio-href";
import type { ServiceClientPortfolio, ServiceClientPortfolioItem } from "../types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function parseViewAllCard(raw: unknown, locale: string): ServiceClientPortfolio["viewAllCard"] {
  const row = asRecord(raw);
  if (!row) return null;
  const title = pickLocalizedField(row.title, locale).trim();
  const description = pickLocalizedField(row.description, locale).trim();
  const buttonText = pickLocalizedField(row.button_text ?? row.buttonText, locale).trim();
  if (!title && !description) return null;
  return {
    title,
    description,
    buttonText: buttonText || null,
    link: resolvePortfolioHref(
      typeof row.link === "string" ? row.link : pickLocalizedField(row.link, locale),
    ),
  };
}

function parseItem(raw: unknown, locale: string): ServiceClientPortfolioItem | null {
  const row = asRecord(raw);
  if (!row) return null;

  const imagePath = pickServiceCoverPath(row.image, locale, row.images);
  const resolved = imagePath ? resolveMediaUrl(imagePath) : "";
  const image = resolved && resolved !== "/blog.webp" ? resolved : "";

  const headline = pickLocalizedField(row.headline, locale).trim();
  const clientTag = pickLocalizedField(row.client_tag ?? row.clientTag, locale).trim();
  if (!headline && !clientTag && !image) return null;

  const metricsRaw = Array.isArray(row.metrics) ? row.metrics : [];
  const metrics = metricsRaw
    .map((m) => (typeof m === "string" ? m.trim() : pickLocalizedField(m, locale).trim()))
    .filter(Boolean);

  const readText = pickLocalizedField(
    row.read_case_study_button_text ?? row.readCaseStudyButtonText,
    locale,
  ).trim();

  return {
    id: Number(row.id ?? 0),
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    category: String(row.category ?? "").trim(),
    clientTag,
    headline,
    period: pickLocalizedField(row.period, locale).trim(),
    client: pickLocalizedField(row.client, locale).trim(),
    challenge: pickLocalizedField(row.challenge, locale).trim(),
    whatWeDid: pickLocalizedField(row.what_we_did ?? row.whatWeDid, locale).trim(),
    results: pickLocalizedField(row.results, locale).trim(),
    metrics,
    image,
    imageAlt: pickImageAlt(row.image_alt ?? row.imageAlt, locale) ?? null,
    caseStudyLink: resolvePortfolioHref(
      typeof row.full_case_study_link === "string"
        ? row.full_case_study_link
        : pickLocalizedField(row.full_case_study_link, locale),
    ),
    readCaseStudyButtonText: readText || null,
  };
}

export function parseClientPortfolio(
  raw: unknown,
  locale: string,
): ServiceClientPortfolio | null {
  const row = asRecord(raw);
  if (!row) return null;

  const items = (Array.isArray(row.items) ? row.items : [])
    .map((item) => parseItem(item, locale))
    .filter((x): x is ServiceClientPortfolioItem => x != null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!items.length) return null;

  const title = pickLocalizedField(row.title, locale).trim();
  const subtitle = pickLocalizedField(row.subtitle, locale).trim();
  const viewAllButtonText = pickLocalizedField(
    row.view_all_button_text ?? row.viewAllButtonText,
    locale,
  ).trim();
  const defaultRead = pickLocalizedField(
    row.read_case_study_button_text ?? row.readCaseStudyButtonText,
    locale,
  ).trim();

  const viewAllCard = parseViewAllCard(row.view_all_card ?? row.viewAllCard, locale);
  const viewAllLink = resolvePortfolioHref(
    typeof row.view_all_link === "string"
      ? row.view_all_link
      : pickLocalizedField(row.view_all_link, locale),
  );

  const sortOrder = Number(row.sort_order ?? row.sortOrder ?? 0);

  return {
    id: Number(row.id ?? 0),
    title,
    subtitle,
    sort_order: Number.isFinite(sortOrder) && sortOrder > 0 ? sortOrder : undefined,
    viewAllLink,
    viewAllButtonText: viewAllButtonText || null,
    viewAllCard,
    defaultReadCaseStudyText: defaultRead || null,
    items,
  };
}
