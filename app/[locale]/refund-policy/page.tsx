import { getLegalPage } from "@/features/legal/services/legal";
import { LegalPageContent } from "@/features/legal/components/legal-page-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await getLegalPage("refund-policy");
    return {
      title: data.meta_title,
      description: data.meta_description,
    };
  } catch {
    return {
      title: "Refund Policy",
    };
  }
}

export default async function RefundPolicyPage() {
  const { data } = await getLegalPage("refund-policy");
  return <LegalPageContent data={data} />;
}
