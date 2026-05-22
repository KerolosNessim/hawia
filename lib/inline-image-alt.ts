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

/** Applies locale-specific `alt` on inline `<img>` tags saved with `data-alt-ar` / `data-alt-en`. */
export function applyInlineImageAlts(html: string, locale: string): string {
  if (!html.includes("data-alt-")) return html;
  if (typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return html;

  root.querySelectorAll("img").forEach((img) => {
    const ar = img.getAttribute("data-alt-ar") ?? "";
    const en = img.getAttribute("data-alt-en") ?? "";
    if (!ar && !en) return;
    const alt = pickImageAlt({ ar, en }, locale);
    if (alt) img.setAttribute("alt", alt);
  });

  return root.innerHTML;
}

/** Alt text + intrinsic size attributes for rich CMS HTML. */
export function enhanceCmsHtml(html: string, locale: string): string {
  const trimmed = html?.trim();
  if (!trimmed) return "";
  return applyInlineImageAlts(applyInlineImageDimensions(trimmed), locale);
}
