import { assignHeadingIdsToArticleHtml } from "@/features/blogs/lib/assign-heading-ids";
import { BlogTableOfContents } from "@/features/blogs/components/blog-table-of-contents";
import RelatedBlogsSection from "@/features/blogs/components/related-blogs-section";
import ShareSection from "@/features/blogs/components/share-sction";
import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import {
  blogCategoryPath,
  blogPostHref,
  blogPostPath,
  blogPostAbsoluteUrl,
  blogTagPath,
  localePath,
  pickBlogSlug,
} from "@/features/blogs/lib/blog-routes";
import { pickPrimaryBlogCategory } from "@/features/blogs/lib/pick-blog-category";
import type { BreadcrumbTrailItem } from "@/features/shared/lib/breadcrumb-trail";
import type { PublicBlogTag } from "@/features/blogs/lib/blog-tag";
import { parseFaqPairsFromRichHtml } from "@/features/shared/lib/faq-json-ld";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { buildPageMetadata, localePathsForSlug } from "@/lib/seo/metadata-helpers";
import { buildCanonicalUrl, schemaMediaUrl, serializeBlogPostSchema } from "@/lib/seo/schema";
import { Link } from "@/i18n/navigation";
import { blogExcerptPlain } from "@/features/blogs/lib/json-ld";
import RatingSection from "@/features/blogs/components/rating-section";
import { applyBlogSlugRedirect } from "@/features/blogs/lib/blog-slug-redirect";
import {
  blogToCardPayload,
  fetchPublicBlogCategories,
  fetchPublicBlogs,
  pickLocalizedRichText,
  plainTextFromHtml,
} from "@/features/blogs/server/public-blogs";
import { resolveBlogPage } from "@/features/blogs/server/resolve-blog-page";
import PageHeader from "@/features/shared/components/page-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import FaqAccordion from "@/features/shared/components/faq-accordion";
import { Calendar, Clock, HelpCircle } from "lucide-react";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import { FaStar } from "react-icons/fa";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateSingleBlogMetadata(
  locale: Locale,
  slug: string,
): Promise<Metadata> {
  const resolved = await resolveBlogPage(slug, locale);
  const tNotFound = await getTranslations("blogDetail");

  if (!resolved || resolved.kind === "gone") {
    return { title: tNotFound("notFoundTitle"), robots: { index: false, follow: false } };
  }

  if (resolved.kind === "redirect") {
    return { title: tNotFound("notFoundTitle"), robots: { index: false, follow: false } };
  }

  const blog = resolved.blog;
  const canonicalSlug = pickBlogSlug(blog, locale);

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

  const ogImages = [];
  const img = resolveMediaUrl(blog.image);
  if (img && img !== "/blog.webp") {
    ogImages.push({ url: img, alt: blog.image_alt || blog.title });
  }

  const metadata = await buildPageMetadata({
    locale,
    pathname: blogPostHref(locale, canonicalSlug),
    logicalPath: blogPostPath(canonicalSlug),
    localePaths: localePathsForSlug("/blogs", blog.slug_local, blog.slug),
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "article",
      ...(ogImages.length ? { images: ogImages } : {}),
    },
  });

  const customCanonical = blog.canonical_url?.trim();
  if (customCanonical) {
    return {
      ...metadata,
      alternates: { ...metadata.alternates, canonical: customCanonical },
    };
  }

  return metadata;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export async function SingleBlogPage({ locale, slug }: { locale: Locale; slug: string }) {
  const resolved = await resolveBlogPage(slug, locale);

  if (!resolved) redirectToNotFound();
  if (resolved.kind === "gone") redirectToNotFound();
  if (resolved.kind === "redirect") {
    applyBlogSlugRedirect(locale, resolved.toSlug, resolved.status);
  }

  const blog = resolved.blog;
  const canonicalSlug = pickBlogSlug(blog, locale);

  if (process.env.NODE_ENV === "development") {
    console.log("[SingleBlogPage]", {
      locale,
      routeSlug: slug,
      blog,
      titleRichSource: blog.titleRichSource,
      descriptionRichSource: blog.descriptionRichSource,
      subtitleRichSource: blog.subtitleRichSource,
      contentRichSource: blog.contentRichSource,
      faqRichSource: blog.faqRichSource,
    });
  }

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

  const pageUrl =
    blog.canonical_url?.trim() ||
    (await absoluteBlogUrl(locale, canonicalSlug)) ||
    undefined;

  const visibleLocale = (await getLocale()) as Locale;
  const articleLang = visibleLocale === "ar" ? "ar" : "en";
  let primaryCategory = pickPrimaryBlogCategory(blog);
  if (primaryCategory?.id && !primaryCategory.slug?.trim()) {
    const allCategories = await fetchPublicBlogCategories(locale);
    const match = allCategories.find((c) => c.id === primaryCategory!.id);
    if (match) {
      primaryCategory = {
        id: match.id,
        name: match.name || primaryCategory.name,
        slug: match.slug || primaryCategory.slug,
      };
    }
  }
  const categoryId = primaryCategory?.id;

  const related =
    categoryId != null
      ? (await fetchPublicBlogs({ blog_category_id: categoryId }))
          .filter((b) => b.id !== blog.id)
          .slice(0, 6)
          .map((b) => blogToCardPayload(b, visibleLocale))
      : [];

  const heroImage = resolveMediaUrl(blog.image);

  const localizedTitleRich =
    pickLocalizedRichText(blog.titleRichSource ?? blog.title, articleLang).trim() ||
    blog.title;
  const titleLooksLikeHtml =
    localizedTitleRich.length > 0 && /<[a-z][\s\S]*>/i.test(localizedTitleRich);
  const localizedTitle = titleLooksLikeHtml
    ? plainTextFromHtml(localizedTitleRich).trim() || blog.title
    : localizedTitleRich;
  const authorName = blog.author?.name?.trim() || blog.publisher_name || "Howeyah";
  const authorImage = resolveMediaUrl(blog.author?.image || "/logo.png");
  const authorSlug =
    blog.author?.slug?.trim() ||
    (authorName || "howeyah-team")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  const authorProfilePath = `/authors/${encodeURIComponent(authorSlug)}`;
  const localizedSubtitleHtml =
    pickLocalizedRichText(blog.subtitleRichSource ?? blog.subtitle, articleLang).trim();
  const subtitlePlainBanner = localizedSubtitleHtml
    ? plainTextFromHtml(localizedSubtitleHtml).slice(0, 280)
    : "";
  const subtitleLooksLikeHtml =
    localizedSubtitleHtml.length > 0 && /<[a-z][\s\S]*>/i.test(localizedSubtitleHtml);

  const descRich = pickLocalizedRichText(
    blog.descriptionRichSource ?? blog.description,
    articleLang,
  ).trim();
  const contentRich = pickLocalizedRichText(
    blog.contentRichSource ?? blog.content,
    articleLang,
  ).trim();

  // FAQ rich HTML for the current locale
  const localizedFaq = pickLocalizedRichText(blog.faqRichSource, articleLang).trim();
  const faqRich = (localizedFaq || blog.faq || "").trim();

  const tocRich = pickLocalizedRichText(
    blog.tableOfContentsRichSource ?? blog.table_of_contents,
    articleLang,
  ).trim();

  const tocPlacement = blog.toc_placement || "before_body";
  const showToc = blog.toc_enabled && Boolean(tocRich);
  const tocNav = showToc ? (
    <BlogTableOfContents html={tocRich} className="not-prose" />
  ) : null;

  const articleCombinedRaw =
    descRich || contentRich
      ? [
          descRich
            ? `<section class="blog-description-lead cms-rich-html mb-8 space-y-3 [&_p]:mb-3 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold">${descRich}</section>`
            : "",
          contentRich,
        ]
          .filter(Boolean)
          .join("")
      : "";

  const articleCombinedHtml = articleCombinedRaw
    ? assignHeadingIdsToArticleHtml(articleCombinedRaw, { tocHtml: tocRich || undefined })
    : "";

  const blogIndexAbs = buildCanonicalUrl(locale, "/blogs");
  const blogPostingAbs =
    pageUrl?.trim() || buildCanonicalUrl(locale, blogPostPath(canonicalSlug));
  const heroAbs = schemaMediaUrl(heroImage);
  const homeAbs = buildCanonicalUrl(locale, "/");
  const breadcrumbTrail: BreadcrumbTrailItem[] = [
    { href: "/", label: tBlogs("breadcrumbHome") },
    { href: "/blogs", label: tBlogs("breadcrumbBlog") },
  ];
  if (primaryCategory?.name) {
    const catSlug = primaryCategory.slug?.trim();
    breadcrumbTrail.push({
      href: catSlug ? blogCategoryPath(catSlug) : "/blogs",
      label: primaryCategory.name,
    });
  }
  breadcrumbTrail.push({
    href: blogPostPath(canonicalSlug),
    label: localizedTitle,
  });

  const breadcrumbLdItems = [
    { name: tBlogs("breadcrumbHome"), url: homeAbs },
    { name: tBlogs("breadcrumbBlog"), url: blogIndexAbs },
  ];
  if (primaryCategory?.name) {
    const catSlug = primaryCategory.slug?.trim();
    breadcrumbLdItems.push({
      name: primaryCategory.name,
      url: catSlug ? buildCanonicalUrl(locale, blogCategoryPath(catSlug)) : blogIndexAbs,
    });
  }
  breadcrumbLdItems.push({ name: localizedTitle, url: blogPostingAbs });

  const faqHeading = t("faqHeading");
  const faqAccordionItems =
    blog.faq_items?.length
      ? blog.faq_items
      : faqRich
        ? parseFaqPairsFromRichHtml(faqRich).map((f) => ({
            question: f.question,
            answer: f.answer,
          }))
        : [];
  const faqPairs = faqAccordionItems;

  const pageSchemaJson = serializeBlogPostSchema({
    pageUrl: blogPostingAbs,
    headline: localizedTitle,
    description: blogExcerptPlain(blog, localizedTitle),
    inLanguage: articleLang,
    datePublished: blog.published_at,
    dateModified: blog.created_at,
    imageUrls: heroAbs ? [heroAbs] : undefined,
    authorName,
    keywords: blog.tags.map((tag) => tag.label),
    articleSection: primaryCategory?.name ?? null,
    contentHtml: articleCombinedHtml,
    tagNames: blog.tags.map((tag) => tag.label),
    breadcrumbs: breadcrumbLdItems,
    faqItems: faqPairs.length ? faqPairs : undefined,
    faqName: faqPairs.length ? faqHeading : undefined,
  });

  return (
    <div className="pb-16 space-y-16">
      <PageSchemaScript json={pageSchemaJson} />

      <PageHeader
        image="/blogs-banner.jfif"
        title={titleLooksLikeHtml ? undefined : localizedTitle}
        titleHtml={titleLooksLikeHtml ? localizedTitleRich : undefined}
        description={subtitleLooksLikeHtml ? undefined : subtitlePlainBanner || undefined}
        descriptionHtml={subtitleLooksLikeHtml ? localizedSubtitleHtml : undefined}
        breadcrumbItems={breadcrumbTrail}
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
          <Link
            href={authorProfilePath}
            className="group inline-flex items-center gap-4 rounded-xl transition-colors hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 p-1"
          >
            <Image
              src={authorImage}
              width={200}
              height={200}
              alt={authorName || "Author"}
              className="size-12 rounded-full bg-white object-contain ring-2 ring-offset-2 ring-brand"
            />
            <div>
              <p className="text-gray-900 font-bold group-hover:text-brand transition-colors">
                {authorName}
              </p>
              {blog.author?.job_title || primaryCategory?.name ? (
                <p className="text-sm text-muted-foreground">
                  {blog.author?.job_title || primaryCategory?.name}
                </p>
              ) : null}
            </div>
          </Link>
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

      {showToc && tocPlacement === "after_meta" ? (
        <div className="container max-w-3xl">{tocNav}</div>
      ) : null}

      {/* ── Main article body ──────────────────────────────────────────────── */}
      <article className="container max-w-3xl space-y-6 text-gray-900">
        {showToc && tocPlacement === "before_body" ? tocNav : null}

        <RichHtml
          html={articleCombinedHtml || "<p></p>"}
          allowHorizontalScroll
          className="blog-content space-y-4 text-lg leading-relaxed [&_h1]:scroll-mt-24 [&_h1]:text-3xl [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_blockquote]:border-s-4 [&_blockquote]:border-brand [&_blockquote]:bg-muted/30 [&_blockquote]:py-2 [&_blockquote]:ps-4"
        />

        {showToc && tocPlacement === "after_body" ? tocNav : null}

      </article>

      {showToc && tocPlacement === "before_faq" ? (
        <div className="container max-w-3xl">{tocNav}</div>
      ) : null}

      {/* ── FAQ section ───────────────────────────────────────────────────── */}
      {faqAccordionItems.length ? (
        <section aria-labelledby="faq-section-heading" className="container">
          {/* Section header */}
          <div className="mb-8 flex items-center gap-3 border-b border-border pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2
              id="faq-section-heading"
              className="text-2xl font-bold text-gray-900"
            >
              {faqHeading}
            </h2>
          </div>

          <FaqAccordion
            items={faqAccordionItems.map((item, index) => ({
              id: index,
              question: item.question,
              answer: item.answer,
            }))}
            columns={faqAccordionItems.length > 1 ? 2 : 1}
          />
        </section>
      ) : null}

      <RatingSection />

      <ShareSection shareUrl={pageUrl ?? undefined} shareLabel={t("shareArticle")} />

      <RelatedBlogsSection articles={related} />

      {blog.tags.length ? (
        <section className="container max-w-3xl">
          <div className="flex flex-wrap gap-2 pt-2">
            {blog.tags.map((tag: PublicBlogTag) => (
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
      ) : null}
    </div>
  );
}
