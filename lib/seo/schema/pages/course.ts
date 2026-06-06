import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { organizationId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import { schemaMediaUrl } from "../urls";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";

export type CourseLessonSchemaItem = {
  name: string;
  position: number;
  durationLabel?: string | null;
};

export type CoursePageSchemaInput = {
  pageUrl: string;
  name: string;
  description: string;
  inLanguage: string;
  imageUrl?: string | null;
  priceLabel?: string | null;
  lessonCount?: number;
  lessons?: CourseLessonSchemaItem[];
  objectives?: string[];
  breadcrumbs: BreadcrumbItem[];
  origin?: string;
};

function pageCourseId(pageUrl: string): string {
  return `${pageUrl.replace(/\/$/, "")}#course`;
}

/** Best-effort parse of display price strings (e.g. EGP500, $99). */
function parseOfferFromPriceLabel(
  priceLabel: string,
  pageUrl: string,
  origin: string,
): JsonLd | undefined {
  const raw = priceLabel.trim();
  if (!raw || raw === "—" || raw === "-") return undefined;

  let priceCurrency: string | undefined;
  let price: number | undefined;

  const prefixed = raw.match(/^([A-Za-z]{3})\s*([\d,.]+)/);
  if (prefixed) {
    priceCurrency = prefixed[1]!.toUpperCase();
    price = Number.parseFloat(prefixed[2]!.replace(/,/g, ""));
  }

  const dollar = raw.match(/^\$\s*([\d,.]+)/);
  if (dollar && price == null) {
    priceCurrency = "USD";
    price = Number.parseFloat(dollar[1]!.replace(/,/g, ""));
  }

  const suffixed = raw.match(/^([\d,.]+)\s*([A-Za-z]{3})$/);
  if (suffixed && price == null) {
    price = Number.parseFloat(suffixed[1]!.replace(/,/g, ""));
    priceCurrency = suffixed[2]!.toUpperCase();
  }

  const digitsOnly = raw.match(/^([\d,.]+)$/);
  if (digitsOnly && price == null) {
    price = Number.parseFloat(digitsOnly[1]!.replace(/,/g, ""));
  }

  if (price == null || !Number.isFinite(price)) return undefined;

  const offer: JsonLd = {
    "@type": "Offer",
    price,
    availability: "https://schema.org/InStock",
    url: pageUrl,
    seller: { "@id": organizationId(origin) },
  };
  if (priceCurrency && /^[A-Z]{3}$/.test(priceCurrency)) {
    offer.priceCurrency = priceCurrency;
  }
  return offer;
}

export function buildCoursePageSchemaGraph(input: CoursePageSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const courseId = pageCourseId(input.pageUrl);
  const descriptionPlain = plainTextFromHtml(input.description).slice(0, 500);

  const course: JsonLd = {
    "@type": "Course",
    "@id": courseId,
    url: input.pageUrl,
    name: input.name,
    description: descriptionPlain,
    inLanguage: input.inLanguage,
    courseMode: "online",
    provider: { "@id": organizationId(origin) },
  };

  const image = input.imageUrl ? schemaMediaUrl(input.imageUrl, origin) : undefined;
  if (image) course.image = [image];

  if (input.lessonCount != null && input.lessonCount > 0) {
    course.hasCourseInstance = {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `P${input.lessonCount}L`,
    };
  }

  if (input.lessons?.length) {
    course.hasPart = {
      "@type": "ItemList",
      name: "Course curriculum",
      numberOfItems: input.lessons.length,
      itemListElement: input.lessons.map((lesson) => ({
        "@type": "ListItem",
        position: lesson.position,
        name: lesson.name,
        ...(lesson.durationLabel?.trim()
          ? { description: lesson.durationLabel.trim() }
          : {}),
      })),
    };
  }

  const teaches = (input.objectives ?? [])
    .map((obj) => plainTextFromHtml(obj).trim())
    .filter(Boolean);
  if (teaches.length) {
    course.teaches = teaches.map((name) => ({ "@type": "DefinedTerm", name }));
  }

  const offer = input.priceLabel
    ? parseOfferFromPriceLabel(input.priceLabel, input.pageUrl, origin)
    : undefined;
  if (offer) course.offers = offer;

  const webPage: JsonLd = {
    "@type": "WebPage",
    "@id": pageWebPageId(input.pageUrl),
    url: input.pageUrl,
    name: input.name,
    description: descriptionPlain.slice(0, 320),
    isPartOf: { "@id": websiteId(origin) },
    about: { "@id": organizationId(origin) },
    mainEntity: { "@id": courseId },
    inLanguage: input.inLanguage,
    breadcrumb: { "@id": `${input.pageUrl.replace(/\/$/, "")}#breadcrumb` },
  };

  return [
    webPage,
    course,
    buildBreadcrumbList(input.breadcrumbs, input.pageUrl),
  ];
}

export function serializeCoursePageSchema(input: CoursePageSchemaInput): string {
  return jsonLdGraph(buildCoursePageSchemaGraph(input));
}
