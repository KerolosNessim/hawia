"use client";

import {
  parseCountryPath,
  type CountryRouteCode,
} from "@/features/shared/lib/country-routes";
import { usePathname } from "next/navigation";

/** Active route country from the URL (`/om/...` → `OM`, otherwise `SA`). */
export function useCountryRouteCode(): CountryRouteCode {
  const pathname = usePathname();
  return parseCountryPath(pathname).countryCode;
}

/** @deprecated Prefer {@link useCountryRouteCode}. */
export function useCountry() {
  return useCountryRouteCode();
}
