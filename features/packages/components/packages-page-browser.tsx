"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicPackageCardGrid } from "@/features/packages/components/public-package-cards";
import type { PackagesSectionPayload, PublicPackageCategory } from "@/features/packages/services/packages-public-api";
import { cn } from "@/lib/utils";

type Props = {
  categoriesHeading: string;
  detailsFallback: string;
  emptyHint: string;
  emptyCategoryHint: string;
  otherTabLabel: string;
  sectionData: PackagesSectionPayload;
};

const categoryTriggerClassName =
  "rounded-full border px-5 py-2 text-sm font-semibold transition-colors h-auto";

function defaultPackagesPageCategoryId(
  categories: PublicPackageCategory[],
): string {
  const seoCategory = categories.find(
    (category) =>
      category.slugEn.toLowerCase() === "seo" || /seo/i.test(category.title),
  );
  return seoCategory?.id ?? categories[0]?.id ?? "__other__";
}

export default function PackagesPageBrowser({
  categoriesHeading,
  detailsFallback,
  emptyHint,
  emptyCategoryHint,
  otherTabLabel,
  sectionData,
}: Props) {
  const { categories, packagesByCategoryId, uncategorized } = sectionData;

  if (categories.length === 0 && uncategorized.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">{emptyHint}</p>
    );
  }

  if (categories.length === 0) {
    return (
      <PublicPackageCardGrid
        items={uncategorized}
        detailsFallback={detailsFallback}
        emptyHint={emptyHint}
      />
    );
  }

  const defaultTab = defaultPackagesPageCategoryId(categories);

  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{categoriesHeading}</h2>
        <Tabs defaultValue={defaultTab} className="w-full space-y-10">
          <TabsList className="flex h-auto flex-wrap justify-start gap-3 bg-transparent p-0">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={cn(
                  categoryTriggerClassName,
                  "border-brand/30 bg-brand/5 text-brand hover:bg-brand hover:text-white",
                  "data-[state=active]:border-brand data-[state=active]:bg-brand data-[state=active]:text-white",
                )}
              >
                {category.title}
              </TabsTrigger>
            ))}
            {uncategorized.length > 0 ? (
              <TabsTrigger
                value="__other__"
                className={cn(
                  categoryTriggerClassName,
                  "border-brand/30 bg-brand/5 text-brand hover:bg-brand hover:text-white",
                  "data-[state=active]:border-brand data-[state=active]:bg-brand data-[state=active]:text-white",
                )}
              >
                {otherTabLabel}
              </TabsTrigger>
            ) : null}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <PublicPackageCardGrid
                items={packagesByCategoryId[category.id] ?? []}
                detailsFallback={detailsFallback}
                emptyHint={emptyCategoryHint}
              />
            </TabsContent>
          ))}

          {uncategorized.length > 0 ? (
            <TabsContent value="__other__" className="mt-0">
              <PublicPackageCardGrid
                items={uncategorized}
                detailsFallback={detailsFallback}
                emptyHint={emptyCategoryHint}
              />
            </TabsContent>
          ) : null}
        </Tabs>
      </div>
    </section>
  );
}
