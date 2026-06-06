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
    const { data } = await getLegalPage("privacy-policy");
    return buildPageMetadata({
      locale,
      pathname: localePathname(locale, "/privacy-policy"),
      title: data.meta_title || "Privacy Policy",
      description: data.meta_description,
    });
  } catch {
    return buildPageMetadata({
      locale,
      pathname: localePathname(locale, "/privacy-policy"),
      title: "Privacy Policy",
    });
  }
}

export default async function PrivacyPolicyPage() {
  const { data } = await getLegalPage("privacy-policy");
  return <LegalPageContent data={data} />;
}
