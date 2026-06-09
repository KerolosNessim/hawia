"use client";

import {
  parseCountryPath,
  type CountryRouteCode,
} from "@/features/shared/lib/country-routes";
import { usePathname } from "next/navigation";

/** Active route country from the URL (`/om/...`, `/en/om/...` → `OM`, otherwise `SA`). */
export function useCountryRouteCode(): CountryRouteCode {
  const pathname = usePathname();
  // Middleware rewrites Oman URLs internally; the browser URL keeps `/om` or `/en/om`.
  if (typeof window !== "undefined") {
    return parseCountryPath(window.location.pathname).countryCode;
  }
  return parseCountryPath(pathname).countryCode;
}

/** @deprecated Prefer {@link useCountryRouteCode}. */
export function useCountry() {
  return useCountryRouteCode();
}
