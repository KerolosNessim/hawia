import { getLegalPage } from "@/features/legal/services/legal";
import { LegalPageContent } from "@/features/legal/components/legal-page-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await getLegalPage("terms-of-use");
    return {
      title: data.meta_title,
      description: data.meta_description,
    };
  } catch {
    return {
      title: "Terms of Use",
    };
  }
}

export default async function TermsOfUsePage() {
  const { data } = await getLegalPage("terms-of-use");
  return <LegalPageContent data={data} />;
}
