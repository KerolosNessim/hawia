import { blogTagPath } from "@/features/blogs/lib/blog-routes";
import type { ServiceArticleTag } from "@/features/services/types";
import { Link } from "@/i18n/navigation";

type Props = {
  tags: ServiceArticleTag[];
  heading?: string;
};

export default function ServiceArticleTags({ tags, heading }: Props) {
  if (!tags.length) return null;

  return (
    <section className="container" aria-labelledby={heading ? "service-article-tags" : undefined}>
      {heading ? (
        <h2 id="service-article-tags" className="mb-4 text-2xl font-bold text-brand">
          {heading}
        </h2>
      ) : null}
      <div className="flex flex-wrap justify-center gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.label}
            href={blogTagPath(tag.label)}
            className="rounded-full border border-brand bg-white px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
