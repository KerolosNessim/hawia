import type { Locale } from "next-intl";
import {
  isGoneStatus,
  isPermanentRedirectStatus,
  parseSlugRedirect,
  type SlugRedirect,
} from "@/features/shared/lib/slug-redirect";
import { servicePostPath } from "./services-routes";

export type ServiceSlugRedirect = SlugRedirect;

/** @deprecated Use {@link parseSlugRedirect} */
export const parseServiceSlugRedirect = parseSlugRedirect;

export function serviceRedirectPath(locale: Locale, toSlug: string): string {
  return servicePostPath(toSlug);
}

export { isPermanentRedirectStatus, isGoneStatus };
