import { SERVICE_CARD_ICONS } from "../lib/service-icons";
import type { Service } from "../types";
import ServicesCard from "./services-card";

type ServicesGridProps = {
  services: Service[];
  countryId?: number;
};

export function ServicesGrid({ services, countryId }: ServicesGridProps) {
  if (!services.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {services.map((item, index) => (
        <ServicesCard
          key={item.id}
          icon={SERVICE_CARD_ICONS[index % SERVICE_CARD_ICONS.length]}
          item={item}
          index={index}
          countryId={countryId}
        />
      ))}
    </div>
  );
}
