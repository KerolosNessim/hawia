import { clientsIndexPath } from "@/features/clients/lib/clients-routes";
import type { PublicSolutionCategory } from "@/features/clients/services/clients-public-api";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  categories: PublicSolutionCategory[];
  activeCategorySlug: string;
  countByCategorySlug: ReadonlyMap<string, number>;
};

export default function ClientsCategoryFilter({
  categories,
  activeCategorySlug,
  countByCategorySlug,
}: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((c) => {
        const isActive = activeCategorySlug === c.slug;
        const badgeCount = countByCategorySlug.get(c.slug) ?? 0;
        return (
          <Link
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
              {badgeCount}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
