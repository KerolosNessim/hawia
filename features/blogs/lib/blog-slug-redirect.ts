import { blogPostPath } from "@/features/blogs/lib/blog-routes";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import {
  isGoneStatus,
  isPermanentRedirectStatus,
  parseSlugRedirect,
} from "@/features/shared/lib/slug-redirect";
import { getPathname, redirect } from "@/i18n/navigation";
import type { Locale } from "next-intl";
import { permanentRedirect, redirect as nextRedirect } from "next/navigation";

export { parseSlugRedirect, isGoneStatus, isPermanentRedirectStatus };

export function blogRedirectPath(_locale: Locale, toSlug: string): string {
  return blogPostPath(toSlug);
}

/** Applies HTTP redirect for an old blog slug (rename or delete). */
export function applyBlogSlugRedirect(locale: Locale, toSlug: string, status: number, toPath?: string): never {
  if (isGoneStatus(status)) {
    redirectToNotFound();
  }
  if (toPath) {
    if (isPermanentRedirectStatus(status)) {
      permanentRedirect(toPath);
    }
    nextRedirect(toPath);
  }
  const href = blogPostPath(toSlug);
  const pathname = getPathname({ locale, href });
  if (isPermanentRedirectStatus(status)) {
    permanentRedirect(pathname);
  }
  redirect({ href, locale });
}
