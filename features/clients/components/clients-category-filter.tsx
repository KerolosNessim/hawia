"use client";

import { clientsIndexPath } from "@/features/clients/lib/clients-routes";
import type { PublicSolutionCategory } from "@/features/clients/services/clients-public-api";
import { CountryLink } from "@/features/shared/components/country-link";
import { cn } from "@/lib/utils";

type CategoryWithCount = {
  category: PublicSolutionCategory;
  count: number;
};

type Props = {
  items: CategoryWithCount[];
  activeCategorySlug: string;
};

export default function ClientsCategoryFilter({
  items,
  activeCategorySlug,
}: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map(({ category: c, count }) => {
        const isActive = activeCategorySlug === c.slug;
        return (
          <CountryLink
            key={c.id}
            href={clientsIndexPath({ categorySlug: c.slug })}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "border-brand bg-brand text-white"
                : "border-border bg-white text-foreground hover:border-brand/50",
            )}
          >
            {c.name}
            <span className="ms-1.5 rounded-md bg-black/10 px-1.5 py-px text-[11px] font-bold tabular-nums">
              {count}
            </span>
          </CountryLink>
        );
      })}
    </div>
  );
}
