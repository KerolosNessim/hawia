import { Link } from "@/i18n/navigation";
import type { PublicBlogCategory } from "@/features/blogs/server/public-blogs";
import { cn } from "@/lib/utils";

type Props = {
  categories: PublicBlogCategory[];
  activeCategoryId: number | null;
  allLabel: string;
  /**
   * Public-visible blogs per leaf `category.id` (same rules as `/v1/blogs` + `isPublicBlogVisible`).
   * Badges ignore API `blogs_count`, which often includes drafts / unpublished / inactive.
   */
  visibleCountByCategoryId: ReadonlyMap<number, number>;
  /** Matches the filtered list rendered below (server may include subtree semantics). */
  activeCategoryVisibleTotal: number | null;
};

export default function BlogCategoriesFilter({
  categories,
  activeCategoryId,
  allLabel,
  visibleCountByCategoryId,
  activeCategoryVisibleTotal,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blogs"
        className={cn(
          "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
          activeCategoryId == null
            ? "border-brand bg-brand text-white"
            : "border-border bg-white text-foreground hover:border-brand/50",
        )}
      >
        {allLabel}
      </Link>
      {categories.map((c) => {
        const isActive = activeCategoryId === c.id;
        const badgeCount = isActive
          ? (activeCategoryVisibleTotal ?? visibleCountByCategoryId.get(c.id) ?? 0)
          : (visibleCountByCategoryId.get(c.id) ?? 0);
        return (
          <Link
            key={c.id}
            href={{ pathname: "/blogs", query: { category: String(c.id) } }}
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
