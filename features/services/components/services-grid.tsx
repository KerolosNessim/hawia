"use client";

import type { CountryRouteCode } from "@/features/shared/lib/country-routes";
import type { Service } from "../types";
import ServicesCard from "./services-card";

type ServicesGridProps = {
  services: Service[];
  countryCode: CountryRouteCode;
  titleDark?: boolean;
};

export function ServicesGrid({ services, countryCode, titleDark = false }: ServicesGridProps) {
  if (!services.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {services.map((item, index) => (
        <ServicesCard
          key={item.id}
          iconIndex={index}
          item={item}
          index={index}
          countryCode={countryCode}
          titleDark={titleDark}
        />
      ))}
    </div>
  );
}
