import { getLegalPage } from "@/features/legal/services/legal";
import { LegalPageContent } from "@/features/legal/components/legal-page-content";
import {
  buildPageMetadata,
  localePathname,
} from "@/lib/seo/metadata-helpers";
import type { Locale } from "next-intl";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;

  try {
    const { data } = await getLegalPage("terms-of-use");
    return buildPageMetadata({
      locale,
      pathname: localePathname(locale, "/terms-of-use"),
      title: data.meta_title || "Terms of Use",
      description: data.meta_description,
    });
  } catch {
    return buildPageMetadata({
      locale,
      pathname: localePathname(locale, "/terms-of-use"),
      title: "Terms of Use",
    });
  }
}

export default async function TermsOfUsePage() {
  const { data } = await getLegalPage("terms-of-use");
  return <LegalPageContent data={data} />;
}
