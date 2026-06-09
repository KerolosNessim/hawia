"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SectionHeader from "@/features/shared/components/section-header";
import { CountryLink } from "@/features/shared/components/country-link";
import { resolveSupportedCountry } from "@/features/shared/lib/country-routes";
import { useCountry } from "@/hooks/use-country";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { Service } from "../types";
import ServicesCard from "./services-card";

type RelatedServicesSectionProps = {
  services: Service[];
  countryId?: number;
};

export default function RelatedServicesSection({
  services,
  countryId,
}: RelatedServicesSectionProps) {
  const countryCode = resolveSupportedCountry(useCountry());
  const t = useTranslations("servicesSection");
  const tPage = useTranslations("servicesPage");
  const locale = useLocale();
  const isRtl = locale === "ar";

  if (!services.length) return null;

  return (
    <section className="container space-y-8 py-16">
      <SectionHeader
        title={t("title")}
        subtitle={t("subtitle")}
        align="center"
        subtitleColor="text-gray-500"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        dir={isRtl ? "rtl" : "ltr"}
        className="my-4 md:my-6"
      >
        <Carousel
          opts={{
            align: "start",
            loop: services.length > 1,
            direction: isRtl ? "rtl" : "ltr",
          }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
          className="w-full"
        >
          <CarouselContent className="-ms-4 py-4 md:py-5">
            {services.map((item, index) => (
              <CarouselItem
                key={item.id}
                className="ps-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <ServicesCard
                  item={item}
                  iconIndex={index}
                  index={index}
                  countryCode={countryCode}
                  titleAsPlainH3
                  titleDark={true}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious
            isRtl={isRtl}
            className="max-md:hidden size-10 bg-brand text-white hover:bg-gray-900 hover:text-brand disabled:opacity-30"
          />
          <CarouselNext
            isRtl={isRtl}
            className="max-md:hidden size-10 bg-brand text-white hover:bg-gray-900 hover:text-brand disabled:opacity-30"
          />
        </Carousel>
      </motion.div>

      <div className="flex justify-center pt-4">
        <CountryLink
          href="/services"
          countryCode={countryCode}
          className="rounded-full border-2 border-brand bg-brand/5 px-8 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
        >
          {tPage("viewAll")}
        </CountryLink>
      </div>
    </section>
  );
}
