"use client";

import { parseCountryPath } from "@/features/shared/lib/country-routes";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function useCountry() {
  const pathname = usePathname();
  const pathCountry = parseCountryPath(pathname).countryCode;
  const [country, setCountry] = useState<string>(pathCountry);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )user_country=([^;]*)/);
    const cookieCountry = match?.[1]?.trim().toUpperCase();
    setCountry(cookieCountry || pathCountry);
  }, [pathCountry]);

  return country;
}
