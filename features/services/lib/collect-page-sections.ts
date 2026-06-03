import type {
  Benefits,
  Cta,
  Faqs,
  Section,
  ServiceArticleTag,
  ServiceClientPortfolio,
  ServicePackagesSection,
  ServicePageSectionInstance,
  ServicePageSectionKey,
  Tools,
} from "../types";

const DEFAULT_BLOCK_ORDER: Record<ServicePageSectionKey, number> = {
  benefits: 10,
  offerings: 20,
  steps: 30,
  tools: 40,
  clientPortfolio: 45,
  faqs: 50,
  packages: 60,
  articleTags: 65,
  ctas: 90,
};

function resolveSortOrder(
  sortOrder: number | undefined,
  fallback: number,
): number {
  return sortOrder != null && sortOrder > 0 ? sortOrder : fallback;
}

export function buildPageSections(input: {
  benefits: Benefits[];
  offerings: Section[];
  steps: Section[];
  tools: Tools[];
  faqs: Faqs[];
  packages: ServicePackagesSection[];
  ctas: Cta[];
  articleTags: ServiceArticleTag[];
  clientPortfolio?: ServiceClientPortfolio | null;
}): ServicePageSectionInstance[] {
  const blocks: ServicePageSectionInstance[] = [];

  input.benefits.forEach((data, index) => {
    blocks.push({
      key: "benefits",
      index,
      sort_order: resolveSortOrder(data.sort_order, DEFAULT_BLOCK_ORDER.benefits + index),
      data,
    });
  });

  input.offerings.forEach((data, index) => {
    blocks.push({
      key: "offerings",
      index,
      sort_order: resolveSortOrder(data.sort_order, DEFAULT_BLOCK_ORDER.offerings + index),
      data,
    });
  });

  input.steps.forEach((data, index) => {
    blocks.push({
      key: "steps",
      index,
      sort_order: resolveSortOrder(data.sort_order, DEFAULT_BLOCK_ORDER.steps + index),
      data,
    });
  });

  input.tools.forEach((data, index) => {
    blocks.push({
      key: "tools",
      index,
      sort_order: resolveSortOrder(data.sort_order, DEFAULT_BLOCK_ORDER.tools + index),
      data,
    });
  });

  if (input.clientPortfolio?.items.length) {
    blocks.push({
      key: "clientPortfolio",
      index: 0,
      sort_order: resolveSortOrder(
        input.clientPortfolio.sort_order,
        DEFAULT_BLOCK_ORDER.clientPortfolio,
      ),
      data: input.clientPortfolio,
    });
  }

  input.faqs.forEach((data, index) => {
    blocks.push({
      key: "faqs",
      index,
      sort_order: resolveSortOrder(data.sort_order, DEFAULT_BLOCK_ORDER.faqs + index),
      data,
    });
  });

  input.packages.forEach((data, index) => {
    blocks.push({
      key: "packages",
      index,
      sort_order: resolveSortOrder(data.sort_order, DEFAULT_BLOCK_ORDER.packages + index),
      data,
    });
  });

  input.ctas.forEach((data, index) => {
    blocks.push({
      key: "ctas",
      index,
      sort_order: resolveSortOrder(data.sort_order, DEFAULT_BLOCK_ORDER.ctas + index),
      data,
    });
  });

  if (input.articleTags.length > 0) {
    blocks.push({
      key: "articleTags",
      index: 0,
      sort_order: DEFAULT_BLOCK_ORDER.articleTags,
      data: input.articleTags,
    });
  }

  return blocks.sort((a, b) => a.sort_order - b.sort_order);
}

export function getOrderedServicePageSections(
  pageSections: ServicePageSectionInstance[],
): ServicePageSectionInstance[] {
  return [...pageSections].sort((a, b) => a.sort_order - b.sort_order);
}
