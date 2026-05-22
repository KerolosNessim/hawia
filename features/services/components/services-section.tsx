"use client";

import SectionHeader from "@/features/shared/components/section-header";
import { Link } from "@/i18n/navigation";
import { useCountry } from "@/hooks/use-country";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { matchCountryByUserCode } from "../lib/country-match";
import { useGetServices } from "../hooks/useGetServices";
import { ServicesCountryFilter } from "./services-country-filter";
import { ServicesGrid } from "./services-grid";

export default function ServicesSection() {
  const t = useTranslations("servicesSection");
  const tPage = useTranslations("servicesPage");
  const {
    data,
    isLoading,
    error,
    countries,
    countriesLoading,
    countriesError,
  } = useGetServices();

  const services = Array.isArray(data?.data) ? data?.data : [];
  const countriesData = Array.isArray(countries?.data) ? countries.data : [];

  const userCountryCode = useCountry();
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (countriesData.length > 0 && !hasAutoSelected.current) {
      const matched = matchCountryByUserCode(countriesData, userCountryCode);
      hasAutoSelected.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time geo default
      setSelectedCountry(matched ? matched.id : countriesData[0].id);
    }
  }, [countriesData, userCountryCode]);

  const filteredServices = services.filter((service) =>
    selectedCountry
      ? service.countries?.some((c) => c.id === selectedCountry)
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
    <section className="container space-y-8 py-16">
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
          onSelectCountry={setSelectedCountry}
        />
      ) : null}

      <ServicesGrid services={filteredServices} />

      <div className="flex justify-center pt-4">
        <Link
          href="/services"
          className="rounded-full border-2 border-brand bg-brand/5 px-8 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
        >
          {tPage("viewAll")}
        </Link>
      </div>
    </section>
  );
}
