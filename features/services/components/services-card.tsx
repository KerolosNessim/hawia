"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as motion from "framer-motion/client";
import { CountryLink } from "@/features/shared/components/country-link";
import { RichHtml } from "@/features/shared/components/rich-html";
import type { CountryRouteCode } from "@/features/shared/lib/country-routes";
import { stripLeadingDuplicateHeading } from "@/features/shared/lib/strip-leading-duplicate-heading";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { useLocale } from "next-intl";
import { SERVICE_CARD_ICONS } from "../lib/service-icons";
import { pickServiceSlug } from "../lib/services-routes";
import { Service } from "../types";
import { cn } from "@/lib/utils";

const serviceCardTitleClassName =
  "service-card__title line-clamp-2 min-h-14 w-full text-center text-xl font-bold text-white";

export default function ServicesCard({
  item,
  iconIndex,
  index,
  countryCode,
  titleAsPlainH3 = false,
  titleDark = false,
}: {
  item: Service;
  iconIndex: number;
  index: number;
  countryCode: CountryRouteCode;
  /** Related-services carousel only: plain `<h3>` with HTML stripped from title. */
  titleAsPlainH3?: boolean;
  titleDark?: boolean;
}) {
  const locale = useLocale();
  const Icon = SERVICE_CARD_ICONS[iconIndex % SERVICE_CARD_ICONS.length]!;
  const href = `/services/${encodeURIComponent(pickServiceSlug(item, locale))}`;
  const title = plainTextFromHtml(item?.title);
  const description = stripLeadingDuplicateHeading(item?.description, item?.title);
  const subtitle = stripLeadingDuplicateHeading(item?.subtitle, item?.title);
  const useLightCard = titleDark;

  return (
    <CountryLink href={href} countryCode={countryCode} className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        viewport={{ once: true }}
        className="group h-full"
      >
        <Card
          className={cn(
            "service-card flex h-full min-h-88 flex-col items-center gap-5 rounded-2xl border-2 border-transparent px-6 py-8 text-center shadow-none ring-0 transition-all duration-300",
            "group-hover:border-brand",
            useLightCard
              ? "bg-white border-2 border-brand group-hover:shadow-lg"
              : "bg-[#2a2d30]",
          )}
        >
          <CardHeader className="w-full shrink-0 gap-4 px-0 pb-0">
            <CardTitle className="flex w-full min-w-0 flex-col items-center gap-4">
              <div
                className={cn(
                  "flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-brand transition-all duration-300",
                  "group-hover:bg-brand group-hover:text-white",
                  "md:h-20 md:w-20",
                )}
              >
                <Icon className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h3
                className={cn(
                  serviceCardTitleClassName,
                  useLightCard && "text-gray-900",
                )}
              >
                {title}
              </h3>
              {subtitle.trim() ? (
                <RichHtml
                  html={subtitle}
                  as="p"
                  className={cn(
                    "service-card__subtitle line-clamp-2 min-h-10 w-full text-center text-sm font-medium",
                    useLightCard ? "text-gray-600" : "text-white/80",
                  )}
                />
              ) : (
                <span aria-hidden />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex w-full flex-1 flex-col px-0 pt-0">
            <CardDescription
              className={cn(
                "flex flex-1 flex-col text-center text-base leading-relaxed",
                useLightCard ? "text-gray-600" : "text-gray-400",
              )}
            >
              <RichHtml
                html={description}
                as="span"
                className={cn(
                  "service-card__description line-clamp-7! block w-full [&_p]:mb-2 [&_p:last-child]:mb-0",
                  useLightCard ? "text-gray-600" : "text-white",
                )}
              />
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </CountryLink>
  );
}
