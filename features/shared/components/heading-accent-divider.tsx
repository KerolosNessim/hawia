"use client";

import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";
import { useLocale } from "next-intl";

type Props = {
  align?: "center" | "start";
  className?: string;
};

export function HeadingAccentDivider({ align = "center", className }: Props) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.6 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      aria-hidden
      className={cn(
        "flex w-full items-center gap-1.5",
        isRtl ? "flex-row" : "flex-row-reverse",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
    >
      <span className="h-[3px] w-14 rounded-full bg-brand sm:w-16" />
      <span className="size-1.5 rounded-full bg-brand" />
      <span className="size-1.5 rounded-full bg-brand" />
      <span className="size-1.5 rounded-full bg-brand" />
    </motion.div>
  );
}
