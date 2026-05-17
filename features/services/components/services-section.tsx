"use client";

import SectionHeader from "@/features/shared/components/section-header";
import {
  BadgeDollarSign,
  CodeXml,
  FileImage,
  Megaphone,
  MonitorPlay,
  Search,
  Store,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGetServices } from "../hooks/useGetServices";
import ServicesCard from "./services-card";
import { useCountry } from "@/hooks/use-country";

export default function ServicesSection() {
  const t = useTranslations("servicesSection");
  const items = t.raw("items") as { title: string; description: string }[];
  const {
    data,
    isLoading,
    error,
    countries,
    countriesLoading,
    countriesError,
  } = useGetServices();

  const services = Array.isArray(data?.data) ? data?.data : [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const countriesData = Array.isArray(countries?.data) ? countries?.data : [];

  const userCountryCode = useCountry();
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  // Tracks whether we have already done the initial auto-selection.
  // Using a ref means changing it won't trigger a re-render, and it
  // also survives re-renders without resetting, so the user's manual
  // country selection is never overridden by the auto-select logic.
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    // Only auto-select once, and only when both the countries list
    // and the real country code (from cookie, not the default) are ready.
    if (countriesData?.length > 0 && !hasAutoSelected.current) {
      const aliases: Record<string, string[]> = {
        SA: ["saudi", "ksa", "سعود"],
        OM: ["oman", "عمان"],
        EG: ["egypt", "مصر"],
        AE: ["uae", "emirates", "امارات", "إمارات"],
        QA: ["qatar", "قطر"],
        KW: ["kuwait", "كويت"],
        BH: ["bahrain", "بحرين"],
      };

      const currentAliases = aliases[userCountryCode] || [];
      // country.name is a plain localized string from /v1/countries
      let matchedCountry = countriesData.find((c) =>
        currentAliases.some((alias) => c.name.toLowerCase().includes(alias)),
      );

      // Fallback to Oman if the user's country is not in the list
      if (!matchedCountry) {
        matchedCountry = countriesData.find((c) =>
          c.name.toLowerCase().includes("oman") || c.name.includes("عمان"),
        );
      }

      hasAutoSelected.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCountry(
        matchedCountry ? matchedCountry.id : countriesData[0].id,
      );
    }
  }, [countriesData, userCountryCode]);

  const filteredServices = services?.filter((service) =>
    selectedCountry
      ? service.countries?.some((c) => c.id === selectedCountry)
      : true,
  );

  if (isLoading || countriesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error || countriesError) {
    return null; // Or show an error message
  }
  const icons = [
    Search,
    Megaphone,
    Users,
    Store,
    FileImage,
    MonitorPlay,
    CodeXml,
    BadgeDollarSign,
  ];

  return (
    <section className="container py-16 space-y-8">
      <SectionHeader
        title={t("title")}
        subtitle={t("subtitle")}
        align="center"
        subtitleColor="text-gray-500"
      />
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {countriesData?.map((country) => (
          <button
            key={country.id}
            onClick={() => setSelectedCountry(country.id)}
            className={`cursor-pointer rounded-xl p-2 transition-all flex items-center gap-3 border-2 min-w-[140px] ${
              selectedCountry === country.id
                ? "border-brand bg-brand/5 shadow-md scale-105"
                : "border-gray-100 opacity-70 hover:opacity-100 hover:border-brand/30 bg-white"
            }`}
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
              <Image
                src={country?.image}
                alt={country?.name}
                fill
                className="object-cover"
              />
            </div>
            <span
              className={`font-bold ${selectedCountry === country.id ? "text-brand" : "text-gray-600"}`}
            >
              {country.name}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredServices?.map((item, index) => (
          <ServicesCard
            icon={icons[index]}
            key={index}
            item={item}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
