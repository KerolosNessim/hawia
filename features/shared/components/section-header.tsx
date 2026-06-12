"use client";

import { HeadingAccentDivider } from "@/features/shared/components/heading-accent-divider";
import {
  sectionHeaderRichClass,
  type SectionHeaderTone,
} from "@/features/shared/lib/section-header-tone";
import { enhanceCmsHtml } from "@/lib/inline-image-alt";
import { cn } from "@/lib/utils";
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
  /** When set, CMS inline colors align with dark/light section shells. */
  tone?: SectionHeaderTone;
  showDivider?: boolean;
};

export default function SectionHeader({
  title,
  titleHtml,
  subtitle,
  subtitleHtml,
  badge,
  align = "center",
  subtitleColor = "text-gray-300",
  titleColor = "text-brand",
  tone,
  showDivider = true,
}: SectionHeaderProps) {
  const locale = useLocale();
  const hasRichTitle = Boolean(titleHtml?.trim());
  const hasRichSubtitle = Boolean(subtitleHtml?.trim());
  const richClass = sectionHeaderRichClass(tone ?? "light", align);
  const enhancedTitleHtml = useMemo(
    () => (titleHtml?.trim() ? enhanceCmsHtml(titleHtml, locale) : ""),
    [titleHtml, locale],
  );
  const enhancedSubtitleHtml = useMemo(
    () => (subtitleHtml?.trim() ? enhanceCmsHtml(subtitleHtml, locale) : ""),
    [subtitleHtml, locale],
  );
  const alignment = {
    start: "text-start",
    center: "text-center",
  };

  return (
    <div
      data-slot="section-header"
      data-align={align}
      className={cn("w-full min-w-0 max-w-full space-y-4", alignment[align])}
    >
      {badge ? (
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary"
        >
          {badge}
        </motion.span>
      ) : null}

      {hasRichTitle ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={cn(
            "cms-rich-html text-3xl font-bold tracking-tight md:text-4xl",
            titleColor,
            richClass,
          )}
          dangerouslySetInnerHTML={{ __html: enhancedTitleHtml }}
        />
      ) : title ? (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={cn(
            "text-3xl font-bold tracking-tight md:text-4xl",
            titleColor,
          )}
        >
          {title}
        </motion.h2>
      ) : null}

      {showDivider ? <HeadingAccentDivider align={align} /> : null}

      {hasRichSubtitle ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className={cn(
            "cms-rich-html max-w-6xl text-base leading-relaxed md:text-lg",
            subtitleColor,
            richClass,
            align === "center" && "mx-auto",
          )}
          dangerouslySetInnerHTML={{ __html: enhancedSubtitleHtml }}
        />
      ) : subtitle ? (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className={cn(
            "max-w-6xl text-base leading-relaxed md:text-lg",
            subtitleColor,
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}
