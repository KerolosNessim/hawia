"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  getBreadcrumbTrailItems,
  humanizeSegment,
  isBreadcrumbSegment,
} from "@/features/shared/lib/breadcrumb-trail";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

export default function SiteBreadcrumb() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("seo.breadcrumb");
  const isRtl = locale === "ar";

  const items = useMemo(
    () =>
      getBreadcrumbTrailItems(pathname, (segment) => {
        if (segment === "home") return t("home");
        if (isBreadcrumbSegment(segment)) return t(segment);
        return humanizeSegment(segment);
      }),
    [pathname, t],
  );

  if (!items) {
    return null;
  }

  const SeparatorIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <div className="border-b border-border/60 bg-background">
      <div className="container py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {items.flatMap((item, index) => {
              const isLast = index === items.length - 1;
              const nodes = [];

              if (index > 0) {
                nodes.push(
                  <BreadcrumbSeparator key={`sep-${item.href}`}>
                    <SeparatorIcon className="size-3.5" />
                  </BreadcrumbSeparator>,
                );
              }

              nodes.push(
                <BreadcrumbItem key={item.href}>
                  {isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>,
              );

              return nodes;
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
