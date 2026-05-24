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
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

type SiteBreadcrumbProps = {
  /** On hero banners: light text over the image. Inline: below the fixed navbar. */
  variant?: "hero" | "inline";
  className?: string;
};

export default function SiteBreadcrumb({
  variant = "inline",
  className,
}: SiteBreadcrumbProps) {
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
  const isHero = variant === "hero";

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList
        className={cn(
          isHero &&
            "text-white/75 [&_[data-slot=breadcrumb-link]]:text-white/75 [&_[data-slot=breadcrumb-link]]:hover:text-white [&_[data-slot=breadcrumb-page]]:text-white [&_svg]:text-white/50",
        )}
      >
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
  );
}

/** Breadcrumb below the fixed navbar for pages without a hero banner. */
export function SiteBreadcrumbBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-b border-border/60 bg-background pt-20 md:pt-24",
        className,
      )}
    >
      <div className="container py-3">
        <SiteBreadcrumb variant="inline" />
      </div>
    </div>
  );
}
