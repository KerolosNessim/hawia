"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PackagesSectionPayload } from "@/features/packages/services/packages-public-api";
import { PublicPackageCardGrid } from "@/features/packages/components/public-package-cards";
import SectionHeader from "@/features/shared/components/section-header";

type Props = {
  title: string;
  empty: string;
  emptyCategory: string;
  otherTab: string;
  detailsFallback: string;
  sectionData: PackagesSectionPayload;
};

export default function PackagesSectionClient({
  title,
  empty,
  emptyCategory,
  otherTab,
  detailsFallback,
  sectionData,
}: Props) {
  const { categories, packagesByCategoryId, uncategorized } = sectionData;

  const onlyOrphans = categories.length === 0 && uncategorized.length > 0;
  const nothing = categories.length === 0 && uncategorized.length === 0;

  if (nothing) {
    return (
      <section className="py-16 space-y-8">
        <SectionHeader title={title} />
        <p className="text-center text-muted-foreground">{empty}</p>
      </section>
    );
  }

  if (onlyOrphans) {
    return (
      <section className="py-16 space-y-8">
        <SectionHeader title={title} />
        <PublicPackageCardGrid
          items={uncategorized}
          detailsFallback={detailsFallback}
          emptyHint={empty}
        />
      </section>
    );
  }

  const firstWithPackages = categories.find(
    (c) => (packagesByCategoryId[c.id] ?? []).length > 0,
  );
  const defaultTab =
    firstWithPackages?.id ??
    (uncategorized.length > 0 ? "__other__" : categories[0]?.id ?? "__other__");

  return (
    <section className="py-16 space-y-8">
      <SectionHeader title={title} />
      <Tabs defaultValue={defaultTab} className="w-full flex flex-col items-center max-md:gap-12 static">
        <TabsList className="flex flex-wrap justify-center mb-26 md:mb-12 gap-2 bg-transparent h-auto">
          {categories.map((c) => (
            <TabsTrigger
              key={c.id}
              value={c.id}
              className="md:text-base text-sm h-12 px-6 rounded-full data-[state=active]:bg-brand data-[state=active]:text-white bg-gray-900 text-white hover:bg-brand hover:text-white transition duration-300 shadow-sm"
            >
              {c.title}
            </TabsTrigger>
          ))}
          {uncategorized.length > 0 ? (
            <TabsTrigger
              value="__other__"
              className="md:text-base text-sm h-12 px-6 rounded-full data-[state=active]:bg-brand data-[state=active]:text-white bg-gray-900 text-white hover:bg-brand hover:text-white transition duration-300 shadow-sm"
            >
              {otherTab}
            </TabsTrigger>
          ) : null}
        </TabsList>

        {categories.map((c) => (
          <TabsContent key={c.id} value={c.id} className="w-full">
            <PublicPackageCardGrid
              items={packagesByCategoryId[c.id] ?? []}
              detailsFallback={detailsFallback}
              emptyHint={emptyCategory}
            />
          </TabsContent>
        ))}

        {uncategorized.length > 0 ? (
          <TabsContent value="__other__" className="w-full">
            <PublicPackageCardGrid
              items={uncategorized}
              detailsFallback={detailsFallback}
              emptyHint={emptyCategory}
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </section>
  );
}
