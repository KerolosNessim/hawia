import { useQueries, useQuery } from "@tanstack/react-query";
import { getCountries, getFooterServices } from "../services/get-countries";

export const useFooterServices = () => {
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
      queryKey: ["footer-services", country.id],
      queryFn: () => getFooterServices(country.id),
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
