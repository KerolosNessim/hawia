import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useCountry } from "@/hooks/use-country";
import { matchCountryByUserCode } from "@/features/services/lib/country-match";
import { getCountries } from "@/features/services/services/get-countries";
import {
  extractPartnersFromResponse,
  getPartners,
  normalizePartnersInput,
} from "../services/partners";
import type { LandingPageData, Partner } from "../types";

type UsePartnersOptions = {
  countryId?: number;
  initialPartners?: LandingPageData["partners"] | Partner[];
};

export function usePartners(options: UsePartnersOptions = {}) {
  const locale = useLocale();
  const userCountryCode = useCountry();
  const explicitCountryId =
    options.countryId != null && options.countryId > 0 ? options.countryId : undefined;
  const initialPartners = normalizePartnersInput(options.initialPartners);
  const shouldResolveCountry = explicitCountryId == null;

  const { data: countriesRes } = useQuery({
    queryKey: ["countries", locale],
    queryFn: getCountries,
    enabled: shouldResolveCountry,
  });

  const countries = useMemo(
    () => (Array.isArray(countriesRes?.data) ? countriesRes.data : []),
    [countriesRes],
  );
  const resolvedCountryId = useMemo(() => {
    if (explicitCountryId != null) return explicitCountryId;
    if (!countries.length) return undefined;
    const matched = matchCountryByUserCode(countries, userCountryCode);
    return matched?.id ?? countries[0]?.id;
  }, [countries, explicitCountryId, userCountryCode]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["partners", locale, resolvedCountryId],
    queryFn: () => getPartners(resolvedCountryId),
    enabled: resolvedCountryId != null && resolvedCountryId > 0,
    select: extractPartnersFromResponse,
  });

  return {
    partners: data ?? initialPartners,
    isLoading: isLoading && initialPartners.length === 0,
    error,
    countryId: resolvedCountryId,
  };
}
