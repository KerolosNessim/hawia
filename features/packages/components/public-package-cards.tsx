"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicPackageCard } from "@/features/packages/services/packages-public-api";
import { Link } from "@/i18n/navigation";
import { Gem, Rocket, Target } from "lucide-react";
import { motion } from "framer-motion";

export function PackageIcon({
  pkg,
  className,
}: {
  pkg: PublicPackageCard;
  className: string;
}) {
  if (pkg.iconImageUrl) {
    return (
      <img
        src={pkg.iconImageUrl}
        alt=""
        className={`${className} object-contain`}
      />
    );
  }
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

export function DetailsButton({
  pkg,
  fallbackLabel,
}: {
  pkg: PublicPackageCard;
  fallbackLabel: string;
}) {
  const label = pkg.buttonText?.trim() || fallbackLabel;
  const external = pkg.detailsUrl?.trim();
  if (external && /^https?:\/\//i.test(external)) {
    return (
      <Button
        asChild
        className="w-32 rounded-full font-bold shadow-md transition-all duration-300 bg-brand hover:bg-brand/90 text-white"
      >
        <a href={external} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      </Button>
    );
  }
  const href =
    external && external.startsWith("/") ? external : `/packages/${encodeURIComponent(pkg.slug)}`;
  return (
    <Button
      asChild
      className="w-32 rounded-full font-bold shadow-md transition-all duration-300 bg-brand hover:bg-brand/90 text-white"
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
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
      <p className="text-center text-muted-foreground py-12 max-w-xl mx-auto">{emptyHint}</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
      {items.map((pkg, index) => (
        <motion.div
          key={`${pkg.id}-${index}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
          viewport={{ once: true }}
          className="h-full"
        >
          <Card
            className={`h-full transition-shadow duration-300 hover:shadow-xl rounded-2xl flex flex-col ${
              pkg.isFeatured
                ? "border-2 border-brand shadow-lg md:scale-107 z-10 bg-white"
                : "border border-gray-200 bg-white"
            }`}
          >
            <CardContent className="p-8 flex flex-col items-center text-center h-full">
              <div className="mb-6 mx-auto bg-gray-50 rounded-full p-4 border border-gray-100 shadow-sm h-[72px] w-[72px] flex items-center justify-center overflow-hidden">
                <PackageIcon pkg={pkg} className="w-10 h-10 text-brand" />
              </div>

              <h3
                className={`text-xl font-bold mb-4 ${pkg.isFeatured ? "text-brand" : "text-gray-900"}`}
              >
                {pkg.title}
              </h3>

              {pkg.priceLabel ? (
                <p className="text-sm font-semibold text-brand mb-2">{pkg.priceLabel}</p>
              ) : null}

              <p className="text-gray-600 mb-8 leading-relaxed text-sm flex-1">{pkg.description}</p>

              <DetailsButton pkg={pkg} fallbackLabel={detailsFallback} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
