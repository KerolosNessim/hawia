/** Decode common HTML entities left after tag stripping (CMS `&nbsp;`, etc.). */
export function decodeHtmlEntities(text: string): string {
  let current = text;
  let previous = "";
  let passes = 0;

  while (current !== previous && passes < 4) {
    previous = current;
    current = current
      .replace(/&nbsp;/gi, " ")
      .replace(/&#160;/g, " ")
      .replace(/&#x0*a0;/gi, " ")
      .replace(/\u00a0/g, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#0*39;/g, "'")
      .replace(/&apos;/gi, "'");
    passes += 1;
  }

  return current;
}

/** Strip tags for metadata, alt text, and compact UI labels. */
export function plainTextFromHtml(html: string | null | undefined): string {
  if (!html) return "";
  const withoutTags = html.replace(/<[^>]+>/g, " ");
  return decodeHtmlEntities(withoutTags).replace(/\s+/g, " ").trim();
}
