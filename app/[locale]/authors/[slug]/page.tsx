import RelatedBlogsSection from "@/features/blogs/components/related-blogs-section";
import {
  authorRelatedBlogsToCards,
  fetchPublicAuthorBySlug,
} from "@/features/blogs/server/public-authors";
import { localePath } from "@/features/blogs/lib/blog-routes";
import { RichHtml } from "@/features/shared/components/rich-html";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parsePage(sp: Record<string, string | string[] | undefined>): number {
  const raw = typeof sp.page === "string" ? sp.page : Array.isArray(sp.page) ? sp.page[0] : "1";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await fetchPublicAuthorBySlug(slug);
  if (!author) {
    return {
      title: "Author",
      description: "Author profile",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: author.meta_title?.trim() || author.name || "Author",
    description: author.meta_description?.trim() || author.job_title || "Author profile",
    robots: { index: true, follow: true },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { slug, locale } = await params;
  const sp = searchParams ? await searchParams : {};
  const page = parsePage(sp);
  const paginationPath = localePath(locale, `/authors/${encodeURIComponent(slug)}`);
  const author = await fetchPublicAuthorBySlug(slug, { page, paginationPath });
  if (!author) redirectToNotFound();
  const tBlogs = await getTranslations("blogsPage");

  const relatedCards = authorRelatedBlogsToCards(author.related_blogs, locale);

  return (
    <div className="pt-30 space-y-12">
      <section className="container max-w-4xl">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-start">
            <div className="relative size-32 overflow-hidden rounded-full ring-4 ring-brand/30">
              <Image
                src={resolveMediaUrl(author.image || "/logo.png")}
                alt={author.image_alt || author.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
              {author.job_title ? <p className="text-brand font-semibold">{author.job_title}</p> : null}
              <RichHtml
                html={author.bio}
                className="max-w-2xl text-muted-foreground leading-relaxed [&_p]:mb-2"
              />
            </div>
          </div>
        </div>
      </section>

      <RelatedBlogsSection articles={relatedCards} />

      <section className="container max-w-6xl -mt-4 pb-6">
        <LaravelResourcePagination
          meta={author.related_blogs_meta}
          previousLabel={tBlogs("paginationPrevious")}
          nextLabel={tBlogs("paginationNext")}
          showSummary={false}
          className="justify-center"
          contentClassName="rounded-xl border border-border/60 bg-background/95 px-2 py-1 shadow-sm"
        />
      </section>
    </div>
  );
}
