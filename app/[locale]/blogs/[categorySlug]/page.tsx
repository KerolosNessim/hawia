import BlogCard from "@/features/blogs/components/blog-card";
import BlogCategoriesFilter from "@/features/blogs/components/blog-categories-filter";
import { BlogListPagination } from "@/features/blogs/components/blog-list-pagination";
import {
  blogCategoryHref,
  blogCategoryPath,
  blogPostHref,
  localePath,
  RESERVED_BLOG_CATEGORY_SLUGS,
} from "@/features/blogs/lib/blog-routes";
import {
  generateSingleBlogMetadata,
  SingleBlogPage,
} from "@/features/blogs/single-blog-page";
import { RichHtml } from "@/features/shared/components/rich-html";
import {
  buildBlogCategoryCollectionJsonLd,
  buildBreadcrumbJsonLd,
  categoryDescriptionPlain,
  jsonLdScript,
} from "@/features/blogs/lib/json-ld";
import {
  blogToCardPayload,
  fetchPublicBlogBySlug,
  fetchPublicBlogCategories,
  fetchPublicBlogsPaginated,
  fetchVisibleBlogCountByCategoryId,
  findPublicBlogCategoryBySlug,
} from "@/features/blogs/server/public-blogs";
import PageHeader from "@/features/shared/components/page-header";
import { Button } from "@/components/ui/button";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { getAbsoluteUrl, withHreflangAlternates } from "@/lib/seo/metadata-helpers";
import { BLOG_LIST_PER_PAGE } from "@/lib/seo/pagination-metadata";
import type { Metadata } from "next";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";

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
  params: Promise<{ locale: Locale; categorySlug: string }>;
  searchParams?: Promise<SearchParamsType>;
}): Promise<Metadata> {
  const { locale, categorySlug } = await params;
  if (RESERVED_BLOG_CATEGORY_SLUGS.has(categorySlug)) {
    return { title: "—", robots: { index: false, follow: false } };
  }

  const categories = await fetchPublicBlogCategories(locale);
  const category = findPublicBlogCategoryBySlug(categories, categorySlug);
  if (!category) {
    const blog = await fetchPublicBlogBySlug(categorySlug);
    if (blog) return generateSingleBlogMetadata(locale, categorySlug);
    return { title: "—", robots: { index: false, follow: false } };
  }

  const title =
    (category.meta_title && category.meta_title.trim()) || `${category.name} | Blog`;
  const description =
    (category.meta_description && category.meta_description.trim()) ||
    categoryDescriptionPlain(category).slice(0, 160);

  const robots = category.is_searchable
    ? { index: true as const, follow: true as const }
    : { index: false as const, follow: false as const, googleBot: { index: false, follow: false } };

  const sp = searchParams ? await searchParams : {};
  const page = parsePage(sp);
  const search = parseSearch(sp);
  const pathname = blogCategoryHref(locale, categorySlug, page > 1 ? page : 1, { search });

  const paginationBase = localePath(locale, `/blogs/${encodeURIComponent(category.slug)}`);
  const { meta } = await fetchPublicBlogsPaginated({
    paginationPath: paginationBase,
    page,
    per_page: BLOG_LIST_PER_PAGE,
    blog_category_id: category.id,
    search: search || undefined,
  });

  return withHreflangAlternates(
    {
      title,
      description,
      robots,
      openGraph: {
        title,
        description,
        locale: locale === "ar" ? "ar_SA" : "en_US",
        type: "website",
      },
    },
    {
      pathname,
      logicalPath: blogCategoryPath(categorySlug),
      pagination: {
        currentPage: meta.current_page,
        lastPage: meta.last_page,
        hrefForPage: (p) =>
          blogCategoryHref(locale, categorySlug, p > 1 ? p : 1, { search }),
      },
    },
  );
}

export default async function BlogCategoryPage(props: {
  params: Promise<{ locale: Locale; categorySlug: string }>;
  searchParams?: Promise<SearchParamsType>;
}) {
  const { locale, categorySlug } = await props.params;
  const sp = props.searchParams ? await props.searchParams : {};
  const page = parsePage(sp);
  const search = parseSearch(sp);

  if (RESERVED_BLOG_CATEGORY_SLUGS.has(categorySlug)) {
    redirectToNotFound();
  }

  const categories = await fetchPublicBlogCategories(locale);
  const category = findPublicBlogCategoryBySlug(categories, categorySlug);

  if (!category) {
    const blog = await fetchPublicBlogBySlug(categorySlug);
    if (process.env.NODE_ENV === "development") {
      console.log("[BlogCategoryPage] post route", {
        locale,
        categorySlug,
        blog,
      });
    }
    if (blog) {
      return <SingleBlogPage locale={locale} slug={blog.slug} />;
    }
    redirectToNotFound();
  }

  const t = await getTranslations("blogsPage");
  const visibleLocale = (await getLocale()) as Locale;

  const paginationBase = localePath(locale, `/blogs/${encodeURIComponent(category.slug)}`);
  /** Prefer numeric id: avoids query-string issues with Unicode slugs; matches Postman `blog_category_id`. */
  const { blogs, meta } = await fetchPublicBlogsPaginated({
    paginationPath: paginationBase,
    page,
    per_page: BLOG_LIST_PER_PAGE,
    blog_category_id: category.id,
    search: search || undefined,
  });

  const visibleCountByCategoryId = await fetchVisibleBlogCountByCategoryId();

  const cards = blogs.map((b) => ({
    article: blogToCardPayload(b, visibleLocale),
    key: String(b.id),
  }));

  const blogIndexAbs = await getAbsoluteUrl(localePath(locale, "/blogs"));
  const categoryAbs = await getAbsoluteUrl(
    blogCategoryHref(locale, category.slug, page, { search }),
  );

  const blogItems = await Promise.all(
    blogs.map(async (b) => ({
      title: blogToCardPayload(b, visibleLocale).title,
      url: await getAbsoluteUrl(blogPostHref(locale, b.slug)),
      image: b.image,
      datePublished: b.published_at,
    })),
  );

  const breadcrumbLd = buildBreadcrumbJsonLd([
    {
      name: t("breadcrumbHome"),
      url: await getAbsoluteUrl(localePath(locale, "/")),
    },
    { name: t("breadcrumbBlog"), url: blogIndexAbs },
    { name: category.name, url: categoryAbs },
  ]);

  const collectionLds = buildBlogCategoryCollectionJsonLd({
    name: category.name,
    descriptionPlain: categoryDescriptionPlain(category),
    url: categoryAbs,
    blogItems,
  });

  const structuredData = jsonLdScript([breadcrumbLd, ...collectionLds]);

 
  return (
    <div className="space-y-12 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <PageHeader
        title={category.name}
        description={undefined}
        image="/blogs-banner.jfif"
      />

      <div className="container space-y-8">
        <BlogCategoriesFilter
          categories={categories}
          activeCategorySlug={category.slug}
          allLabel={t("allCategories")}
          visibleCountByCategoryId={visibleCountByCategoryId}
          activeCategoryVisibleTotal={meta.total}
        />

        <form
          method="get"
          action={localePath(locale, `/blogs/${encodeURIComponent(category.slug)}`)}
          className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center"
        >
          <label className="sr-only" htmlFor="blog-cat-search">
            {t("searchLabel")}
          </label>
          <input
            id="blog-cat-search"
            name="search"
            defaultValue={search}
            placeholder={t("searchPlaceholder")}
            className="flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none ring-brand/30 focus-visible:ring-2"
          />
          <Button type="submit" className="h-11 shrink-0 rounded-xl px-6">
            {t("searchSubmit")}
          </Button>
        </form>

        {category.descriptionRich ? (
          <RichHtml
            html={category.descriptionRich}
            className="max-w-3xl rounded-2xl border border-border/60 bg-muted/20 px-6 py-5 text-foreground [&_h2]:mt-4 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h3]:mt-3 [&_h3]:text-xl"
          />
        ) : null}

        {!category.is_searchable ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t("categoryNoIndexNotice")}
          </p>
        ) : null}

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

        <BlogListPagination
          meta={meta}
          variant="category"
          categorySlug={category.slug}
          search={search}
          previousLabel={t("paginationPrevious")}
          nextLabel={t("paginationNext")}
        />
      </div>
    </div>
  );
}
