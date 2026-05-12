import PageHeader from "@/features/shared/components/page-header";
import { PublicPackageCardGrid } from "@/features/packages/components/public-package-cards";
import { fetchPublicPackages } from "@/features/packages/services/packages-public-api";
import { getLocale, getTranslations } from "next-intl/server";

export default async function PackagesPage() {
  const locale = await getLocale();
  const t = await getTranslations("packagesPage");
  const detail = await getTranslations("packagesSection");
  const items = await fetchPublicPackages(locale);

  return (
    <div className="space-y-16 pb-16">
      <PageHeader title={t("title")} description={t("description")} image="/hero-bg.webp" />
      <div className="container mx-auto px-4">
        <PublicPackageCardGrid
          items={items}
          detailsFallback={detail("details")}
          emptyHint={t("empty")}
        />
      </div>
    </div>
  );
}
