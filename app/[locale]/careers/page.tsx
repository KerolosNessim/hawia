import CareersPage from "@/features/careers/components/careers-page";
import {
  getJobOpeningsPublicByLocale,
  getJobsHeaderPublicByLocale,
} from "@/features/careers/api/jobsPublicApi";
import { jobOpeningPath, pickJobOpeningSlug } from "@/features/careers/lib/job-slug";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import {
  buildBreadcrumbList,
  buildCanonicalUrl,
  buildCollectionPageSchemaGraph,
  jsonLdGraph,
} from "@/lib/seo/schema";
import { buildPageMetadata, localePathname } from "@/lib/seo/metadata-helpers";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

function metaDescription(value: string, fallback: string): string {
  return (value.trim() || fallback).slice(0, 160);
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const loc = locale as Locale;
  const lang = loc.startsWith("ar") ? "ar" : "en";
  const pathname = localePathname(loc, "/careers");

  try {
    const header = await getJobsHeaderPublicByLocale(lang);
    const title = plainTextFromHtml(header?.seo.meta_title || header?.content.title || "");
    const description = plainTextFromHtml(
      header?.seo.meta_description || header?.content.description || "",
    );

    return buildPageMetadata({
      locale: loc,
      pathname,
      title: title || (lang === "ar" ? "الوظائف | هوية" : "Careers | Howeyah"),
      description:
        metaDescription(
          description,
          lang === "ar"
            ? "فرص العمل والتدريب المتاحة في هوية."
            : "Open career opportunities at Howeyah.",
        ) || undefined,
    });
  } catch {
    return buildPageMetadata({
      locale: loc,
      pathname,
      title: lang === "ar" ? "الوظائف | هوية" : "Careers | Howeyah",
      description:
        lang === "ar"
          ? "فرص العمل والتدريب المتاحة في هوية."
          : "Open career opportunities at Howeyah.",
    });
  }
}

export default async function CareersRoutePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const loc = locale as Locale;
  const lang = loc.startsWith("ar") ? "ar" : "en";

  const [header, openings, tSeo] = await Promise.all([
    getJobsHeaderPublicByLocale(lang),
    getJobOpeningsPublicByLocale(lang),
    getTranslations({ locale: loc, namespace: "seo.breadcrumb" }),
  ]);

  const pageTitle =
    plainTextFromHtml(header?.seo.meta_title || header?.content.title || "") ||
    (lang === "ar" ? "الوظائف" : "Careers");
  const pageDescription = metaDescription(
    plainTextFromHtml(header?.seo.meta_description || header?.content.description || ""),
    lang === "ar"
      ? "فرص العمل والتدريب المتاحة في هوية."
      : "Open career opportunities at Howeyah.",
  );
  const pageUrl = buildCanonicalUrl(loc, "/careers");
  const careersSchemaJson = jsonLdGraph([
    ...buildCollectionPageSchemaGraph({
      pageUrl,
      name: pageTitle,
      description: pageDescription,
      inLanguage: lang,
      breadcrumbs: [],
      items: openings.map((opening) => ({
        name: plainTextFromHtml(opening.title).trim(),
        url: buildCanonicalUrl(loc, jobOpeningPath(pickJobOpeningSlug(opening, loc))),
        image: opening.media.image,
      })),
      listIdSuffix: "job-openings",
    }),
    buildBreadcrumbList(
      [
        { name: tSeo("home"), url: buildCanonicalUrl(loc, "/") },
        { name: tSeo("careers"), url: pageUrl },
      ],
      pageUrl,
    ),
  ]);

  return (
    <>
      <PageSchemaScript json={careersSchemaJson} />
      <CareersPage />
    </>
  );
}
