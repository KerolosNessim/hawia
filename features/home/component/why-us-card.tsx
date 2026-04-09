"use client";
import React from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhyUsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

export const WhyUsCard: React.FC<WhyUsCardProps> = ({
  title,
  description,
  icon: Icon,
  index,
  progress,
  range,
  targetScale,
}) => {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div 
      className="flex items-center justify-center sticky pt-24"
      style={{ top: `${index * 20 + 80}px` }}
    >
      <motion.div
        style={{
          scale,
        }}
        className={cn(
          "w-full max-w-7xl min-h-64 bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 relative origin-top",
        )}
      >
        <div className="flex-1 space-y-4 text-start">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            {title}
          </h3>
          <p className="text-gray-600 md:text-lg leading-relaxed">
            {description}
          </p>
        </div>

        <div className="shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand/20 flex items-center justify-center text-brand">
            <Icon className="w-8 h-8 md:w-10 md:h-10" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
