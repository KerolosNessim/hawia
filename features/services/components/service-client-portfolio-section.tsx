"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import ServiceClientPortfolioDialog from "@/features/services/components/service-client-portfolio-dialog";
import type {
  ServiceClientPortfolio,
  ServiceClientPortfolioItem,
} from "@/features/services/types";
import SectionHeader from "@/features/shared/components/section-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import * as motion from "framer-motion/client";
import Image from "next/image";

function PortfolioLink({
  link,
  className,
  children,
}: {
  link: { href: string; external: boolean } | null;
  className?: string;
  children: ReactNode;
}) {
  if (!link?.href) {
    return <div className={className}>{children}</div>;
  }
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {children}
    </Link>
  );
}

function PortfolioCard({
  item,
  readLabel,
  onOpenDetails,
}: {
  item: ServiceClientPortfolioItem;
  readLabel: string;
  onOpenDetails: (item: ServiceClientPortfolioItem) => void;
}) {
  const label = item.readCaseStudyButtonText?.trim() || readLabel;

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails(item);
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={cn(
        "group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[2rem] border border-border/60 bg-linear-to-b from-brand/15 to-white p-6 shadow-lg transition-shadow hover:shadow-xl sm:min-h-[24rem]",
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
      )}
    >
      {item.image ? (
        <div className="relative mx-auto mb-4 flex h-40 w-full items-center justify-center sm:h-44">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3/5 w-3/5 rounded-full bg-brand/25 blur-3xl" />
          </div>
          <Image
            src={item.image}
            alt={item.imageAlt || item.clientTag || item.headline}
            width={280}
            height={280}
            className="relative z-10 h-full w-auto max-w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
            unoptimized={isRemoteMediaUrl(item.image)}
          />
        </div>
      ) : null}

      <div className="mt-auto space-y-3">
        {item.clientTag ? (
          <span className="inline-block rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
            {item.clientTag}
          </span>
        ) : null}
        {item.headline ? (
          <p className="text-2xl font-black leading-tight text-brand sm:text-3xl">
            {item.headline}
          </p>
        ) : null}
        {item.period ? (
          <p className="text-sm font-medium text-muted-foreground">{item.period}</p>
        ) : null}
        {item.client ? (
          <p className="text-sm font-semibold text-foreground">{item.client}</p>
        ) : null}
        {item.metrics.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {item.metrics.map((metric) => (
              <li
                key={metric}
                className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand"
              >
                {metric}
              </li>
            ))}
          </ul>
        ) : null}
        <span className="inline-flex items-center gap-1 text-sm font-bold text-brand group-hover:underline">
          {label}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </span>
      </div>
    </motion.article>
  );
}

function ViewAllCard({
  portfolio,
}: {
  portfolio: ServiceClientPortfolio;
}) {
  const card = portfolio.viewAllCard;
  if (!card?.title && !card.description) return null;

  const link = card.link ?? portfolio.viewAllLink;
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex h-full min-h-[22rem] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-brand/40 bg-brand/5 p-8 text-center sm:min-h-[24rem]"
    >
      {card.title ? (
        <h3 className="text-xl font-bold text-foreground sm:text-2xl">{card.title}</h3>
      ) : null}
      {card.description ? (
        <RichHtml
          html={card.description}
          className="mt-3 text-sm text-muted-foreground [&_p]:mb-0"
        />
      ) : null}
      {(card.buttonText || portfolio.viewAllButtonText) && link ? (
        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white">
          {card.buttonText || portfolio.viewAllButtonText}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </span>
      ) : null}
    </motion.div>
  );

  if (link) {
    return (
      <PortfolioLink link={link} className="block h-full">
        {inner}
      </PortfolioLink>
    );
  }
  return inner;
}

export default function ServiceClientPortfolioSection({
  portfolio,
}: {
  portfolio: ServiceClientPortfolio;
}) {
  const t = useTranslations("singleService.clientPortfolio");
  const readLabel =
    portfolio.defaultReadCaseStudyText?.trim() || t("readCaseStudy");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ServiceClientPortfolioItem | null>(null);

  const openDetails = (item: ServiceClientPortfolioItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const showViewAllFooter =
    portfolio.viewAllLink &&
    portfolio.viewAllButtonText &&
    !portfolio.viewAllCard?.buttonText;

  return (
    <section className="container space-y-8">
      <SectionHeader
        titleHtml={portfolio.title || undefined}
        title={t("title")}
        subtitleHtml={portfolio.subtitle || undefined}
        subtitle={t("subtitle")}
        subtitleColor="text-gray-500"
        align="start"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {portfolio.items.map((item) => (
          <PortfolioCard
            key={item.id}
            item={item}
            readLabel={readLabel}
            onOpenDetails={openDetails}
          />
        ))}
        {portfolio.viewAllCard ? (
          <ViewAllCard portfolio={portfolio} />
        ) : null}
      </div>

      {showViewAllFooter ? (
        <div className="flex justify-center">
          <PortfolioLink link={portfolio.viewAllLink}>
            <Button className="rounded-full bg-brand px-8 text-white hover:bg-brand/90">
              {portfolio.viewAllButtonText}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
          </PortfolioLink>
        </div>
      ) : null}

      <ServiceClientPortfolioDialog
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={(next) => {
          setDialogOpen(next);
          if (!next) setSelectedItem(null);
        }}
      />
    </section>
  );
}
