import {
  htmlAttrsToReactProps,
  parseHtmlAttributes,
} from "@/lib/seo/parse-html-attributes";
import type { ReactNode } from "react";

function extractTags(markup: string, tagName: "meta" | "link"): string[] {
  const re = new RegExp(`<${tagName}\\b[^>]*\\/?>`, "gi");
  return markup.match(re) ?? [];
}

function attrStringFromTag(tag: string, tagName: string): string {
  return tag
    .replace(new RegExp(`^<${tagName}\\b`, "i"), "")
    .replace(/\/?>$/i, "")
    .trim();
}

/**
 * Renders `<meta>` / `<link>` tags from CMS markup (`custom_head_scripts` or hoisted body snippets).
 */
export function HeadTagsFromMarkup({
  markup,
}: {
  markup: string | null | undefined;
}) {
  if (!markup?.trim()) return null;

  const elements: ReactNode[] = [];
  let key = 0;

  for (const tag of extractTags(markup, "meta")) {
    const props = htmlAttrsToReactProps(
      parseHtmlAttributes(attrStringFromTag(tag, "meta")),
    );
    elements.push(<meta key={`meta-${key++}`} {...props} />);
  }

  for (const tag of extractTags(markup, "link")) {
    const props = htmlAttrsToReactProps(
      parseHtmlAttributes(attrStringFromTag(tag, "link")),
    );
    const linkKey =
      typeof props.href === "string"
        ? `${props.rel}-${props.href}`
        : `link-${key}`;
    elements.push(<link key={linkKey} {...props} />);
  }

  return <>{elements}</>;
}
