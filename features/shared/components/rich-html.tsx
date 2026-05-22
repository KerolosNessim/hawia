"use client";

import { enhanceCmsHtml } from "@/lib/inline-image-alt";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useMemo } from "react";

type RichHtmlProps = {
  html?: string | null;
  className?: string;
  as?: "div" | "p" | "span";
  /** When true, renders empty wrapper if html is blank (e.g. layout placeholders). */
  allowEmpty?: boolean;
};

/** Shared Tailwind utilities for CMS HTML blocks (heading colors come from `.cms-rich-html` in globals.css). */
export const CMS_RICH_HTML_LAYOUT_CLASSES =
  "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-6 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:table-fixed [&_td]:border [&_td]:border-neutral-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-neutral-200 [&_th]:bg-neutral-50 [&_th]:px-3 [&_th]:py-2 [&_th]:font-bold [&_tr]:min-h-[2rem] [&_img]:my-3 [&_img]:h-auto [&_img]:max-h-[480px] [&_img]:max-w-full [&_img]:rounded-lg [&_img]:object-contain";

/** Renders trusted CMS HTML from the admin rich text editor. */
export function RichHtml({ html, className, as: Tag = "div", allowEmpty = false }: RichHtmlProps) {
  const locale = useLocale();
  const content = useMemo(() => {
    const raw = html?.trim();
    if (!raw) return "";
    return enhanceCmsHtml(raw, locale);
  }, [html, locale]);

  if (!content && !allowEmpty) return null;

  return (
    <Tag
      className={cn("cms-rich-html", CMS_RICH_HTML_LAYOUT_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: content || "<p></p>" }}
    />
  );
}
