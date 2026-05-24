import RelatedBlogsSection from "@/features/blogs/components/related-blogs-section";
import ShareSection from "@/features/blogs/components/share-sction";
import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { blogPostHref, blogPostPath, blogPostAbsoluteUrl, blogTagPath, localePath } from "@/features/blogs/lib/blog-routes";
import { buildPageMetadata } from "@/lib/seo/metadata-helpers";
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
import { RichHtml } from "@/features/shared/components/rich-html";
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
// FAQ JSON-LD builder
// ---------------------------------------------------------------------------

/**
 * Parses the FAQ rich HTML and builds a Google-compliant FAQPage JSON-LD block.
 *
 * Convention: every <h2> (or <h3>) is treated as a question and the next
 * sibling block-level content up to the following heading is the answer.
 *
 * Falls back to treating every <p> as an answer to the previous heading if
 * the content doesn't follow the heading structure.
 */
function buildFaqJsonLd(faqHtml: string): object | null {
  if (!faqHtml.trim()) return null;

  // Strip tags helper — keeps text content only
  const strip = (html: string) =>
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

  // Split on heading tags to extract Q/A pairs
  const headingRegex = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi;
  const pairs: Array<{ question: string; answer: string }> = [];

  const parts = faqHtml.split(headingRegex);
  // parts[0] = content before first heading (skip)
  // parts[1,3,5...] = heading inner HTML (question)
  // parts[2,4,6...] = content after heading until next heading (answer)

  for (let i = 1; i < parts.length; i += 2) {
    const question = strip(parts[i] ?? "");
    const answerHtml = parts[i + 1] ?? "";
    const answer = strip(answerHtml);
    if (question && answer) {
      pairs.push({ question, answer });
    }
  }

  if (pairs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

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

  const ogImages = [];
  const img = resolveMediaUrl(blog.image);
  if (img && img !== "/blog.webp") {
    ogImages.push({ url: img, alt: blog.image_alt || blog.title });
  }

  const metadata = await buildPageMetadata({
    locale,
    pathname: blogPostHref(locale, slug),
    logicalPath: blogPostPath(slug),
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
  const blog = await fetchPublicBlogBySlug(slug);

  if (process.env.NODE_ENV === "development") {
    console.log("[SingleBlogPage]", {
      locale,
      routeSlug: slug,
      blog,
      titleRichSource: blog?.titleRichSource,
      descriptionRichSource: blog?.descriptionRichSource,
      subtitleRichSource: blog?.subtitleRichSource,
      contentRichSource: blog?.contentRichSource,
      faqRichSource: blog?.faqRichSource,
    });
  }

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

  const pageUrl =
    blog.canonical_url?.trim() || (await absoluteBlogUrl(locale, slug)) || undefined;

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

  const descRich = pickLocalizedRichText(
    blog.descriptionRichSource ?? blog.description,
    articleLang,
  ).trim();
  const contentRich = pickLocalizedRichText(
    blog.contentRichSource ?? blog.content,
    articleLang,
  ).trim();

  // FAQ rich HTML for the current locale
  const faqRich = pickLocalizedRichText(
    blog.faqRichSource ?? blog.faq,
    articleLang,
  ).trim();

  const articleCombinedHtml =
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

  const blogIndexAbs =
    (await absoluteFromPath(localePath(locale, "/blogs"))) ?? localePath(locale, "/blogs");
  const blogPostingAbs =
    pageUrl ?? (await absoluteBlogUrl(locale, slug)) ?? blogIndexAbs;
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

  // Build FAQ JSON-LD only when FAQ content exists
  const faqLd = faqRich ? buildFaqJsonLd(faqRich) : null;

  const allLdBlocks = [breadcrumbLd, postingLd, ...(faqLd ? [faqLd] : [])];
  const structuredData = jsonLdScript(allLdBlocks);

  // Translation keys with sensible fallbacks
  const faqHeading =
    articleLang === "ar"
      ? t("faqHeading", { defaultValue: "الأسئلة الشائعة" })
      : t("faqHeading", { defaultValue: "Frequently Asked Questions" });

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

      {/* ── Main article body ──────────────────────────────────────────────── */}
      <article className="container max-w-3xl space-y-6 text-gray-900">
        <RichHtml
          html={articleCombinedHtml || "<p></p>"}
          className="blog-content space-y-4 text-lg leading-relaxed [&_h1]:scroll-mt-24 [&_h1]:text-3xl [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_blockquote]:border-s-4 [&_blockquote]:border-brand [&_blockquote]:bg-muted/30 [&_blockquote]:py-2 [&_blockquote]:ps-4"
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

      {/* ── FAQ section ───────────────────────────────────────────────────── */}
      {faqRich ? (
        <section
          aria-labelledby="faq-section-heading"
          className="container max-w-3xl"
          // Signal to Google's crawler that this section contains FAQ content
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          {/* Section header */}
          <div className="mb-8 flex items-center gap-3 border-b border-border pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2
              id="faq-section-heading"
              className="text-2xl font-bold text-gray-900"
            >
              {faqHeading}
            </h2>
          </div>

          {/* Rich HTML FAQ content — styles mirror the article body but add
              question/answer visual treatment via heading + paragraph targets */}
          <RichHtml
            html={faqRich}
            className={[
              "faq-content space-y-0 text-base leading-relaxed text-gray-800",
              // Question headings get a distinct left accent and bold weight
              "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:scroll-mt-24 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900",
              "[&_h2]:border-s-4 [&_h2]:border-violet-400 [&_h2]:ps-4",
              "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:scroll-mt-24 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-gray-900",
              "[&_h3]:border-s-4 [&_h3]:border-violet-300 [&_h3]:ps-4",
              // Answer paragraphs get left padding to align with headings
              "[&_p]:ps-4 [&_p]:mb-3 [&_p]:text-muted-foreground",
              // Lists inside answers
              "[&_ul]:ps-8 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:text-muted-foreground",
              "[&_ol]:ps-8 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:text-muted-foreground",
              // Links
              "[&_a]:font-semibold [&_a]:text-brand [&_a]:underline-offset-2 [&_a]:hover:underline",
              // Strong
              "[&_strong]:font-semibold [&_strong]:text-gray-900",
            ].join(" ")}
          />
        </section>
      ) : null}

      <RatingSection />

      <ShareSection shareUrl={pageUrl ?? undefined} shareLabel={t("shareArticle")} />

      <RelatedBlogsSection articles={related} />
    </div>
  );
}