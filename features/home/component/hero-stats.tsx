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
      className="bg-white  flex flex-col items-center justify-center gap-4 p-4   rounded-2xl   text-center min-w-[200px] flex-1"
    >
      <div className=" text-5xl font-extrabold text-brand flex items-center gap-0.5">
        <NumberTicker value={value} className="text-brand" />
        {suffix && <span className="text-brand">{suffix}</span>}
      </div>
      <h3 className=" text-xl  font-bold mt-2 text-zinc-800">
        {title}
      </h3>
      <p className=" text-zinc-900  mt-1 max-w-[180px]  text-sm">
        {description}
      </p>
    </motion.div>
  );
}

import type { HeroStat } from "../types";

export function HeroStats({ stats }: { stats?: HeroStat[] }) {
  const t = useTranslations("hero.stats");

  const displayStats = stats?.map(stat => {
    // Extract numbers and non-numbers from the string (e.g., "+10" -> value: 10, suffix: "+")
    const numMatch = stat.content.number.match(/\d+/);
    const suffixMatch = stat.content.number.match(/[^\d]+/);
    
    return {
      value: numMatch ? parseInt(numMatch[0]) : 0,
      suffix: suffixMatch ? suffixMatch[0] : "",
      title: stat.content.title,
      description: stat.content.description,
    };
  }) || [];

  if (displayStats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {displayStats.map((stat, index) => (
        <StatItem key={index} {...stat} index={index} />
      ))}
    </div>
  );
}
