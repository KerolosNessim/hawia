import { pickImageAlt } from "@/lib/image-alt";

/** Default dimensions for CMS inline images (16:9) when width/height are missing. */
export const DEFAULT_INLINE_IMG_WIDTH = 800;
export const DEFAULT_INLINE_IMG_HEIGHT = 450;

/** Adds `width` / `height` (and lazy-loading hints) to `<img>` tags in CMS HTML (SSR-safe). */
export function applyInlineImageDimensions(html: string): string {
  if (!/<img\b/i.test(html)) return html;

  return html.replace(/<img\b([^>]*?)\/?>/gi, (full, attrs) => {
    let extra = "";
    if (!/\bwidth\s*=/i.test(attrs)) extra += ` width="${DEFAULT_INLINE_IMG_WIDTH}"`;
    if (!/\bheight\s*=/i.test(attrs)) extra += ` height="${DEFAULT_INLINE_IMG_HEIGHT}"`;
    if (!/\bloading\s*=/i.test(attrs)) extra += ' loading="lazy"';
    if (!/\bdecoding\s*=/i.test(attrs)) extra += ' decoding="async"';
    const selfClosing = /\/\s*>$/.test(full.trim());
    return `<img${attrs}${extra}${selfClosing ? " /" : ""}>`;
  });
}

function readImgDataAttr(attrs: string, name: string): string {
  const match = attrs.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return match?.[1]?.trim() ?? "";
}

function replaceImgAltAttr(attrs: string, alt: string): string {
  const safe = alt.replace(/"/g, "&quot;");
  if (/\balt\s*=/i.test(attrs)) {
    return attrs.replace(/\balt\s*=\s*["'][^"']*["']/i, `alt="${safe}"`);
  }
  return `${attrs} alt="${safe}"`;
}

/** Applies locale-specific `alt` on inline `<img>` tags saved with `data-alt-ar` / `data-alt-en`. */
export function applyInlineImageAlts(html: string, locale: string): string {
  if (!html.includes("data-alt-")) return html;

  return html.replace(/<img\b([^>]*?)\/?>/gi, (full, attrs) => {
    if (!attrs.includes("data-alt-")) return full;
    const ar = readImgDataAttr(attrs, "data-alt-ar");
    const en = readImgDataAttr(attrs, "data-alt-en");
    if (!ar && !en) return full;
    const alt = pickImageAlt({ ar, en }, locale);
    if (!alt) return full;
    const selfClosing = /\/\s*>$/.test(full.trim());
    return `<img${replaceImgAltAttr(attrs, alt)}${selfClosing ? " /" : ""}>`;
  });
}

/** Alt text + intrinsic size attributes for rich CMS HTML. */
export function enhanceCmsHtml(html: string, locale: string): string {
  const trimmed = html?.trim();
  if (!trimmed) return "";
  return applyInlineImageAlts(applyInlineImageDimensions(trimmed), locale);
}
