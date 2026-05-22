"use client";
import React, { useRef } from "react";
import { useScroll } from "motion/react";
import { useTranslations } from "next-intl";
import { Handshake, Users, Target, TrendingUp, Lightbulb, Loader2, ArrowRight } from "lucide-react";
import { WhyUsCard } from "@/features/home/component/why-us-card";
import SectionHeader from "@/features/shared/components/section-header";
import { useWhyUs } from "../hooks/useWhyUs";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function WhyUsSection() {
  const t = useTranslations("why-choose-us");
  const container = useRef(null);

    const { data, isLoading } = useWhyUs();

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const icons = [Handshake, Users, Target, TrendingUp, Lightbulb];
  const items = Array.isArray(data?.data?.items) ? data.data.items : [];
  const apiFeatures = items.map((item) => ({
    title: item.content.title,
    description: item.content.description,
    image: item.media.image,
  }));

  const rawFeatures = t.raw("features");
  const fallbackFeatures = Array.isArray(rawFeatures)
    ? (rawFeatures as { title: string; description: string; image?: string }[])
    : [];

  const features = apiFeatures.length > 0 ? apiFeatures : fallbackFeatures;

  return (
    <section ref={container} className="relative py-20 ">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-brand" />
        </div>
      ) : (
        <>
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
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#wavy)" />
            </svg>
          </div>
          <SectionHeader
            title={data?.data?.content?.title || t("title")}
            subtitleHtml={data?.data?.content?.description || t("description")}
            align="center"
          />
          <Link href="/about" className="flex justify-center items-center mt-10">
            <Button className="bg-brand text-white hover:bg-brand/80 text-base px-6 py-4 rounded-full">
              {t("about")}
              <ArrowRight className="w-4 h-4 rtl:rotate-y-180" />
            </Button>
          </Link>

          <div className="container mx-auto px-4 relative">
            {features.map((feature, i) => {
              const targetScale = 1 - (features.length - i) * 0.05;
              return (
                <WhyUsCard
                  key={i}
                  index={i}
                  title={feature.title}
                  description={feature.description}
                  image={feature.image}
                  icon={icons[i % icons.length]}
                  progress={scrollYProgress}
                  range={[i * 0.15, 1]}
                  targetScale={targetScale}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
