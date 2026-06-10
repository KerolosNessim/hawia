"use client";

import { useGetBlogs } from "@/features/blogs/hooks/useGetBlogs";
import { useJobOpeningsBilingual } from "@/features/careers/hooks/useJobOpeningsBilingual";
import { useGetServices } from "@/features/services/hooks/useGetServices";
import { localePath } from "@/features/blogs/lib/blog-routes";
import { resolveCountryIdForRoute } from "@/features/shared/lib/resolve-country-id-for-route";
import {
  logicalRoutePathFromUrl,
  parseCountryPath,
} from "@/features/shared/lib/country-routes";
import { resolveLocalizedPathname } from "@/features/shared/lib/resolve-localized-pathname";
import { useCountryRouteCode } from "@/hooks/use-country";
import { useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "next-intl";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import ReactCountryFlag from "react-country-flag";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function isValidNavigationUrl(url: string | null | undefined): url is string {
  if (!url?.trim()) return false;
  if (url.includes("undefined")) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

function hreflangTarget(newLocale: string): string | null {
  if (typeof document === "undefined") return null;
  const link = document.querySelector(
    `link[rel="alternate"][hreflang="${newLocale}"]`,
  ) as HTMLLinkElement | null;
  const href = link?.href ?? null;
  return isValidNavigationUrl(href) ? href : null;
}

function syncLocaleCookie(newLocale: string): void {
  document.cookie = `NEXT_LOCALE=${newLocale};path=/;SameSite=Lax`;
}

function syncCountryCookie(countryCode: "SA" | "OM"): void {
  document.cookie = `user_country=${countryCode};path=/;SameSite=Lax`;
}

type LocaleSwitcherProps = {
  triggerClassName?: string;
};

export default function LocaleSwitcher({ triggerClassName }: LocaleSwitcherProps) {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const countryCode = useCountryRouteCode();
  const { data: servicesResponse, countriesData } = useGetServices();
  const omanCountryId = useMemo(
    () => resolveCountryIdForRoute(countriesData, "OM"),
    [countriesData],
  );
  const { data: omanServicesResponse } = useGetServices(omanCountryId);
  const services = useMemo(() => {
    const list =
      countryCode === "OM"
        ? omanServicesResponse?.data
        : servicesResponse?.data;
    return Array.isArray(list) ? list : [];
  }, [countryCode, omanServicesResponse?.data, servicesResponse?.data]);
  const { data: blogsResponse } = useGetBlogs();
  const blogs = Array.isArray(blogsResponse?.data) ? blogsResponse.data : [];
  const { data: jobOpeningsBilingual } = useJobOpeningsBilingual();

  const handleChange = (newLocale: string) => {
    if (newLocale === locale) return;

    const browserPath = window.location.pathname;
    const routeCountry = parseCountryPath(browserPath).countryCode;
    const logicalPath = logicalRoutePathFromUrl(browserPath);

    const nextPath =
      resolveLocalizedPathname(logicalPath, newLocale, {
        services,
        blogs,
        jobOpenings: jobOpeningsBilingual ?? [],
      }) || "/";

    if (routeCountry === "OM") {
      syncLocaleCookie(newLocale);
      syncCountryCookie("OM");
      window.location.href = localePath(newLocale as Locale, nextPath, "OM");
      return;
    }

    // Service/blog detail pages expose localized slugs via hreflang when list lookup misses.
    if (nextPath === logicalPath) {
      const alternateUrl = hreflangTarget(newLocale);
      if (alternateUrl) {
        syncLocaleCookie(newLocale);
        window.location.href = alternateUrl;
        return;
      }
    }

    startTransition(() => {
      router.replace(nextPath, { locale: newLocale });
    });
  };

  return (
    <Select
      dir={locale === "ar" ? "rtl" : "ltr"}
      onValueChange={handleChange}
      value={locale}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn(
          triggerClassName ??
            "flex size-14! w-fit items-center justify-center rounded-full bg-brand px-3 text-base font-semibold transition-all duration-300 hover:bg-main-navy",
          triggerClassName &&
            "p-0! overflow-hidden border-0 shadow-none [&_img]:size-full [&_svg]:size-full",
        )}
        withArrow={false}
      >
        <ReactCountryFlag
          countryCode={locale === "ar" ? "SA" : "US"}
          svg
          style={
            triggerClassName
              ? { width: "100%", height: "100%" }
              : { width: "25px", height: "25px" }
          }
          className={cn(
            "rounded-full object-cover",
            triggerClassName && "size-full",
          )}
        />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="ar" className="flex items-center gap-2 text-lg">
          <ReactCountryFlag
            countryCode="SA"
            svg
            style={{
              width: "20px",
              height: "20px",
            }}
            className="rounded-full object-cover"
          />
          <span>العربية</span>
        </SelectItem>
        <SelectItem value="en" className="flex items-center gap-2 text-lg">
          <ReactCountryFlag
            countryCode="US"
            svg
            style={{
              width: "20px",
              height: "20px",
            }}
            className="rounded-full object-cover"
          />
          <span>English</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
