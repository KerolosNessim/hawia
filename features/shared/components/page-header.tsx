"use client";

import SiteBreadcrumb from "@/features/shared/components/site-breadcrumb";
import type { BreadcrumbTrailItem } from "@/features/shared/lib/breadcrumb-trail";
import * as motion from "framer-motion/client";

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
}: PageHeaderProps) {
  const hasRichTitle = Boolean(titleHtml?.trim());
  const hasRichDescription = Boolean(descriptionHtml?.trim());

  const showTitle = !descriptionAsHeader;

  const headerHtml = descriptionAsHeader
    ? descriptionHtml?.trim()
    : undefined;

  const headerPlain = descriptionAsHeader
    ? description?.trim()
    : undefined;

  const showDescriptionBelow =
    !descriptionAsHeader &&
    (hasRichDescription || Boolean(description?.trim()));

  return (
    <section className="relative overflow-hidden lg:h-[60vh] md:h-[40vh] h-[30vh]">
      {/* Background image */}
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Breadcrumb — bottom of hero, clear of fixed navbar */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="container py-2.5 md:py-3">
          <SiteBreadcrumb variant="hero" items={breadcrumbItems} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center pb-12 md:pb-14">
        <div className="container">
          {descriptionAsHeader ? (
            headerHtml ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl text-4xl font-bold text-brand cms-rich-html [&_p]:mb-0 [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_strong]:font-bold"
                dangerouslySetInnerHTML={{ __html: headerHtml }}
              />
            ) : headerPlain ? (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl text-4xl font-bold text-brand"
              >
                {headerPlain}
              </motion.h1>
            ) : null
          ) : showTitle ? (
            hasRichTitle ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-brand cms-rich-html [&_p]:mb-0 [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_strong]:font-bold"
                dangerouslySetInnerHTML={{ __html: titleHtml!.trim() }}
              />
            ) : title ? (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-brand"
              >
                {title}
              </motion.h1>
            ) : null
          ) : null}

          {showDescriptionBelow ? (
            hasRichDescription ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="cms-rich-html text-lg text-white mt-4 max-w-3xl [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{
                  __html: descriptionHtml!.trim(),
                }}
              />
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-white mt-4"
              >
                {description}
              </motion.p>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}