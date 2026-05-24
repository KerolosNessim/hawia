"use client";

import { useGetServices } from "@/features/services/hooks/useGetServices";
import { resolveLocalizedPathname } from "@/features/shared/lib/resolve-localized-pathname";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import ReactCountryFlag from "react-country-flag";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

function hreflangTarget(newLocale: string): string | null {
  if (typeof document === "undefined") return null;
  const link = document.querySelector(
    `link[rel="alternate"][hreflang="${newLocale}"]`,
  ) as HTMLLinkElement | null;
  return link?.href ?? null;
}

function syncLocaleCookie(newLocale: string): void {
  document.cookie = `NEXT_LOCALE=${newLocale};path=/;SameSite=Lax`;
}

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const { data: servicesResponse } = useGetServices();
  const services = Array.isArray(servicesResponse?.data) ? servicesResponse.data : [];

  const handleChange = (newLocale: string) => {
    if (newLocale === locale) return;

    const nextPath = resolveLocalizedPathname(pathname, newLocale, { services });

    // Service/blog detail pages expose localized slugs via hreflang when list lookup misses.
    if (nextPath === pathname) {
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
        className="w-fit bg-brand text-base size-14! rounded-full font-semibold hover:bg-main-navy transition-all duration-300  px-3 flex items-center justify-center"
        withArrow={false}
      >
        <ReactCountryFlag
          countryCode={locale === "ar" ? "SA" : "US"}
          svg
          style={{
            width: "25px",
            height: "25px",
          }}
          className="rounded-full object-cover"
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
