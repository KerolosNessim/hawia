"use client";

import SectionHeader from "@/features/shared/components/section-header";
import { Link } from "@/i18n/navigation";
import { resolveSupportedCountry } from "@/features/shared/lib/country-routes";
import { useCountry } from "@/hooks/use-country";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { matchCountryByUserCode } from "../lib/country-match";
import { countryIdsMatch } from "../lib/dedupe-countries";
import { useGetServices } from "../hooks/useGetServices";
import { ServicesCountryFilter } from "./services-country-filter";
import { ServicesGrid } from "./services-grid";
import { cn } from "@/lib/utils";

export default function ServicesSection({ countryId ,lightBg = false}: { countryId?: number,lightBg?: boolean }) {
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

        {countryId == null &&
        countriesData.length > 0 &&
        selectedCountry != null ? (
          <ServicesCountryFilter
            countries={countriesData}
            selectedCountryId={selectedCountry}
            onSelectCountry={setAutoSelectedCountry}
          />
        ) : null}

        <ServicesGrid services={filteredServices} countryCode={countryCode} titleDark={lightBg} />

        <div className="flex justify-center pt-4">
          <Link
            href="/services"
            className="rounded-full border-2 border-brand bg-brand/5 px-8 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
          >
            {tPage("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
