import { redirect } from "@/i18n/navigation";
import { localePath } from "@/features/blogs/lib/blog-routes";
import type { Locale } from "next-intl";
import { redirect as nextRedirect } from "next/navigation";

/** Navigate to the branded 404 route (avoids `not-found.tsx` streaming on every page). */
export function redirectToNotFound(locale?: Locale): never {
  if (locale) {
    nextRedirect(localePath(locale, "/404"));
  }

  redirect({ href: "/404" });
}
