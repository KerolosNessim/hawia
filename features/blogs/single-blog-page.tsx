import RelatedBlogsSection from "@/features/blogs/components/related-blogs-section";
import ShareSection from "@/features/blogs/components/share-sction";
import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { blogPostAbsoluteUrl, blogTagPath, localePath } from "@/features/blogs/lib/blog-routes";
import { Link } from "@/i18n/navigation";
import {
  blogExcerptPlain,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  jsonLdScript,
} from "@/features/blogs/lib/json-ld";
import RatingSection from "@/features/blogs/components/rating-section";
import {
  blogToCardPayload,
  fetchPublicBlogBySlug,
  fetchPublicBlogs,
  pickLocalizedRichText,
  plainTextFromHtml,
} from "@/features/blogs/server/public-blogs";
import PageHeader from "@/features/shared/components/page-header";
import { Calendar, Clock } from "lucide-react";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import { FaStar } from "react-icons/fa";

async function absoluteFromPath(path: string): Promise<string | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (path.startsWith("http")) return path;
  return `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;
}

async function absoluteBlogUrl(locale: Locale, slug: string): Promise<string | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "https";
  return blogPostAbsoluteUrl(`${proto}://${host}`, locale, slug);
}

export async function generateSingleBlogMetadata(
  locale: Locale,
  slug: string,
): Promise<Metadata> {
  const blog = await fetchPublicBlogBySlug(slug);
  const tNotFound = await getTranslations("blogDetail");

  if (!blog) {
    return { title: tNotFound("notFoundTitle"), robots: { index: false, follow: false } };
  }

  const title =
    typeof blog.meta_title === "string" && blog.meta_title.trim()
      ? blog.meta_title
      : blog.title;
  const description =
    typeof blog.meta_description === "string" && blog.meta_description.trim()
      ? blog.meta_description
      : plainTextFromHtml(
          typeof blog.description === "string" ? blog.description : String(blog.description ?? ""),
        ).slice(0, 160);

  const robots = blog.is_searchable
    ? { index: true as const, follow: true as const }
    : { index: false as const, follow: false as const, googleBot: { index: false, follow: false } };

  const canonical = blog.canonical_url?.trim()
    ? blog.canonical_url.trim()
    : (await absoluteBlogUrl(locale, slug)) ?? undefined;

  const ogImages = [];
  const img = resolveMediaUrl(blog.image);
  if (img && img !== "/blog.webp") {
    ogImages.push({ url: img, alt: blog.image_alt || blog.title });
  }

  return {
    title,
    description,
    robots,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "article",
      ...(ogImages.length ? { images: ogImages } : {}),
    },
  };
}

export async function SingleBlogPage({ locale, slug }: { locale: Locale; slug: string }) {
  const blog = await fetchPublicBlogBySlug(slug);
  if (!blog) redirectToNotFound();

  const t = await getTranslations("blogDetail");
  const tBlogs = await getTranslations("blogsPage");

  let publishedLabel = "";
  const dateSource = blog.published_at || blog.created_at;
  if (dateSource) {
    try {
      publishedLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(dateSource));
    } catch {
      publishedLabel = dateSource;
    }
  }

  const pageUrl = blog.canonical_url?.trim() || (await absoluteBlogUrl(locale, slug)) || undefined;

  const visibleLocale = (await getLocale()) as Locale;
  const articleLang = visibleLocale === "ar" ? "ar" : "en";
  const categoryId = blog.category?.id;

  const related =
    categoryId != null
      ? (await fetchPublicBlogs({ blog_category_id: categoryId }))
          .filter((b) => b.slug !== blog.slug)
          .slice(0, 6)
          .map((b) => blogToCardPayload(b, visibleLocale))
      : [];

  const heroImage = resolveMediaUrl(blog.image);

  const localizedTitle =
    pickLocalizedRichText(blog.titleRichSource ?? blog.title, articleLang).trim() || blog.title;
  const localizedSubtitleHtml =
    pickLocalizedRichText(blog.subtitleRichSource ?? blog.subtitle, articleLang).trim();
  const subtitlePlainBanner = localizedSubtitleHtml
    ? plainTextFromHtml(localizedSubtitleHtml).slice(0, 280)
    : "";
  const subtitleLooksLikeHtml =
    localizedSubtitleHtml.length > 0 && /<[a-z][\s\S]*>/i.test(localizedSubtitleHtml);

  const descRich = pickLocalizedRichText(blog.descriptionRichSource ?? blog.description, articleLang).trim();
  const contentRich = pickLocalizedRichText(blog.contentRichSource ?? blog.content, articleLang).trim();

  const articleCombinedHtml =
    descRich || contentRich
      ? [
          descRich
            ? `<section class="blog-description-lead mb-8 space-y-3 [&_p]:mb-3 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold">${descRich}</section>`
            : "",
          contentRich,
        ]
          .filter(Boolean)
          .join("")
      : "";

  const blogIndexAbs =
    (await absoluteFromPath(localePath(locale, "/blogs"))) ?? localePath(locale, "/blogs");
  const blogPostingAbs = pageUrl ?? (await absoluteBlogUrl(locale, slug)) ?? blogIndexAbs;
  const heroAbs =
    (await absoluteFromPath(heroImage)) ??
    (heroImage.startsWith("http") ? heroImage : undefined);

  const breadcrumbLd = buildBreadcrumbJsonLd([
    {
      name: tBlogs("breadcrumbHome"),
      url: (await absoluteFromPath(localePath(locale, "/"))) ?? localePath(locale, "/"),
    },
    { name: tBlogs("breadcrumbBlog"), url: blogIndexAbs },
    { name: localizedTitle, url: blogPostingAbs },
  ]);

  const postingLd = buildBlogPostingJsonLd({
    url: blogPostingAbs,
    headline: localizedTitle,
    descriptionPlain: blogExcerptPlain(blog, localizedTitle),
    datePublished: blog.published_at,
    dateModified: blog.created_at,
    imageUrl: heroAbs ?? null,
    authorName: blog.publisher_name,
    keywords: blog.tags,
    articleSection: blog.category?.name ?? null,
    inLanguage: articleLang === "ar" ? "ar" : "en",
  });

  const structuredData = jsonLdScript([breadcrumbLd, postingLd]);

  return (
    <div className="pb-16 space-y-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <PageHeader
        image="/blogs-banner.jfif"
        title={localizedTitle}
        description={subtitleLooksLikeHtml ? undefined : subtitlePlainBanner || undefined}
        descriptionHtml={subtitleLooksLikeHtml ? localizedSubtitleHtml : undefined}
      />

      <div className="lg:w-2/3 mx-auto max-lg:container space-y-8">
        <div className="relative mx-auto aspect-[16/10] max-h-[480px] w-full overflow-hidden rounded-2xl">
          <Image
            src={heroImage}
            fill
            className="object-cover"
            alt={blog.image_alt?.trim() || localizedTitle}
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              width={200}
              height={200}
              alt=""
              className="size-12 rounded-full bg-white object-contain ring-2 ring-offset-2 ring-brand"
            />
            <div>
              <p className="text-gray-900 font-bold">{blog.publisher_name}</p>
              {blog.category?.name ? (
                <p className="text-sm text-muted-foreground">{blog.category.name}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-gray-900">
            {publishedLabel ? (
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-brand" />
                <span className="font-bold">{publishedLabel}</span>
              </div>
            ) : null}
            {blog.reading_time != null ? (
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-brand" />
                <span className="font-bold">
                  {t("readingMinutes", { count: Math.max(1, blog.reading_time) })}
                </span>
              </div>
            ) : null}
            <div className="flex items-center gap-0.5" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} className="size-5 text-yellow-500" />
              ))}
            </div>
          </div>
        </div>

        {!blog.is_searchable ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t("noIndexNotice")}
          </p>
        ) : null}
      </div>

      <article className="container max-w-3xl space-y-6 text-gray-900">
        <div
          className="blog-content space-y-4 text-lg leading-relaxed [&_img]:mx-auto [&_img]:my-4 [&_img]:max-h-[480px] [&_img]:max-w-full [&_img]:rounded-xl [&_a]:font-semibold [&_a]:text-brand [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6 [&_blockquote]:border-s-4 [&_blockquote]:border-brand [&_blockquote]:bg-muted/30 [&_blockquote]:py-2 [&_blockquote]:ps-4"
          dangerouslySetInnerHTML={{
            __html: articleCombinedHtml || "<p></p>",
          }}
        />

        {blog.tags.length ? (
          <div className="flex flex-wrap gap-2 pt-6">
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                href={blogTagPath(tag)}
                className="rounded-full border border-brand bg-white px-3 py-1 text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : null}
      </article>

      <RatingSection />

      <ShareSection shareUrl={pageUrl ?? undefined} shareLabel={t("shareArticle")} />

      <RelatedBlogsSection articles={related} />
    </div>
  );
}
