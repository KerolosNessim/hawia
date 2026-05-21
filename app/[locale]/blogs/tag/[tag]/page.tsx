import BlogCard from "@/features/blogs/components/blog-card";
import { BlogListPagination } from "@/features/blogs/components/blog-list-pagination";
import { blogTagHref, blogTagPath, localePath } from "@/features/blogs/lib/blog-routes";
import { buildBreadcrumbJsonLd, jsonLdScript } from "@/features/blogs/lib/json-ld";
import {
  blogToCardPayload,
  fetchPublicBlogsByTag,
} from "@/features/blogs/server/public-blogs";
import PageHeader from "@/features/shared/components/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { headers } from "next/headers";

const BLOG_LIST_PER_PAGE = 9;

type SearchParamsType = Record<string, string | string[] | undefined>;

function parsePage(sp: SearchParamsType): number {
  const raw = typeof sp.page === "string" ? sp.page : Array.isArray(sp.page) ? sp.page[0] : "1";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function decodeTagParam(tag: string): string {
  try {
    return decodeURIComponent(tag).trim();
  } catch {
    return tag.trim();
  }
}

async function absolutePath(path: string): Promise<string | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (path.startsWith("http")) return path;
  return `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;
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
  const canonicalPath = blogTagHref(locale, tagLabel, page);
  const canonical = (await absolutePath(canonicalPath)) ?? undefined;
  const title = t("tagMetaTitle", { tag: tagLabel });
  const description = t("tagMetaDescription", { tag: tagLabel });

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
  };
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

  const { blogs, meta } = await fetchPublicBlogsByTag(tagLabel, {
    paginationPath,
    page,
    per_page: BLOG_LIST_PER_PAGE,
  });

  const tagAbs =
    (await absolutePath(blogTagHref(locale, tagLabel, page > 1 ? page : 1))) ??
    localePath(locale, blogTagPath(tagLabel));
  const blogIndexAbs =
    (await absolutePath(localePath(locale, "/blogs"))) ?? localePath(locale, "/blogs");
  const homeAbs =
    (await absolutePath(localePath(locale, "/"))) ?? localePath(locale, "/");

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t("breadcrumbHome"), url: homeAbs },
    { name: t("breadcrumbBlog"), url: blogIndexAbs },
    { name: tagLabel, url: tagAbs },
  ]);

  const structuredData = jsonLdScript(breadcrumbLd);

  return (
    <div className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
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

        {blogs.length ? (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <li key={blog.id}>
                <BlogCard
                  article={blogToCardPayload(blog, locale)}
                  index={index}
                  isRtl={locale === "ar"}
                  isLight
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
            isRtl={locale === "ar"}
          />
        ) : null}
      </div>
    </div>
  );
}
