import ContactSection from "@/features/home/component/contact-section";
import PageHeader from "@/features/shared/components/page-header";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { localePathname } from "@/lib/seo/metadata-helpers";
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

  return buildStaticPageMetadata({
    locale: loc,
    pathname: localePathname(loc, "/contact-us"),
    pageKey: "contact-us",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ContactUsPage({ params }: Props) {
  await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("contact");
  const tSeo = await getTranslations({ locale, namespace: "seo.breadcrumb" });
  const pageUrl = buildCanonicalUrl(locale, "/contact-us");
  const contactSchemaJson = serializeStaticPageSchema({
    pageType: "ContactPage",
    pageUrl,
    name: t("title"),
    description: t("description"),
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
      <PageHeader title={t("title")} description={t("description")} />
      <ContactSection withLocation />
    </div>
  );
}
