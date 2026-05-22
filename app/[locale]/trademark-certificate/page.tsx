import TrademarkCertificatePage from "@/features/trademark/components/trademark-certificate-page";
import {
  buildPageMetadata,
  localePathname,
} from "@/lib/seo/metadata-helpers";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("trademarkCertificatePage");

  return buildPageMetadata({
    locale,
    pathname: localePathname(locale, "/trademark-certificate"),
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default function TrademarkCertificateRoutePage() {
  return <TrademarkCertificatePage />;
}
