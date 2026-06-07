import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import {
  isGoneStatus,
  parseSlugRedirect,
} from "@/features/shared/lib/slug-redirect";
import type { PublicBlog } from "@/features/blogs/server/public-blogs";
import {
  fetchBlogShowRow,
  findBlogShowRowBySlugVariant,
  isPublicBlogVisible,
  normalizeBlog,
} from "@/features/blogs/server/public-blogs";

export type BlogPageResolveResult =
  | { kind: "ok"; blog: PublicBlog }
  | { kind: "redirect"; toSlug: string; toPath?: string; status: number }
  | { kind: "gone"; status: number };

/**
 * Loads a blog for the public detail route, including slug redirect metadata after delete/rename.
 */
export async function resolveBlogPage(
  slug: string,
  locale: string,
): Promise<BlogPageResolveResult | null> {
  const decoded = decodePathSegment(slug);
  let row = await fetchBlogShowRow(decoded);
  if (!row) {
    row = await findBlogShowRowBySlugVariant(decoded, locale);
  }
  if (!row) return null;

  const redirect = parseSlugRedirect(row, decoded, locale);
  if (redirect) {
    if (isGoneStatus(redirect.status)) {
      return { kind: "gone", status: redirect.status };
    }
    if (redirect.toPath || (redirect.toSlug && redirect.toSlug !== decoded)) {
      return { kind: "redirect", toSlug: redirect.toSlug, toPath: redirect.toPath, status: redirect.status };
    }
  }

  if (row.redirect != null && row.id == null && row.slug == null) return null;

  const blog = normalizeBlog(row);
  if (!blog || !isPublicBlogVisible(blog)) return null;

  return { kind: "ok", blog };
}
