import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Country } from "../types";

type ServicesCountryFilterProps = {
  countries: Country[];
  selectedCountryId: number;
  /** When set, countries render as navigation links (listing page). */
  getCountryHref?: (countryId: number) => string;
  /** When set, countries render as buttons (home section). */
  onSelectCountry?: (countryId: number) => void;
};

function countryButtonClass(isActive: boolean): string {
  return `cursor-pointer rounded-xl p-2 transition-all flex items-center gap-3 border-2 min-w-[140px] ${
    isActive
      ? "border-brand bg-brand/5 shadow-md scale-105"
      : "border-gray-100 opacity-70 hover:opacity-100 hover:border-brand/30 bg-white"
  }`;
}

export function ServicesCountryFilter({
  countries,
  selectedCountryId,
  getCountryHref,
  onSelectCountry,
}: ServicesCountryFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {countries.map((country) => {
        const isActive = selectedCountryId === country.id;
        const labelClass = `font-bold ${isActive ? "text-brand" : "text-gray-600"}`;
        const inner = (
          <>
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-100">
              <Image
                src={country.image}
                alt={country.name}
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
            </div>
            <span className={labelClass}>{country.name}</span>
          </>
        );

        if (getCountryHref) {
          return (
            <Link
              key={country.id}
              href={getCountryHref(country.id)}
              className={countryButtonClass(isActive)}
            >
              {inner}
            </Link>
          );
        }

        return (
          <button
            key={country.id}
            type="button"
            onClick={() => onSelectCountry?.(country.id)}
            className={countryButtonClass(isActive)}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
