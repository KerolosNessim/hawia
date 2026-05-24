import BlogCard from "@/features/blogs/components/blog-card";
import BlogCategoriesFilter from "@/features/blogs/components/blog-categories-filter";
import { BlogListPagination } from "@/features/blogs/components/blog-list-pagination";
import { blogCategoryPath, blogIndexHref, localePath } from "@/features/blogs/lib/blog-routes";
import { buildBreadcrumbJsonLd, jsonLdScript } from "@/features/blogs/lib/json-ld";
import {
  blogToCardPayload,
  fetchPublicBlogCategories,
  fetchPublicBlogsPaginated,
  fetchVisibleBlogCountByCategoryId,
  plainTextFromHtml,
} from "@/features/blogs/server/public-blogs";
import PageHeader from "@/features/shared/components/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { getAbsoluteUrl } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import { BLOG_LIST_PER_PAGE } from "@/lib/seo/pagination-metadata";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

type SearchParamsType = Record<string, string | string[] | undefined>;

function parsePage(sp: SearchParamsType): number {
  const raw = typeof sp.page === "string" ? sp.page : Array.isArray(sp.page) ? sp.page[0] : "1";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function parseSearch(sp: SearchParamsType): string {
  const raw =
    typeof sp.search === "string" ? sp.search : Array.isArray(sp.search) ? sp.search[0] : "";
  return raw.trim();
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<SearchParamsType>;
}): Promise<Metadata> {
  await params;
  const t = await getTranslations("blogsPage");
  const locale = (await getLocale()) as Locale;
  const sp = searchParams ? await searchParams : {};
  const page = parsePage(sp);
  const search = parseSearch(sp);
  const pathname = blogIndexHref(locale, page > 1 ? page : 1, { search });

  const { meta } = await fetchPublicBlogsPaginated({
    paginationPath: localePath(locale, "/blogs"),
    page,
    per_page: BLOG_LIST_PER_PAGE,
    search: search || undefined,
  });

  return buildStaticPageMetadata({
    locale,
    pathname,
    pageKey: "blog",
    title: t("metaTitle"),
    description: t("metaDescription"),
    pagination: {
      currentPage: meta.current_page,
      lastPage: meta.last_page,
      hrefForPage: (p) => blogIndexHref(locale, p > 1 ? p : 1, { search }),
    },
  });
}

export default async function BlogPage(props: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<SearchParamsType>;
}) {
  await props.params;
  const t = await getTranslations("blogsPage");
  const sp = props.searchParams ? await props.searchParams : {};
  const page = parsePage(sp);
  const search = parseSearch(sp);

  const locale = (await getLocale()) as Locale;

  const [categories, visibleCountByCategoryId, { blogs, meta }] = await Promise.all([
    fetchPublicBlogCategories(locale),
    fetchVisibleBlogCountByCategoryId(),
    fetchPublicBlogsPaginated({
      paginationPath: localePath(locale, "/blogs"),
      page,
      per_page: BLOG_LIST_PER_PAGE,
      search: search || undefined,
    }),
  ]);

  const sortedCategories = [...categories].sort(
    (a, b) => Number(b.is_featured) - Number(a.is_featured),
  );

  const visibleLocale = locale;
  const cards = blogs.map((b) => ({
    article: blogToCardPayload(b, visibleLocale),
    key: String(b.id),
  }));

  const blogIndexAbs = await getAbsoluteUrl(localePath(locale, "/blogs"));
  const listAbs = await getAbsoluteUrl(blogIndexHref(locale, page, { search }));

  const breadcrumbLd = buildBreadcrumbJsonLd([
    {
      name: t("breadcrumbHome"),
      url: await getAbsoluteUrl(localePath(locale, "/")),
    },
    { name: t("breadcrumbBlog"), url: blogIndexAbs },
  ]);

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${listAbs}#webpage`,
    url: listAbs,
    name: t("title"),
    description: t("metaDescription"),
    isPartOf: { "@type": "WebSite", name: "Howeyah" },
  };

  const structuredData = jsonLdScript([breadcrumbLd, webPageLd]);

  return (
    <div className="space-y-12 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <PageHeader title={t("title")} description={t("description")} image="/blogs-banner.jfif" />

      <div className="container space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{t("categoriesHeading")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCategories.map((c) => {
              const descRaw = c.descriptionRich ?? "";
              const excerpt = descRaw ? plainTextFromHtml(descRaw).slice(0, 140) : "";
              const count = visibleCountByCategoryId.get(c.id) ?? c.blogs_count ?? 0;
              return (
                <Link
                  key={c.id}
                  href={c.slug ? blogCategoryPath(c.slug) : "/blogs"}
                  className={cn(
                    "group flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-brand/40 hover:shadow-md",
                    !c.is_searchable && "opacity-90",
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-brand">
                      {c.name}
                    </h3>
                    {c.is_featured ? (
                      <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand">
                        {t("featuredBadge")}
                      </span>
                    ) : null}
                  </div>
                  {excerpt ? (
                    <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{excerpt}</p>
                  ) : null}
                  <span className="mt-auto text-sm font-semibold text-brand">
                    {t("categoryArticleCount", { count })}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <BlogCategoriesFilter
          categories={categories}
          activeCategorySlug={null}
          allLabel={t("allCategories")}
          visibleCountByCategoryId={visibleCountByCategoryId}
          activeCategoryVisibleTotal={null}
        />

        <form
          method="get"
          action={localePath(locale, "/blogs")}
          className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center"
        >
          <label className="sr-only" htmlFor="blog-index-search">
            {t("searchLabel")}
          </label>
          <input
            id="blog-index-search"
            name="search"
            defaultValue={search}
            placeholder={t("searchPlaceholder")}
            className="flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none ring-brand/30 focus-visible:ring-2"
          />
          <Button type="submit" className="h-11 shrink-0 rounded-xl px-6">
            {t("searchSubmit")}
          </Button>
        </form>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">{t("latestPostsHeading")}</h2>
          {cards.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground text-lg">{t("empty")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {cards.map(({ article, key }, index) => (
                <BlogCard
                  key={key}
                  article={article}
                  index={index}
                  isRtl={locale === "ar"}
                  isLight
                />
              ))}
            </div>
          )}
        </section>

        <BlogListPagination
          meta={meta}
          variant="index"
          search={search}
          previousLabel={t("paginationPrevious")}
          nextLabel={t("paginationNext")}
        />
      </div>
    </div>
  );
}
