"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PublicPackageCard } from "@/features/packages/services/packages-public-api";
import { Link } from "@/i18n/navigation";
import { Gem, Rocket, Target } from "lucide-react";
import { motion } from "framer-motion";
import { RichHtml } from "@/features/shared/components/rich-html";
import {
  DEFAULT_INLINE_IMG_HEIGHT,
  DEFAULT_INLINE_IMG_WIDTH,
} from "@/lib/inline-image-alt";
import type { ReactNode } from "react";

export function PackageImage({
  pkg,
  className,
  wrapperClassName,
}: {
  pkg: PublicPackageCard;
  className: string;
  /** Outer frame (card circle vs detail hero). */
  wrapperClassName?: string;
}) {
  if (pkg.imageUrl) {
    return (
      <div
        className={
          wrapperClassName ??
          "flex h-full w-full items-center justify-center overflow-hidden"
        }
      >
        <img
          src={pkg.imageUrl}
          alt={pkg.imageAlt || pkg.title}
          width={DEFAULT_INLINE_IMG_WIDTH}
          height={DEFAULT_INLINE_IMG_HEIGHT}
          loading="lazy"
          decoding="async"
          className={`${className} h-auto max-w-full object-contain`}
        />
      </div>
    );
  }
  return <PackageIcon pkg={pkg} className={className} />;
}

export function PackageIcon({
  pkg,
  className,
}: {
  pkg: PublicPackageCard;
  className: string;
}) {
  const preset = pkg.iconPreset ?? "target";
  switch (preset) {
    case "gem":
      return <Gem className={className} />;
    case "rocket":
      return <Rocket className={className} />;
    default:
      return <Target className={className} />;
  }
}

export type PackageCardHref =
  | { type: "external"; href: string }
  | { type: "internal"; href: string };

export function resolvePackageCardHref(pkg: PublicPackageCard): PackageCardHref {
  const external = pkg.detailsUrl?.trim();
  if (external && /^https?:\/\//i.test(external)) {
    return { type: "external", href: external };
  }
  const href =
    external && external.startsWith("/")
      ? external
      : `/packages/${encodeURIComponent(pkg.slug)}`;
  return { type: "internal", href };
}

const packageDetailsLabelClassName =
  "inline-flex min-h-12 min-w-[8.5rem] shrink-0 items-center justify-center rounded-full bg-brand px-8 py-3 text-center text-sm font-bold text-white shadow-md transition-all duration-300 group-hover/card:bg-brand/90";

function PackageCardShell({
  pkg,
  children,
}: {
  pkg: PublicPackageCard;
  children: ReactNode;
}) {
  const target = resolvePackageCardHref(pkg);
  const shellClassName = "group/card block h-full focus-visible:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

  if (target.type === "external") {
    return (
      <a
        href={target.href}
        target="_blank"
        rel="noopener noreferrer"
        className={shellClassName}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={target.href} className={shellClassName}>
      {children}
    </Link>
  );
}

export function DetailsButton({
  pkg,
  fallbackLabel,
}: {
  pkg: PublicPackageCard;
  fallbackLabel: string;
}) {
  const label = pkg.buttonText?.trim() || fallbackLabel;
  return <span className={packageDetailsLabelClassName}>{label}</span>;
}

export function PublicPackageCardGrid({
  items,
  detailsFallback,
  emptyHint,
}: {
  items: PublicPackageCard[];
  detailsFallback: string;
  emptyHint: string;
}) {
  if (items.length === 0) {
    return (
      <p className="mx-auto max-w-xl py-12 text-center text-muted-foreground">{emptyHint}</p>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((pkg, index) => (
        <motion.div
          key={`${pkg.id}-${index}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
          viewport={{ once: true }}
          className="h-full min-w-0"
        >
          <PackageCardShell pkg={pkg}>
            <Card
              className={`flex h-full flex-col overflow-hidden rounded-2xl transition-shadow duration-300 group-hover/card:shadow-xl ${
                pkg.isFeatured
                  ? "z-10 border-2 border-brand bg-white shadow-lg ring-2 ring-brand/25"
                  : "border border-gray-200 bg-white"
              }`}
            >
              <CardContent className="flex h-full flex-col items-center overflow-hidden p-8 text-center">
                <div className="mx-auto mb-6 flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50 p-2 shadow-sm">
                  <PackageImage
                    pkg={pkg}
                    className={pkg.imageUrl ? "h-full w-full object-contain" : "h-10 w-10 text-brand"}
                    wrapperClassName="flex h-full w-full items-center justify-center"
                  />
                </div>

                <h3
                  className={`mb-4 shrink-0 text-xl font-bold transition-colors group-hover/card:text-brand ${
                    pkg.isFeatured ? "text-brand" : "text-gray-900"
                  }`}
                >
                  {pkg.title}
                </h3>

                {pkg.priceLabel ? (
                  <p className="mb-2 shrink-0 text-sm font-semibold text-brand">{pkg.priceLabel}</p>
                ) : null}

                <div className="mb-4 w-full min-w-0 flex-1">
                  <RichHtml
                    html={pkg.description}
                    className="overflow-visible text-sm leading-relaxed text-gray-600 [&_*]:overflow-visible [&_p]:line-clamp-4"
                  />
                </div>

                <div className="mt-auto w-full shrink-0 border-t border-gray-100/80 pt-6 pb-1">
                  <div className="flex justify-center px-2 py-2">
                    <DetailsButton pkg={pkg} fallbackLabel={detailsFallback} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </PackageCardShell>
        </motion.div>
      ))}
    </div>
  );
}
