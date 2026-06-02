import CareersPage from "@/features/careers/components/careers-page";
import type { Metadata } from "next";
import { getJobsHeaderPublicByLocale } from "@/features/careers/api/jobsPublicApi";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const lang = locale.startsWith("ar") ? "ar" : "en";

  try {
    const header = await getJobsHeaderPublicByLocale(lang);
    const title = plainTextFromHtml(header?.seo.meta_title || header?.content.title || "");
    const description = plainTextFromHtml(
      header?.seo.meta_description || header?.content.description || ""
    );
    return {
      title: title || "Careers | Howeyah",
      description: description || "Open career opportunities at Howeyah.",
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: "Careers | Howeyah",
      description: "Open career opportunities at Howeyah.",
      robots: { index: true, follow: true },
    };
  }
}

export default function CareersRoutePage() {
  return <CareersPage />;
}

