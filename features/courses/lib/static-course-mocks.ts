import type { CatalogCourseSummary, ResolvedPublicCourse } from "@/features/courses/services/courses-public-api";

const STATIC_SLUG_PREVIEW = "preview";

export const STATIC_CATALOG_FOR_UI: CatalogCourseSummary[] = [
  {
    id: "static-1",
    slug: STATIC_SLUG_PREVIEW,
    title: "Brand strategy fundamentals",
    priceLabel: "$99",
    imageSrc: "/blob.svg",
  },
  {
    id: "static-2",
    slug: STATIC_SLUG_PREVIEW,
    title: "Digital marketing playbook",
    priceLabel: "$129",
    imageSrc: "/client-2.svg",
  },
  {
    id: "static-3",
    slug: STATIC_SLUG_PREVIEW,
    title: "Visual identity workshop",
    priceLabel: "$79",
    imageSrc: "/globe.svg",
  },
];

function copyFor(locale: string) {
  const ar = locale.startsWith("ar");
  return {
    title: ar ? "أساسيات استراتيجية العلامة" : "Brand strategy fundamentals",
    description: ar
      ? "عرض ثابت لصفحة الدورة لمعاينة التصميم قبل ربط الـ API.\n\nستتعرّف في هذه الدورة على كيفية بناء رسالة متسقة وخطة تنفيذ عملية."
      : "Static preview copy for the course page layout before the live API is connected.\n\nYou will learn how to build a cohesive message and a practical rollout plan.",
    objectives: ar
      ? ["تحديد جمهورك المستهدف", "صياغة قيمة متمايزة للعرض", "ربط المحتوى بأهداف قابلة للقياس"]
      : ["Define your audience", "Shape a differentiated value proposition", "Tie content to measurable goals"],
  };
}

/** Full course detail used when visiting `/courses/preview` (static UI). */
export function getStaticResolvedCourse(identifier: string, locale: string): ResolvedPublicCourse | null {
  if (identifier !== STATIC_SLUG_PREVIEW) return null;
  const copy = copyFor(locale);
  return {
    id: "preview",
    slug: STATIC_SLUG_PREVIEW,
    title: copy.title,
    description: copy.description,
    priceLabel: "$99",
    comparePriceLabel: "$149",
    imageSrc: "/blob.svg",
    objectives: copy.objectives,
    lessons: [
      { id: "l1", title: locale.startsWith("ar") ? "مقدمة ومخارج التعلم" : "Introduction & outcomes", preview: true, durationLabel: "12 min" },
      { id: "l2", title: locale.startsWith("ar") ? "بناء شخصية الجمهور" : "Building audience personas", preview: false, durationLabel: "24 min" },
      { id: "l3", title: locale.startsWith("ar") ? "خريطة المحتوى" : "Content mapping", preview: false, durationLabel: "18 min" },
      { id: "l4", title: locale.startsWith("ar") ? "الخلاصة والخطوات التالية" : "Wrap-up & next steps", preview: false, durationLabel: "10 min" },
    ],
  };
}
