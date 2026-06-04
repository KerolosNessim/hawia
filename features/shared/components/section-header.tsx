"use client";

import { enhanceCmsHtml } from "@/lib/inline-image-alt";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useMemo } from "react";

type SectionHeaderProps = {
  /** Plain fallback when `titleHtml` is empty. */
  title?: string;
  /** CMS HTML title — renders as-is when set. */
  titleHtml?: string;
  subtitle?: string;
  /** CMS HTML subtitle — takes precedence over plain `subtitle` when set. */
  subtitleHtml?: string;
  badge?: string;
  align?: "center" | "start";
  subtitleColor?: string;
  titleColor?: string;
};

export default function SectionHeader({
  title,
  titleHtml,
  subtitle,
  subtitleHtml,
  badge,
  align = "center",
  subtitleColor = "text-gray-200",
  titleColor = "text-brand",
}: SectionHeaderProps) {
  const locale = useLocale();
  const hasRichTitle = Boolean(titleHtml?.trim());
  const hasRichSubtitle = Boolean(subtitleHtml?.trim());
  const enhancedTitleHtml = useMemo(
    () => (titleHtml?.trim() ? enhanceCmsHtml(titleHtml, locale) : ""),
    [titleHtml, locale],
  );
  const enhancedSubtitleHtml = useMemo(
    () => (subtitleHtml?.trim() ? enhanceCmsHtml(subtitleHtml, locale) : ""),
    [subtitleHtml, locale],
  );
  const alignment = {
    start: " text-start ",
    center: " text-center flex-col justify-center ",
  };

  return (
    <div className={`container min-w-0 max-w-full space-y-4 ${alignment[align]}`}>
      {/* Badge */}
      {badge && (
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-bold"
        >
          {badge}
        </motion.span>
      )}

      {/* Title */}
      {hasRichTitle ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`cms-rich-html text-3xl md:text-4xl ${titleColor} font-bold tracking-tight [&_p]:mb-0 [&_h2]:text-3xl [&_h3]:text-2xl [&_strong]:font-bold`}
          dangerouslySetInnerHTML={{ __html: enhancedTitleHtml }}
        />
      ) : title ? (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`text-3xl md:text-4xl ${titleColor} font-bold tracking-tight`}
        >
          {title}
        </motion.h2>
      ) : null}

      {/* Animated Line */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "80px" }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className={`h-[3px] bg-brand rounded-full ${align === "center" ? "mx-auto" : ""}`}
      />

      {/* Subtitle */}
      {hasRichSubtitle ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className={`cms-rich-html max-w-6xl text-gray-200 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold ${subtitleColor} ${align === "center" ? "mx-auto" : ""}`}
          dangerouslySetInnerHTML={{ __html: enhancedSubtitleHtml }}
        />
      ) : subtitle ? (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className={`text-gray-200 max-w-6xl ${subtitleColor} ${align === "center" ? "mx-auto" : ""}`}
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}
