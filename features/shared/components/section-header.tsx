"use client";

import { motion } from "framer-motion";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: "center" | "start";
  subtitleColor?: string;
};

export default function SectionHeader({
  title,
  subtitle,
  badge,
  align = "center",
  subtitleColor = "text-gray-200",
}: SectionHeaderProps) {
  const alignment = {
    start: " text-start ",
    center: " text-center flex-col justify-center ",
  };

  return (
    <div className={`container space-y-4  ${alignment[align]}`}>
      {/* Badge */}
      {badge && (
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-bold"
        >
          {badge}
        </motion.span>
      )}

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl text-brand font-bold tracking-tight"
      >
        {title}
      </motion.h2>

      {/* Animated Line */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "80px" }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className={`h-[3px] bg-brand rounded-full ${align === "center" ? "mx-auto" : ""}`}
      />

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className={`text-gray-200 max-w-6xl ${subtitleColor} ${align === "center" ? "mx-auto" : ""}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
