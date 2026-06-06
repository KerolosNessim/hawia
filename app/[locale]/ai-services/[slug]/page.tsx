import { redirect } from "@/i18n/navigation";
import type { Locale } from "next-intl";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/** AI services render on `/ai-services` only — legacy slug URLs redirect there. */
export default async function AiServiceSlugRedirectPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/ai-services", locale });
}
