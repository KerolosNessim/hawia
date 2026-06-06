import BlogCard from "@/features/blogs/components/blog-card";
import { BlogListPagination } from "@/features/blogs/components/blog-list-pagination";
import { blogTagHref, blogTagPath, localePath } from "@/features/blogs/lib/blog-routes";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { absoluteUrlFromPath, buildCanonicalUrl, serializeStaticPageSchema } from "@/lib/seo/schema";
import {
  blogToCardPayload,
  fetchPublicBlogsByTag,
} from "@/features/blogs/server/public-blogs";
import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import PageHeader from "@/features/shared/components/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { tagRobotsFromMeta } from "@/features/blogs/lib/blog-tag";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo/metadata-helpers";
import { BLOG_LIST_PER_PAGE } from "@/lib/seo/pagination-metadata";
import type { Metadata } from "next";

type SearchParamsType = Record<string, string | string[] | undefined>;

function parsePage(sp: SearchParamsType): number {
  const raw = typeof sp.page === "string" ? sp.page : Array.isArray(sp.page) ? sp.page[0] : "1";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function decodeTagParam(tag: string): string {
  return decodePathSegment(tag).trim();
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; tag: string }>;
  searchParams?: Promise<SearchParamsType>;
}): Promise<Metadata> {
  const { locale, tag: tagParam } = await params;
  const tagLabel = decodeTagParam(tagParam);
  const t = await getTranslations("blogsPage");
  const sp = searchParams ? await searchParams : {};
  const page = parsePage(sp);
  const pathname = blogTagHref(locale, tagLabel, page > 1 ? page : 1);
  const title = t("tagMetaTitle", { tag: tagLabel });
  const description = t("tagMetaDescription", { tag: tagLabel });

  const { meta, tagMeta } = await fetchPublicBlogsByTag(tagLabel, {
    paginationPath: localePath(locale, blogTagPath(tagLabel)),
    page,
    per_page: BLOG_LIST_PER_PAGE,
  });

  return buildPageMetadata({
    locale,
    pathname,
    logicalPath: blogTagPath(tagLabel),
    title,
    description,
    robots: tagRobotsFromMeta(tagMeta),
    pagination: {
      currentPage: meta.current_page,
      lastPage: meta.last_page,
      hrefForPage: (p) => blogTagHref(locale, tagLabel, p > 1 ? p : 1),
    },
  });
}

export default async function BlogTagPage(props: {
  params: Promise<{ locale: Locale; tag: string }>;
  searchParams?: Promise<SearchParamsType>;
}) {
  const { tag: tagParam } = await props.params;
  const tagLabel = decodeTagParam(tagParam);
  const t = await getTranslations("blogsPage");
  const sp = props.searchParams ? await props.searchParams : {};
  const page = parsePage(sp);
  const locale = (await getLocale()) as Locale;
  const paginationPath = localePath(locale, blogTagPath(tagLabel));

  const { blogs, meta, tagMeta } = await fetchPublicBlogsByTag(tagLabel, {
    paginationPath,
    page,
    per_page: BLOG_LIST_PER_PAGE,
  });

  const tagAbs = absoluteUrlFromPath(blogTagHref(locale, tagLabel, page > 1 ? page : 1));
  const blogIndexAbs = buildCanonicalUrl(locale, "/blogs");

  const tagSchemaJson = serializeStaticPageSchema({
    pageType: "CollectionPage",
    pageUrl: tagAbs,
    name: t("tagTitle", { tag: tagLabel }),
    description: t("tagDescription", { tag: tagLabel }),
    inLanguage: locale === "ar" ? "ar" : "en",
    breadcrumbs: [
      { name: t("breadcrumbHome"), url: buildCanonicalUrl(locale, "/") },
      { name: t("breadcrumbBlog"), url: blogIndexAbs },
      { name: tagLabel, url: tagAbs },
    ],
  });

  return (
    <div className="pb-16">
      <PageSchemaScript json={tagSchemaJson} />
      <PageHeader
        title={t("tagTitle", { tag: tagLabel })}
        description={t("tagDescription", { tag: tagLabel })}
      />
      <div className="container space-y-10 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="outline" asChild>
            <Link href="/blogs">{t("breadcrumbBlog")}</Link>
          </Button>
        </div>

        {!tagMeta.index ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t("tagNoIndexNotice")}
          </p>
        ) : null}

        {blogs.length ? (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <li key={blog.id}>
                <BlogCard
                  article={blogToCardPayload(blog, locale)}
                  index={index}
                  isRtl={locale === "ar"}
                  theme="light"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">{t("tagEmpty", { tag: tagLabel })}</p>
        )}

        {meta.last_page > 1 ? (
          <BlogListPagination
            meta={meta}
            variant="tag"
            tag={tagLabel}
            previousLabel={t("paginationPrevious")}
            nextLabel={t("paginationNext")}
          />
        ) : null}
      </div>
    </div>
  );
}
