"use client";

import { enhanceCmsHtml } from "@/lib/inline-image-alt";
import {
  CMS_RICH_HTML_LAYOUT_CLASSES,
  CMS_RICH_HTML_SCROLL_CLASSES,
} from "@/features/shared/lib/cms-rich-html-classes";
import { unwrapOuterHeadingBlock } from "@/features/shared/lib/strip-leading-duplicate-heading";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useMemo } from "react";

type RichHtmlProps = {
  html?: string | null;
  className?: string;
  as?: "div" | "p" | "span" | "h2" | "h3" | "h4";
  /** When true, renders empty wrapper if html is blank (e.g. layout placeholders). */
  allowEmpty?: boolean;
  /** Wide tables/code in article bodies only — default is clip (no card scrollbars). */
  allowHorizontalScroll?: boolean;
};

/** Shared Tailwind utilities for CMS HTML blocks (heading colors come from `.cms-rich-html` in globals.css). */
export {
  CMS_RICH_HTML_LAYOUT_CLASSES,
  CMS_RICH_HTML_SCROLL_CLASSES,
} from "@/features/shared/lib/cms-rich-html-classes";

/** Renders trusted CMS HTML from the admin rich text editor. */
export function RichHtml({
  html,
  className,
  as: Tag = "div",
  allowEmpty = false,
  allowHorizontalScroll = false,
}: RichHtmlProps) {
  const locale = useLocale();
  const content = useMemo(() => {
    const raw = html?.trim();
    if (!raw) return "";
    const prepared =
      Tag === "h2" || Tag === "h3" || Tag === "h4"
        ? unwrapOuterHeadingBlock(raw)
        : raw;
    return enhanceCmsHtml(prepared, locale);
  }, [html, locale, Tag]);

  if (!content && !allowEmpty) return null;

  return (
    <Tag
      className={cn(
        "cms-rich-html",
        CMS_RICH_HTML_LAYOUT_CLASSES,
        allowHorizontalScroll && CMS_RICH_HTML_SCROLL_CLASSES,
        className,
      )}
      dangerouslySetInnerHTML={{ __html: content || "<p></p>" }}
    />
  );
}
