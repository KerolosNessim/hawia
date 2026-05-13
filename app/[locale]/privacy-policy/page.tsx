import { getLegalPage } from "@/features/legal/services/legal";
import { LegalPageContent } from "@/features/legal/components/legal-page-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await getLegalPage("privacy-policy");
    return {
      title: data.meta_title,
      description: data.meta_description,
    };
  } catch {
    return {
      title: "Privacy Policy",
    };
  }
}

export default async function PrivacyPolicyPage() {
  const { data } = await getLegalPage("privacy-policy");
  return <LegalPageContent data={data} />;
}
