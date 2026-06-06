"use client";

import { useGetServices } from "@/features/services/hooks/useGetServices";
import { filterServicesByCountryCode } from "@/features/services/lib/filter-services-by-country";
import { pickServiceDisplayTitle } from "@/features/services/lib/service-display-title";
import { pickServiceSlug } from "@/features/services/lib/services-routes";
import { usePathname } from "@/i18n/navigation";
import { useCountry } from "@/hooks/use-country";
import { useLocale, useTranslations } from "next-intl";

export const NAV_ACTIVE_CLASS = "bg-brand text-white rounded-full";
export const NAV_HOVER_CLASS =
  "hover:bg-brand hover:text-white hover:rounded-full transition-all duration-300 ease-in-out";

export function navLinkClassName(
  path: string,
  href: string,
  extra?: string,
): string {
  const isActive = path === href;
  return [
    isActive ? NAV_ACTIVE_CLASS : "",
    "rounded-full p-2 font-semibold",
    NAV_HOVER_CLASS,
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function useNavbarNavigation() {
  const locale = useLocale();
  const t = useTranslations("navbar");
  const tServicesPage = useTranslations("servicesPage");
  const path = usePathname();
  const { data } = useGetServices();
  const userCountryCode = useCountry();
  const allServices = Array.isArray(data?.data) ? data.data : [];
  const services = filterServicesByCountryCode(allServices, userCountryCode);

  const links = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/clients", label: t("clients") },
    { href: "/blogs", label: t("blog") },
    { href: "/courses", label: t("courses") },
    { href: "/packages", label: t("packages") },
    { href: "/careers", label: t("careers") },
    // { href: "/faq", label: t("faq") },
  ] as const;

  const serviceLinks = services
    .map((service) => {
      const slug = pickServiceSlug(service, locale);
      const label = pickServiceDisplayTitle(service, locale);
      return {
        id: service.id,
        href: `/services/${encodeURIComponent(slug)}` as const,
        label,
        slug,
      };
    })
    .filter((item) => item.label.length > 0);

  return {
    locale,
    t,
    tServicesPage,
    path,
    links,
    services,
    serviceLinks,
  };
}

