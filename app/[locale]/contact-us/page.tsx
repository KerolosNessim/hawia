import { pickPrimaryContactHeader } from "@/features/contact/lib/pick-active-contact-headers";
import { fetchContactHeaders } from "@/features/contact/services/get-contact-headers";
import ContactSection from "@/features/home/component/contact-section";
import { resolveHomeCountryId } from "@/features/home/lib/resolve-home-country-id";
import PageHeader from "@/features/shared/components/page-header";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { localePathname } from "@/lib/seo/metadata-helpers";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import { buildCanonicalUrl, serializeStaticPageSchema } from "@/lib/seo/schema";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const loc = locale as Locale;
  const countryId = await resolveHomeCountryId();
  const headers = await fetchContactHeaders(countryId);
  const primary = pickPrimaryContactHeader(headers);

  return buildStaticPageMetadata({
    locale: loc,
    pathname: localePathname(loc, "/contact-us"),
    pageKey: "contact-us",
    title: primary?.meta_title?.trim() || primary?.title || t("title"),
    description:
      primary?.meta_description?.trim() ||
      plainTextFromHtml(primary?.description ?? "") ||
      t("description"),
  });
}

export default async function ContactUsPage({ params }: Props) {
  await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("contact");
  const tSeo = await getTranslations({ locale, namespace: "seo.breadcrumb" });
  const countryId = await resolveHomeCountryId();
  const headers = await fetchContactHeaders(countryId);
  const primary = pickPrimaryContactHeader(headers);
  const pageTitle = primary?.title || t("title");
  const pageDescription =
    plainTextFromHtml(primary?.description ?? "") || t("description");
  const pageUrl = buildCanonicalUrl(locale, "/contact-us");
  const contactSchemaJson = serializeStaticPageSchema({
    pageType: "ContactPage",
    pageUrl,
    name: pageTitle,
    description: pageDescription,
    inLanguage: locale === "ar" ? "ar" : "en",
    mainEntityOrganization: true,
    breadcrumbs: [
      { name: tSeo("home"), url: buildCanonicalUrl(locale, "/") },
      { name: tSeo("contact-us"), url: pageUrl },
    ],
  });

  return (
    <div>
      <PageSchemaScript json={contactSchemaJson} />
      <PageHeader
        title={primary?.title ? undefined : t("title")}
        titleHtml={primary?.title}
        description={primary?.description ? undefined : t("description")}
        descriptionHtml={primary?.description}
      />
      <ContactSection withLocation countryId={countryId} showSectionHeader={false} />
    </div>
  );
}
