"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SectionHeader from "@/features/shared/components/section-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { SectionLinkShell } from "@/features/services/components/section-link-shell";
import { sectionSubtitleColor } from "@/features/services/lib/section-tone";
import type { SectionTone } from "@/features/services/lib/section-tone";
import type { ServicePackageItem, ServicePackagesSection } from "@/features/services/types";
import * as motion from "framer-motion/client";
import { CheckCircle2, Gem, Rocket, Target, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  packages: ServicePackagesSection;
  orderPhone?: string | null;
};

function packageIcon(name: ServicePackageItem["icon"], className: string) {
  switch (name) {
    case "gem":
      return <Gem className={className} />;
    case "rocket":
      return <Rocket className={className} />;
    default:
      return <Target className={className} />;
  }
}

function whatsappOrderHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${digits}`;
}

function PackageDetailDialog({
  pkg,
  open,
  onOpenChange,
  orderPhone,
}: {
  pkg: ServicePackageItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderPhone?: string | null;
}) {
  const t = useTranslations("singleService.seoPackages");
  const priceLabel =
    pkg.price && pkg.currency
      ? `${pkg.price} ${pkg.currency}`
      : pkg.price
        ? pkg.price
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-none max-w-md gap-0 overflow-visible rounded-2xl border border-border/60 p-0 sm:max-w-md"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute start-4 top-4 z-10 rounded-full p-1 text-brand hover:bg-brand/10"
          aria-label={t("close")}
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center px-8 pb-0 pt-10 text-center">
          <div className="mb-4 rounded-full border border-brand/20 bg-brand/5 p-4">
            {packageIcon(pkg.icon, "size-10 text-brand")}
          </div>
          <DialogHeader className="space-y-0 text-center">
            <DialogTitle className="text-xl font-bold text-foreground [&_p]:mb-0">
              <RichHtml html={pkg.title} as="span" className="inline" />
            </DialogTitle>
          </DialogHeader>
        </div>

        {pkg.features.length > 0 ? (
          <ul className="mx-8 my-6 space-y-3 text-start">
            {pkg.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {priceLabel ? (
          <div className="border-t border-border/60 px-8 py-5 text-center">
            <p className="text-sm font-medium text-brand">{t("pricesFrom")}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand">{priceLabel}</p>
          </div>
        ) : null}

        {orderPhone?.trim() ? (
          <a
            href={whatsappOrderHref(orderPhone.trim())}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-brand py-4 text-center text-base font-bold text-white transition-colors hover:bg-brand/90"
          >
            {t("orderNow")}
          </a>
        ) : (
          <Button
            type="button"
            className="h-12 w-full rounded-none rounded-b-2xl bg-brand text-base font-bold text-white hover:bg-brand/90"
            onClick={() => onOpenChange(false)}
          >
            {t("orderNow")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function SeoPackages({
  packages,
  orderPhone,
  tone = "light",
}: Props & { tone?: SectionTone }) {
  const t = useTranslations("singleService.seoPackages");
  const [activePkg, setActivePkg] = useState<ServicePackageItem | null>(null);

  if (!packages.items.length) return null;

  const sectionTitleHtml = packages.title.trim() || undefined;

  return (
    <div className="container space-y-10">
        <SectionHeader
          titleHtml={sectionTitleHtml}
          title={t("title")}
          subtitleHtml={packages.description}
          subtitleColor={sectionSubtitleColor(tone)}
        />

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.items.map((pkg, index) => {
            const cardHref = pkg.link?.trim();
            const cardBody = (
              <Card
                className={`flex h-full flex-col rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-lg ${
                  pkg.isFeatured ? "border-2 border-brand shadow-md md:scale-[1.03]" : "border-border/70"
                } ${cardHref ? "cursor-pointer" : ""}`}
              >
                <CardContent className="flex h-full flex-col items-center p-8 text-center">
                  <div className="mb-6 rounded-full border border-border/80 bg-muted/40 p-4">
                    {packageIcon(pkg.icon, "size-10 text-brand")}
                  </div>

                  <RichHtml
                    html={pkg.title}
                    as="h3"
                    className={`mb-4 text-xl font-bold ${pkg.isFeatured ? "text-brand" : "text-foreground"}`}
                  />

                  {pkg.descriptionHtml?.trim() ? (
                    <RichHtml
                      html={pkg.descriptionHtml}
                      className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground"
                    />
                  ) : (
                    <div className="mb-8 flex-1" />
                  )}

                  {cardHref ? null : (
                    <Button
                      type="button"
                      className="h-11 min-w-[8rem] rounded-full bg-brand px-8 font-bold text-white hover:bg-brand/90"
                      onClick={() => setActivePkg(pkg)}
                    >
                      {t("detailsBtn")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );

            return (
              <motion.div
                key={`${pkg.title}-${pkg.sortOrder}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="h-full"
              >
                {cardHref ? (
                  <SectionLinkShell link={cardHref} className="block h-full">
                    {cardBody}
                  </SectionLinkShell>
                ) : (
                  cardBody
                )}
              </motion.div>
            );
          })}
        </div>

      {activePkg ? (
        <PackageDetailDialog
          pkg={activePkg}
          open={Boolean(activePkg)}
          onOpenChange={(open) => !open && setActivePkg(null)}
          orderPhone={orderPhone}
        />
      ) : null}
    </div>
  );
}
