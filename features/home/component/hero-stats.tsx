"use client";

import { useTranslations } from "next-intl";
import { NumberTicker } from "@/components/ui/number-ticker";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";

interface StatItemProps {
  value: number;
  suffix?: string;
  title: string;
  description: string;
  index: number;
}

function StatItem({ value, suffix, title, description, index }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white/50 backdrop-blur-3xl flex flex-col items-center justify-center p-4   rounded-2xl   text-center min-w-[200px] flex-1"
    >
      <div className=" text-3xl font-extrabold text-brand flex items-center gap-0.5">
        <NumberTicker value={value} className="text-brand" />
        {suffix && <span className="text-brand">{suffix}</span>}
      </div>
      <h3 className=" font-bold mt-2 text-zinc-800 text-xs">
        {title}
      </h3>
      <p className=" text-zinc-900  mt-1 max-w-[180px] text-[10px]">
        {description}
      </p>
    </motion.div>
  );
}

export function HeroStats() {
  const t = useTranslations("hero.stats");

  const stats = [
    {
      value: 10,
      suffix: "+",
      title: t("leadership.title"),
      description: t("leadership.description"),
    },
    {
      value: 500,
      suffix: "+",
      title: t("success.title"),
      description: t("success.description"),
    },
    {
      value: 500,
      suffix: "+",
      title: t("sales.title"),
      description: t("sales.description"),
    },
    {
      value: 500,
      suffix: "%",
      title: t("traffic.title"),
      description: t("traffic.description"),
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-4 mt-4",
        // Mobile: horizontal scroll or wrap
        "grid-cols-2",
        // Desktop: vertical stack (as requested "بالطول")
        "xl:grid-cols-1 "
      )}
    >
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} index={index} />
      ))}
    </div>
  );
}
