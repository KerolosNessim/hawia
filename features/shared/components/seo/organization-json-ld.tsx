import { getSiteUrl } from "@/lib/seo/site-url";
import { getTranslations } from "next-intl/server";

const ORGANIZATION_NAME = "Howeyah";

export default async function OrganizationJsonLd({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "seo" });
  const siteUrl = getSiteUrl();
  const description = t("organizationDescription");

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION_NAME,
    alternateName: ["هوية"],
    url: siteUrl,
    logo: `${siteUrl}/logo.webp`,
    description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
