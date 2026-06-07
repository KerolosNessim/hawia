"use client";

import { useGetBlogs } from "@/features/blogs/hooks/useGetBlogs";
import { useJobOpeningsBilingual } from "@/features/careers/hooks/useJobOpeningsBilingual";
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
import { cn } from "@/lib/utils";

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

type LocaleSwitcherProps = {
  triggerClassName?: string;
};

export default function LocaleSwitcher({ triggerClassName }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const { data: servicesResponse } = useGetServices();
  const services = Array.isArray(servicesResponse?.data) ? servicesResponse.data : [];
  const { data: blogsResponse } = useGetBlogs();
  const blogs = Array.isArray(blogsResponse?.data) ? blogsResponse.data : [];
  const { data: jobOpeningsBilingual } = useJobOpeningsBilingual();

  const handleChange = (newLocale: string) => {
    if (newLocale === locale) return;

    const nextPath = resolveLocalizedPathname(pathname, newLocale, {
      services,
      blogs,
      jobOpenings: jobOpeningsBilingual ?? [],
    });

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
