"use client";

import { localePath } from "@/features/blogs/lib/blog-routes";
import { parseCountryPath, type CountryRouteCode } from "@/features/shared/lib/country-routes";
import { Link } from "@/i18n/navigation";
import { useCountryRouteCode } from "@/hooks/use-country";
import type { Locale } from "next-intl";
import { useLocale } from "next-intl";
import { usePathname as useNextPathname } from "next/navigation";
import type { ComponentProps } from "react";

type CountryLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** Target country route; defaults to the active country from URL/cookie. */
  countryCode?: CountryRouteCode;
};

function resolveActiveCountry(
  explicit: CountryRouteCode | undefined,
  pathCountry: CountryRouteCode,
  browserPathname: string,
): CountryRouteCode {
  if (explicit) return explicit;
  return parseCountryPath(browserPathname).countryCode ?? pathCountry;
}

/**
 * Navigation link that keeps Oman on `/om/...` URLs.
 * next-intl `Link` only understands locale prefixes, not `/om`.
 */
export function CountryLink({
  href,
  countryCode: countryCodeProp,
  ...props
}: CountryLinkProps) {
  const locale = useLocale() as Locale;
  const pathCountry = useCountryRouteCode();
  const browserPathname = useNextPathname();
  const countryCode = resolveActiveCountry(
    countryCodeProp,
    pathCountry,
    browserPathname,
  );

  if (countryCode === "OM") {
    const fullHref = localePath(locale, href, "OM");
    return <a href={fullHref} {...props} />;
  }

  return <Link href={href} {...props} />;
}
