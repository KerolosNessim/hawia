import NotFoundPage from "@/features/shared/components/not-found-page";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("not-found");
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

/** Unmatched paths under a valid locale (e.g. `/random-page`). */
export default function UnmatchedRoutePage() {
  return <NotFoundPage />;
}
