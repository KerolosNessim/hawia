import { fetchPackagesSectionData } from "@/features/packages/services/packages-public-api";
import PackagesSectionClient from "@/features/home/component/packages-section-client";
import { getLocale, getTranslations } from "next-intl/server";

export default async function PackagesSection() {
  const locale = await getLocale();
  const t = await getTranslations("packagesSection");
  const sectionData = await fetchPackagesSectionData(locale);

  return (
    <PackagesSectionClient
      title={t("title")}
      empty={t("empty")}
      emptyCategory={t("emptyCategory")}
      otherTab={t("otherTab")}
      detailsFallback={t("details")}
      sectionData={sectionData}
    />
  );
}
