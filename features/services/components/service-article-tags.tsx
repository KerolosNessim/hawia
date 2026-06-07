import { blogTagPath } from "@/features/blogs/lib/blog-routes";
import type { ServiceArticleTag, SingleService } from "@/features/services/types";import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  tags: ServiceArticleTag[];
  heading?: string;
  className?: string;
};

export function resolveServiceArticleTags(service: SingleService): ServiceArticleTag[] {
  if (service.articleTags.length > 0) return service.articleTags;
  const section = service.pageSections.find((item) => item.key === "articleTags");
  if (!section || !Array.isArray(section.data)) return [];
  return section.data as ServiceArticleTag[];
}

export default function ServiceArticleTags({ tags, heading, className }: Props) {
  if (!tags.length) return null;

  return (
    <section
      className={cn("container max-w-3xl", className)}
      aria-labelledby={heading ? "service-article-tags" : undefined}
    >
   
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {tags.map((tag) => (
          <Link
            key={tag.label}
            href={blogTagPath(tag.label)}
            rel={tag.follow ? undefined : "nofollow"}
            className="rounded-full border border-brand bg-white px-3 py-1 text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
