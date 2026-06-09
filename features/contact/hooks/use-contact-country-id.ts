"use client";

import { matchCountryByUserCode } from "@/features/services/lib/country-match";
import { useGetServices } from "@/features/services/hooks/useGetServices";
import { useCountry } from "@/hooks/use-country";
import { useMemo } from "react";

/** Resolves numeric `country_id` for contact content from route country + API countries list. */
export function useContactCountryId(countryId?: number): number | undefined {
  const userCountryCode = useCountry();
  const { countriesData } = useGetServices();

  return useMemo(() => {
    if (countryId != null && countryId > 0) return countryId;
    return matchCountryByUserCode(countriesData, userCountryCode)?.id;
  }, [countryId, countriesData, userCountryCode]);
}
