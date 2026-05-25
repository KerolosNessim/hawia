"use client";
import React from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { RichHtml } from "@/features/shared/components/rich-html";

interface WhyUsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

export const WhyUsCard: React.FC<WhyUsCardProps> = ({
  title,
  description,
  icon: Icon,
  image,
  index,
  progress,
  range,
  targetScale,
}) => {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      className="sticky flex w-full max-w-full items-center justify-center overflow-hidden pt-24"
      style={{ top: `${index * 20 + 80}px` }}
    >
      <motion.div
        style={{
          scale,
        }}
        className={cn(
          "relative flex w-full min-w-0 max-w-full min-h-64 origin-top flex-col items-start gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl md:flex-row md:items-center md:gap-10 md:p-12",
        )}
      >
        <div className="min-w-0 flex-1 space-y-4 text-start overflow-hidden">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            {title}
          </h3>
          <RichHtml
            html={description}
            className="text-gray-600 md:text-lg leading-relaxed"
          />
        </div>

        <div className="shrink-0">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-brand/10 flex items-center justify-center text-brand overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={title}
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            ) : (
              <Icon className="w-8 h-8 md:w-10 md:h-10" />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
