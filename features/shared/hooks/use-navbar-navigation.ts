"use client";

import { useGetServices } from "@/features/services/hooks/useGetServices";
import { useGetServiceAis } from "@/features/services/hooks/useGetServiceAis";
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
  const { data: aiData } = useGetServiceAis();
  const userCountryCode = useCountry();
  const allServices = Array.isArray(data?.data) ? data.data : [];
  const services = filterServicesByCountryCode(allServices, userCountryCode);
  const allAiServices = Array.isArray(aiData?.data) ? aiData.data : [];

  const links = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/ai-services", label: t("aiServices") },
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

  type AiLink = { id: number; href: string; label: string; slug: string };
  const aiServiceLinks = allAiServices.reduce<AiLink[]>((acc, service) => {
    const slug =
      (service.slug_local && typeof service.slug_local === "object"
        ? (locale.startsWith("ar") ? service.slug_local.ar : service.slug_local.en) ??
          service.slug_local.ar ??
          service.slug_local.en
        : undefined) ??
      service.slug ??
      "";

    const label = String(service.title ?? "").trim();
    if (!slug || !label) return acc;

    acc.push({
      id: service.id,
      href: `/ai-services/${encodeURIComponent(slug)}`,
      label,
      slug,
    });
    return acc;
  }, []);

  return {
    locale,
    t,
    tServicesPage,
    path,
    links,
    services,
    serviceLinks,
    aiServiceLinks,
  };
}

