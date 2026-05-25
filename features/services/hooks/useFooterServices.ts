import { useQueries, useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getCountries, getFooterServices } from "../services/get-countries";

export const useFooterServices = () => {
  const locale = useLocale();
  // 1. Fetch countries first
  const { data: countriesRes, isLoading: countriesLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });

  const countries = countriesRes?.data ?? [];

  // 2. Fetch footer services for each country
  // We use useQueries to fetch them in parallel
  const footerServicesQueries = useQueries({
    queries: countries.map((country) => ({
      queryKey: ["footer-services", country.id, locale],
      queryFn: () => getFooterServices(country.id, locale),
      enabled: !!country.id,
    })),
  });

  const isLoading = countriesLoading || footerServicesQueries.some((q) => q.isLoading);

  const countriesWithServices = countries.map((country, index) => ({
    ...country,
    services: footerServicesQueries[index]?.data?.data ?? [],
  }));

  return {
    countries: countriesWithServices,
    isLoading,
  };
};
