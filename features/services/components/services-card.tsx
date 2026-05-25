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
import { useLocale } from "next-intl";
import { pickServiceSlug, servicePostPath } from "../lib/services-routes";
import { Service } from "../types";
export default function ServicesCard({
  item,
  icon: Icon,
  index,
}: {
  item: Service;
  icon: LucideIcon;
  index: number;
}) {
  const locale = useLocale();
  const href = servicePostPath(pickServiceSlug(item, locale));

  return (
    <Link href={href} className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        viewport={{ once: true }}
        className="h-full group"
      >
        <Card className="service-card flex h-full flex-col bg-card transition-[box-shadow,background-color,ring-color] duration-300 group-hover:bg-brand/5 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-brand group-hover:ring-offset-2">
          <CardHeader className="shrink-0">
            <CardTitle className="flex w-full min-w-0 flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white md:h-20 md:w-20">
                <Icon className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <RichHtml
                html={item?.title}
                as="p"
                className="service-card__title w-full overflow-visible text-center text-xl font-bold text-foreground [&_a]:text-brand group-hover:[&_a]:text-brand"
              />
              {item?.subtitle?.trim() ? (
                <RichHtml
                  html={item.subtitle}
                  as="p"
                  className="service-card__subtitle w-full overflow-visible text-center text-sm font-medium text-muted-foreground"
                />
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 shrink-0">
            <CardDescription className="w-full overflow-visible text-center text-base font-semibold leading-relaxed text-muted-foreground [&_p]:mb-2 [&_p:last-child]:mb-0">
              <RichHtml
                html={item?.description}
                as="span"
                className="service-card__description block w-full overflow-visible text-muted-foreground"
              />
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
