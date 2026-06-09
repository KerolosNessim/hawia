"use client";

import { localePath } from "@/features/blogs/lib/blog-routes";
import { CountryLink } from "@/features/shared/components/country-link";
import SectionHeader from "@/features/shared/components/section-header";
import {
  countryRouteCodeFromId,
  resolveSupportedCountry,
} from "@/features/shared/lib/country-routes";
import { useCountry } from "@/hooks/use-country";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { matchCountryByUserCode } from "../lib/country-match";
import { countryIdsMatch } from "../lib/dedupe-countries";
import { useGetServices } from "../hooks/useGetServices";
import { ServicesCountryFilter } from "./services-country-filter";
import { ServicesGrid } from "./services-grid";
import { cn } from "@/lib/utils";

export default function ServicesSection({ countryId ,lightBg = false}: { countryId?: number,lightBg?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("servicesSection");
  const tPage = useTranslations("servicesPage");
  const {
    data,
    isLoading,
    error,
    countriesData,
    countryIdAlias,
    countriesLoading,
    countriesError,
  } = useGetServices(countryId);

  const services = Array.isArray(data?.data) ? data?.data : [];

  const userCountryCode = useCountry();
  const countryCode = resolveSupportedCountry(userCountryCode);
  const [autoSelectedCountry, setAutoSelectedCountry] = useState<number | null>(null);
  const hasAutoSelected = useRef(false);
  const selectedCountry = countryId ?? autoSelectedCountry;

  useEffect(() => {
    if (countriesData.length > 0 && !hasAutoSelected.current) {
      const matched = matchCountryByUserCode(countriesData, userCountryCode);
      hasAutoSelected.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time geo fallback
      setAutoSelectedCountry(matched ? matched.id : countriesData[0].id);
    }
  }, [countriesData, userCountryCode]);

  const filteredServices = services.filter((service) =>
    selectedCountry
      ? service.countries?.some((country) =>
          countryIdsMatch(country.id, selectedCountry, countryIdAlias),
        )
      : true,
  );

  if (isLoading || countriesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand" />
      </div>
    );
  }

  if (error || countriesError) {
    return null;
  }

  return (
    <section
      className={cn(
        " py-16  ",
        lightBg ? "finger-print-background" : "background-dark-img bg-opacity-50",
      )}
    >
      <div className="container space-y-8">
        <SectionHeader
          title={t("title")}
          subtitle={t("subtitle")}
          align="center"
          subtitleColor="text-gray-500"
        />

        {countriesData.length > 0 && selectedCountry != null ? (
          <ServicesCountryFilter
            countries={countriesData}
            selectedCountryId={selectedCountry}
            onSelectCountry={(id) => {
              const code = countryRouteCodeFromId(countriesData, id);
              document.cookie = `user_country=${code};path=/;SameSite=Lax`;
              window.location.assign(localePath(locale, "/", code));
            }}
          />
        ) : null}

        <ServicesGrid services={filteredServices} countryCode={countryCode} titleDark={lightBg} />

        <div className="flex justify-center pt-4">
          <CountryLink
            href="/services"
            countryCode={countryCode}
            className="rounded-full border-2 border-brand bg-brand/5 px-8 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
          >
            {tPage("viewAll")}
          </CountryLink>
        </div>
      </div>
    </section>
  );
}
