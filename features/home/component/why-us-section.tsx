"use client";
import React, { useRef } from "react";
import { useScroll } from "motion/react";
import { useTranslations } from "next-intl";
import { Handshake, Users, Target, TrendingUp, Lightbulb } from "lucide-react";
import { WhyUsCard } from "@/features/home/component/why-us-card";
import SectionHeader from "@/features/shared/components/section-header";

export default function WhyUsSection() {
  const t = useTranslations("why-choose-us");
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const icons = [Handshake, Users, Target, TrendingUp, Lightbulb];
  const features = t.raw("features") as {
    title: string;
    description: string;
  }[];

  return (
    <section ref={container} className="relative py-20 bg-gray-900">
      {/* Decorative Wavy Background Pattern (Simplified) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none text-brand">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="wavy"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 50 Q 25 25, 50 50 T 100 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </pattern>{" "}
            pattern
          </defs>
          <rect width="100%" height="100%" fill="url(#wavy)" />
        </svg>
      </div>
      <SectionHeader
        title={t("title")}
        subtitle={t("description")}
        align="center"
      />

      <div className="container mx-auto px-4 relative">
        {features.map((feature, i) => {
          const targetScale = 1 - (features.length - i) * 0.05;
          return (
            <WhyUsCard
              key={i}
              index={i}
              title={feature.title}
              description={feature.description}
              icon={icons[i % icons.length]}
              progress={scrollYProgress}
              range={[i * 0.15, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </div>
    </section>
  );
}
