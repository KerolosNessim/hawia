import TrademarkCertificatePage from "@/features/trademark/components/trademark-certificate-page";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trademarkCertificatePage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
  };
}

export default function TrademarkCertificateRoutePage() {
  return <TrademarkCertificatePage />;
}
