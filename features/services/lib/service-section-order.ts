import type { ServicePageSectionKey, SingleService } from "../types";

export type { ServicePageSectionKey } from "../types";

/** Default display order when API omits block `sort_order` (matches legacy layout). */
const DEFAULT_BLOCK_ORDER: Record<ServicePageSectionKey, number> = {
  benefits: 10,
  offerings: 20,
  steps: 30,
  tools: 40,
  faqs: 50,
  packages: 60,
  articleTags: 65,
  ctas: 90,
};

function blockSortOrder(raw: unknown, fallback: number): number {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fallback;
  const n = Number((raw as Record<string, unknown>).sort_order);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function hasSection(service: SingleService, key: ServicePageSectionKey): boolean {
  switch (key) {
    case "benefits":
      return Boolean(service.benefits);
    case "offerings":
      return Boolean(service.offerings);
    case "steps":
      return Boolean(service.steps);
    case "tools":
      return Boolean(service.tools);
    case "faqs":
      return Boolean(service.faqs);
    case "packages":
      return Boolean(service.packages?.items.length);
    case "articleTags":
      return service.articleTags.length > 0;
    case "ctas":
      return Boolean(service.ctas);
    default:
      return false;
  }
}

function sortOrderForKey(service: SingleService, key: ServicePageSectionKey): number {
  const fallback = DEFAULT_BLOCK_ORDER[key];
  switch (key) {
    case "benefits":
      return blockSortOrder(service.benefits, fallback);
    case "offerings":
      return blockSortOrder(service.offerings, fallback);
    case "steps":
      return blockSortOrder(service.steps, fallback);
    case "tools":
      return blockSortOrder(service.tools, fallback);
    case "faqs":
      return blockSortOrder(service.faqs, fallback);
    case "packages":
      return blockSortOrder(service.packages, fallback);
    case "ctas":
      return blockSortOrder(service.ctas, fallback);
    case "articleTags":
      return fallback;
    default:
      return fallback;
  }
}

/** Section keys present on the service, sorted by API `sort_order` (then defaults). */
export function getOrderedServicePageSectionKeys(
  service: SingleService,
): ServicePageSectionKey[] {
  const keys: ServicePageSectionKey[] = [
    "benefits",
    "offerings",
    "steps",
    "tools",
    "faqs",
    "packages",
    "articleTags",
    "ctas",
  ];

  return keys
    .filter((key) => hasSection(service, key))
    .sort((a, b) => sortOrderForKey(service, a) - sortOrderForKey(service, b));
}
