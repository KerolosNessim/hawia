import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import * as motion from "framer-motion/client";
import { Link } from "@/i18n/navigation";
import { RichHtml } from "@/features/shared/components/rich-html";
import { stripLeadingDuplicateHeading } from "@/features/shared/lib/strip-leading-duplicate-heading";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { useLocale } from "next-intl";
import { pickServiceSlug, servicePostPath } from "../lib/services-routes";
import { Service } from "../types";
import { cn } from "@/lib/utils";

const serviceCardTitleClassName =
  "service-card__title line-clamp-2 min-h-14 w-full text-center text-xl font-bold text-white";

export default function ServicesCard({
  item,
  icon: Icon,
  index,
  countryId,
  titleAsPlainH3 = false,
  titleDark = false,
}: {
  item: Service;
  icon: LucideIcon;
  index: number;
  /** Preserves country context on service detail URLs (`?country_id=`). */
  countryId?: number;
  /** Related-services carousel only: plain `<h3>` with HTML stripped from title. */
    titleAsPlainH3?: boolean;
  titleDark?: boolean;
}) {
  const locale = useLocale();
  const href = servicePostPath(pickServiceSlug(item, locale), { countryId });
  const title = plainTextFromHtml(item?.title);
  const description = stripLeadingDuplicateHeading(item?.description, item?.title);
  const subtitle = stripLeadingDuplicateHeading(item?.subtitle, item?.title);

  return (
    <Link href={href} className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        viewport={{ once: true }}
        className="h-full group"
      >
        <Card className="service-card flex h-full min-h-88 flex-col bg-white/20 backdrop-blur-lg transition-[box-shadow,background-color,ring-color] duration-300 group-hover:bg-brand/5 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-brand ">
          <CardHeader className="shrink-0">
            <CardTitle className="flex w-full min-w-0 flex-col items-center gap-2">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white md:h-20 md:w-20">
                <Icon className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              {titleAsPlainH3 ? (
                <h3 className={cn(serviceCardTitleClassName, titleDark && "text-gray-900")}>
                  {title}
                </h3>
              ) : (
                <h2 className={cn(serviceCardTitleClassName, titleDark && "text-gray-900")}>{title}</h2>
              )}
              {subtitle.trim() ? (
                <RichHtml
                  html={subtitle}
                  as="p"
                  className={cn("service-card__subtitle line-clamp-2 min-h-10 w-full text-center text-sm font-medium", titleDark ?"text-gray-900": "text-white")}
                />
              ) : (
                <span className="min-h-10" aria-hidden />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <CardDescription className="flex flex-1 flex-col text-center text-base font-semibold leading-relaxed text-muted-foreground">
              <RichHtml
                html={description}
                as="span"
                className="service-card__description line-clamp-4 block w-full text-muted-foreground [&_p]:mb-2 [&_p:last-child]:mb-0"
              />
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
