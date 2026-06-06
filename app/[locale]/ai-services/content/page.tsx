import AiServicesContentPage from "@/features/ai-services/components/ai-services-content-page";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("aiServicesContentPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
  };
}

export default function Page() {
  return <AiServicesContentPage />;
}
