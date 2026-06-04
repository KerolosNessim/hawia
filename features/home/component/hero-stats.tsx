"use client";

import { NumberTicker } from "@/components/ui/number-ticker";
import { RichHtml } from "@/features/shared/components/rich-html";
import { parseStatNumber } from "@/features/home/lib/parse-stat-number";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import * as motion from "framer-motion/client";
import type { HeroStat } from "../types";

interface StatItemProps {
  prefix: string;
  value: number | null;
  suffix: string;
  display: string;
  title: string;
  description: string;
  index: number;
}

function StatItem({
  prefix,
  value,
  suffix,
  display,
  title,
  description,
  index,
}: StatItemProps) {
  const descriptionText = plainTextFromHtml(description);
  const hasDescription = descriptionText.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white flex min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-2xl p-4 text-center max-lg:min-w-0 lg:min-w-[200px]"
    >
      <h3 className="flex w-full flex-col items-center gap-2 text-zinc-800">
        <span className="inline-flex flex-wrap items-baseline justify-center gap-0.5 text-5xl font-extrabold leading-none text-brand">
          {prefix ? <span className="text-brand">{prefix}</span> : null}
          {value != null ? (
            <NumberTicker value={value} className="text-brand" />
          ) : display ? (
            <span className="text-brand">{display}</span>
          ) : null}
          {suffix ? <span className="text-brand">{suffix}</span> : null}
        </span>
        {title ? (
          <span className="block text-xl font-bold text-zinc-800">{title}</span>
        ) : null}
      </h3>
      {hasDescription ? (
        <RichHtml
          as="div"
          html={description}
          className="mt-0 max-w-[180px] overflow-visible text-sm text-zinc-900 [&_*]:overflow-visible"
        />
      ) : null}
    </motion.div>
  );
}

export function HeroStats({ stats }: { stats?: HeroStat[] }) {
  const displayStats = Array.isArray(stats)
    ? stats.map((stat) => {
        const parsed = parseStatNumber(stat.content.number);
        return {
          ...parsed,
          title: stat.content.title?.trim() ?? "",
          description: stat.content.description ?? "",
        };
      })
    : [];

  if (displayStats.length === 0) return null;

  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 max-sm:grid-cols-1 sm:gap-4 lg:grid-cols-4">
      {displayStats.map((stat, index) => (
        <StatItem key={index} {...stat} index={index} />
      ))}
    </div>
  );
}
