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
  /** Wide tables/code in article bodies only — default is clip (no card scrollbars). */
  allowHorizontalScroll?: boolean;
};

/** Shared Tailwind utilities for CMS HTML blocks (heading colors come from `.cms-rich-html` in globals.css). */
export const CMS_RICH_HTML_LAYOUT_CLASSES =
  "max-w-full min-w-0 overflow-x-clip [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-6 [&_.cms-toc]:my-6 [&_.cms-toc]:rounded-xl [&_.cms-toc]:border [&_.cms-toc]:border-neutral-200 [&_.cms-toc]:bg-neutral-50 [&_.cms-toc]:p-4 [&_.cms-toc_ul]:mt-2 [&_.cms-toc_li]:my-1 [&_.editor-toc]:my-6 [&_.editor-toc]:rounded-xl [&_.editor-toc]:border [&_.editor-toc]:border-neutral-200 [&_.editor-toc]:bg-neutral-50 [&_.editor-toc]:p-4 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:table-fixed [&_td]:border [&_td]:border-neutral-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-neutral-200 [&_th]:bg-neutral-50 [&_th]:px-3 [&_th]:py-2 [&_th]:font-bold [&_tr]:min-h-[2rem] [&_img]:my-3 [&_img]:h-auto [&_img]:max-h-[480px] [&_img]:max-w-full [&_img]:rounded-lg [&_img]:object-contain [&_iframe]:max-w-full [&_video]:max-w-full [&_pre]:max-w-full [&_figure]:max-w-full [&_div]:max-w-full";

const CMS_RICH_HTML_SCROLL_CLASSES = "overflow-x-auto";

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
    return enhanceCmsHtml(raw, locale);
  }, [html, locale]);

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
