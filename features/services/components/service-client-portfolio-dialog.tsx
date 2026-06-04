"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type { ServiceClientPortfolioItem } from "@/features/services/types";
import { RichHtml } from "@/features/shared/components/rich-html";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  if (!value.trim()) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(value);
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wide text-brand">
        {label}
      </h3>
      {isHtml ? (
        <RichHtml
          html={value}
          className="cms-rich-html text-sm leading-relaxed text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0"
        />
      ) : (
        <p className="text-sm leading-relaxed text-foreground">{value}</p>
      )}
    </div>
  );
}

type Props = {
  item: ServiceClientPortfolioItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ServiceClientPortfolioDialog({
  item,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations("singleService.clientPortfolio");

  if (!item) return null;

  const title = item.client || item.clientTag || item.headline;
  const buttonLabel = item.readCaseStudyButtonText?.trim() || t("readCaseStudy");
  const link = item.caseStudyLink;
  const cta = link?.href ? (
    link.external ? (
      <Button
        asChild
        className="mt-2 w-full rounded-full bg-brand text-white hover:bg-brand/90 sm:w-auto"
      >
        <a href={link.href} target="_blank" rel="noopener noreferrer">
          {buttonLabel}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </a>
      </Button>
    ) : (
      <Button
        asChild
        className="mt-2 w-full rounded-full bg-brand text-white hover:bg-brand/90 sm:w-auto"
      >
        <Link href={link.href}>
          {buttonLabel}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </Button>
    )
  ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90vh,52rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="overflow-y-auto">
          {item.image ? (
            <div className="relative flex min-h-[12rem] items-center justify-center bg-linear-to-b from-brand/20 to-muted/30 px-6 py-8">
              <div className="absolute inset-0 flex items-center justify-center opacity-60">
                <div className="size-48 rounded-full bg-brand/20 blur-3xl" />
              </div>
              <Image
                src={item.image}
                alt={item.imageAlt || title}
                width={320}
                height={320}
                className="relative z-10 max-h-52 w-auto object-contain"
                unoptimized={isRemoteMediaUrl(item.image)}
              />
            </div>
          ) : null}

          <div className="space-y-5 p-6">
            <div className="space-y-2">
              {item.clientTag ? (
                <span className="inline-block rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                  {item.clientTag}
                </span>
              ) : null}
              {item.headline ? (
                <p className="text-3xl font-black leading-tight text-brand">
                  {item.headline}
                </p>
              ) : null}
              {item.period ? (
                <p className="text-sm text-muted-foreground">{item.period}</p>
              ) : null}
              {item.client ? (
                <p className="text-base font-semibold text-foreground">
                  {item.client}
                </p>
              ) : null}
            </div>

            {item.metrics.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {item.metrics.map((metric) => (
                  <li
                    key={metric}
                    className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-sm font-semibold text-brand"
                  >
                    {metric}
                  </li>
                ))}
              </ul>
            ) : null}

            <DetailBlock label={t("challenge")} value={item.challenge} />
            <DetailBlock label={t("whatWeDid")} value={item.whatWeDid} />
            <DetailBlock label={t("results")} value={item.results} />
            {cta}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
