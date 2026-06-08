"use client";

import { Button } from "@/components/ui/button";
import SiteBreadcrumb from "@/features/shared/components/site-breadcrumb";
import type { BreadcrumbTrailItem } from "@/features/shared/lib/breadcrumb-trail";
import { Link } from "@/i18n/navigation";
import { enhanceCmsHtml } from "@/lib/inline-image-alt";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";
import { useLocale } from "next-intl";
import { useMemo } from "react";

export type PageHeaderAction = {
  label: string;
  href: string;
  external?: boolean;
};

interface PageHeaderProps {
  /** Plain fallback when `titleHtml` is empty. */
  title?: string;

  /** CMS HTML title (rich text from admin). Renders as-is when set. */
  titleHtml?: string;

  description?: string;

  /** CMS HTML (e.g. rich subtitle). Takes precedence over plain `description` when set. */
  descriptionHtml?: string;

  image?: string;

  /** Accessible alt text for the background image */
  imageAlt?: string;

  /** When true, title is hidden and description is shown as the main hero heading. */
  descriptionAsHeader?: boolean;

  /** Custom breadcrumb trail (e.g. blog post: Home › Blog › Category › Title). */
  breadcrumbItems?: BreadcrumbTrailItem[];

  /** Optional CTA below the hero title/description (e.g. AI tools on `/ai-services`). */
  action?: PageHeaderAction;
  align?: "center" | "start";
}

/** Hero title — compact on mobile, large on desktop (matches legacy blog hero). */
const titleSizeClass =
  "max-w-6xl text-xl font-bold leading-snug text-brand sm:text-2xl md:text-3xl md:leading-tight lg:text-4xl ";

const titleRichClass = cn(
  "cms-rich-html font-bold leading-snug text-brand",
  titleSizeClass,
  "[&_*]:text-inherit [&_*]:leading-inherit",
  "lg:[&_*]:!text-inherit lg:[&_*]:!leading-inherit",
  "[&_p]:mb-0 [&_strong]:font-bold",
  "[&_h1]:text-inherit [&_h2]:text-inherit [&_h3]:text-inherit",
);

const titlePlainClass = titleSizeClass;

/** Subtitle ~25–30% of title scale on large screens */
const descriptionSizeClass =
  "mt-2 max-w-3xl text-sm text-white sm:mt-3 sm:text-base md:mt-4 md:text-lg lg:mt-5  ";

const descriptionRichClass = cn(
  "cms-rich-html",
  descriptionSizeClass,
  "[&_p]:mb-1 sm:[&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold",
  "[&_*]:text-inherit lg:[&_*]:!text-inherit",
);

function inlineTitleHtml(html: string): string {
  return html
    .replace(/<\/?(?:h[1-6]|p|div)[^>]*>/gi, "")
    .trim();
}

export default function PageHeader({
  title,
  titleHtml,
  description,
  descriptionHtml,
  image = "/seo-banner.jpg",
  imageAlt = "Page header background",
  descriptionAsHeader = false,
  breadcrumbItems,
  action,
  align = "start",
}: PageHeaderProps) {
  const locale = useLocale();
  const hasRichTitle = Boolean(titleHtml?.trim());
  const hasRichDescription = Boolean(descriptionHtml?.trim());

  const enhancedTitleHtml = useMemo(
    () =>
      titleHtml?.trim() ? inlineTitleHtml(enhanceCmsHtml(titleHtml, locale)) : "",
    [titleHtml, locale],
  );
  const enhancedDescriptionHtml = useMemo(
    () => (descriptionHtml?.trim() ? enhanceCmsHtml(descriptionHtml, locale) : ""),
    [descriptionHtml, locale],
  );

  const showTitle = !descriptionAsHeader;

  const headerHtml = descriptionAsHeader ? enhancedDescriptionHtml || undefined : undefined;
  const headerTitleHtml = headerHtml ? inlineTitleHtml(headerHtml) : undefined;

  const headerPlain = descriptionAsHeader
    ? description?.trim()
    : undefined;

  const showDescriptionBelow =
    !descriptionAsHeader &&
    (hasRichDescription || Boolean(description?.trim()));

  return (
    <section
      data-slot="page-header"
      className={cn(
        "relative isolate z-[1] flex flex-col overflow-hidden bg-black",
        /* Mobile: min height + grow with content; desktop: fixed hero height */
        "min-h-[50vh] md:min-h-0 md:h-[40vh] lg:h-[60vh]",
      )}
    >
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "/hero-bg.webp";
        }}
      />

      <div className="absolute inset-0 z-[1] bg-black/70" aria-hidden />

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="container py-1.5 sm:py-2 md:py-3">
          <SiteBreadcrumb
            variant="hero"
            items={breadcrumbItems}
            className="max-w-full text-xs sm:text-sm [&_[data-slot=breadcrumb-link]]:truncate [&_[data-slot=breadcrumb-page]]:truncate"
          />
        </div>
      </div>

      {/* pt: clear fixed navbar; pb: clear breadcrumb bar */}
      <div
        className={cn(
          "relative z-10 container flex flex-1 flex-col justify-center ",
          "pt-14 pb-11 sm:pt-16 sm:pb-12",
          "md:h-full md:pb-14 md:pt-0",
        )}
      >
        {descriptionAsHeader ? (
          headerTitleHtml ? (
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn(titleRichClass, align === "center" ? "mx-auto" : "")}
              dangerouslySetInnerHTML={{ __html: headerTitleHtml }}
            />
          ) : headerPlain ? (
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn( titlePlainClass, align === "center" ? "mx-auto" : "")}
            >
              {headerPlain}
            </motion.h1>
          ) : null
        ) : showTitle ? (
          hasRichTitle ? (
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn(titleRichClass, align === "center" ? "mx-auto" : "")}
              dangerouslySetInnerHTML={{ __html: enhancedTitleHtml }}
            />
          ) : title ? (
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn(titlePlainClass, align === "center" ? "mx-auto" : "")}
            >
              {title}
            </motion.h1>
          ) : null
        ) : null}

        {showDescriptionBelow ? (
          hasRichDescription ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={cn(descriptionRichClass, align === "center" ? "mx-auto" : "")}
              dangerouslySetInnerHTML={{
                __html: enhancedDescriptionHtml,
              }}
            />
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={cn(descriptionSizeClass, align === "center" ? "mx-auto" : "")}
            >
              {description}
            </motion.p>
          )
        ) : null}

        {action ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 flex w-full justify-center "
          >
            <Button
              asChild
              className="h-12 min-w-[220px] gap-2 rounded-xl bg-brand px-6 text-base font-bold text-white shadow-md transition-all hover:bg-brand/90 hover:shadow-lg"
            >
              {action.external ? (
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {action.label}
                </a>
              ) : (
                <Link href={action.href}>{action.label}</Link>
              )}
            </Button>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
