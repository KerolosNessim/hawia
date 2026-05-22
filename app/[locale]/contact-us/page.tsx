import ContactSection from "@/features/home/component/contact-section";
import PageHeader from "@/features/shared/components/page-header";
import { localePathname } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("contact");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <ContactSection withLocation />
    </div>
  );
}
