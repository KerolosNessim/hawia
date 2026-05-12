import BlogCard from "@/features/blogs/components/blog-card";
import BlogCategoriesFilter from "@/features/blogs/components/blog-categories-filter";
import {
  blogToCardPayload,
  fetchPublicBlogCategories,
  fetchPublicBlogs,
} from "@/features/blogs/server/public-blogs";
import PageHeader from "@/features/shared/components/page-header";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type SearchParamsType = Record<string, string | string[] | undefined>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blogsPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
  };
}

export default async function BlogPage(props: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<SearchParamsType>;
}) {
  await props.params;
  const t = await getTranslations("blogsPage");

  const sp = props.searchParams ? await props.searchParams : {};
  const rawCat =
    typeof sp.category === "string" ? sp.category : Array.isArray(sp.category) ? sp.category[0] : "";
  const activeCategoryId = /^\d+$/.test(rawCat) ? Number.parseInt(rawCat, 10) : null;

  const locale = (await getLocale()) as Locale;

  const filteredQuery =
    activeCategoryId != null ? { blog_category_id: activeCategoryId } : null;

  const [categories, allVisibleBlogs, categoryFiltered] = await Promise.all([
    fetchPublicBlogCategories(locale),
    fetchPublicBlogs(),
    filteredQuery ? fetchPublicBlogs(filteredQuery) : Promise.resolve(null),
  ]);

  const blogs = filteredQuery ? categoryFiltered! : allVisibleBlogs;

  const visibleCountByCategoryId = new Map<number, number>();
  for (const b of allVisibleBlogs) {
    const cid = b.category?.id;
    if (cid == null || !Number.isFinite(cid)) continue;
    visibleCountByCategoryId.set(cid, (visibleCountByCategoryId.get(cid) ?? 0) + 1);
  }

  const cards = blogs.map((b) => ({
    article: blogToCardPayload(b, locale),
    key: String(b.id),
  }));

  const activeCategory =
    activeCategoryId != null ? categories.find((c) => c.id === activeCategoryId) : undefined;

  return (
    <div className="space-y-12 pb-16">
      <PageHeader title={t("title")} description={t("description")} image="/blogs-banner.jfif" />
      <div className="container space-y-8">
        <BlogCategoriesFilter
          categories={categories}
          activeCategoryId={activeCategoryId}
          allLabel={t("allCategories")}
          visibleCountByCategoryId={visibleCountByCategoryId}
          activeCategoryVisibleTotal={activeCategoryId != null ? blogs.length : null}
        />

        {activeCategory?.descriptionRich ? (
          <div
            className="max-w-3xl rounded-2xl border border-border/60 bg-muted/20 px-6 py-5 text-foreground [&_a]:font-semibold [&_a]:text-brand [&_h2]:mt-4 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:mx-auto [&_img]:my-3 [&_img]:max-h-[400px] [&_img]:max-w-full [&_img]:rounded-xl [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-6"
            dir={locale === "ar" ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{ __html: activeCategory.descriptionRich }}
          />
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
      </div>
    </div>
  );
}
