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
  resolveBreadcrumbSegmentLabel,
  type BreadcrumbTrailItem,
} from "@/features/shared/lib/breadcrumb-trail";
import { CountryLink } from "@/features/shared/components/country-link";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

type SiteBreadcrumbProps = {
  /** On hero banners: light text over the image. Inline: below the fixed navbar. */
  variant?: "hero" | "inline";
  className?: string;
  /** When set (e.g. blog post with category), replaces pathname-derived trail. */
  items?: BreadcrumbTrailItem[];
};

export default function SiteBreadcrumb({
  variant = "inline",
  className,
  items: itemsOverride,
}: SiteBreadcrumbProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("seo.breadcrumb");
  const tPackages = useTranslations("packagesPage");
  const isRtl = locale === "ar";

  const items = useMemo(() => {
    if (itemsOverride?.length) return itemsOverride;
    return getBreadcrumbTrailItems(pathname, (segment) => {
      if (
        segment.toLowerCase() === "categories" &&
        pathname.startsWith("/packages")
      ) {
        return tPackages("breadcrumbCategories");
      }
      return resolveBreadcrumbSegmentLabel(segment, (key) => t(key));
    });
  }, [itemsOverride, pathname, t, tPackages]);

  if (!items) {
    return null;
  }

  const SeparatorIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;
  const isHero = variant === "hero";

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList
        className={cn(
          "flex-nowrap gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
                <SeparatorIcon className="size-3 shrink-0 sm:size-3.5" />
              </BreadcrumbSeparator>,
            );
          }

          nodes.push(
            <BreadcrumbItem key={item.href}>
              {isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <CountryLink href={item.href}>{item.label}</CountryLink>
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
        "border-b border-border/60 bg-background pt-14 sm:pt-16 md:pt-24",
        className,
      )}
    >
      <div className="container py-3">
        <SiteBreadcrumb variant="inline" />
      </div>
    </div>
  );
}
