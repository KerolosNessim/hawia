"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SectionHeader from "@/features/shared/components/section-header";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

function TestimonialCard({
  quote,
  name,
  role,
  rating,
}: {
  quote: string;
  name: string;
  role: string;
  rating: number;
}) {
  return (
    <div className="p-2 h-full ">
      <Card className="h-full ring-brand  backdrop-blur-sm ring-1   transition-all duration-300 flex flex-col justify-between overflow-visible">
        <CardContent>
          {/* Quote icon */}
          <div className="mb-4 flex items-center justify-between">
            <Quote className="w-8 h-8 text-brand opacity-80" />
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating
                      ? "fill-brand text-brand"
                      : "fill-white/10 text-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-900 leading-relaxed text-sm md:text-base">
            {quote}
          </p>
        </CardContent>

        <CardFooter className="border-t border-brand bg-transparent mt-4 pt-4 pb-4 flex items-center gap-4">
          <Avatar className="size-12 ring-2 ring-brand ring-offset-2">
            <AvatarImage
              src={"/user.webp"}
              alt={name}
              className="w-full h-full object-cover"
            />
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-brand ">{name}</span>
            <span className="text-gray-900text-sm">{role}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function TestimonialsSection() {
  const t = useTranslations("testimonialsSection");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const testimonials = t.raw("items") as {
    quote: string;
    name: string;
    role: string;
    company: string;
    rating: number;
  }[];

  return (
    <section className="container py-16 space-y-8">
      <SectionHeader
        title={t("title")}
        subtitle={t("subtitle")}
        subtitleColor="text-gray-500"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        // Flip direction for RTL so Embla scrolls correctly
        dir={isRtl ? "rtl" : "ltr"}
      >
        <Carousel
          opts={{
            align: "start",
            loop: true,
            direction: isRtl ? "rtl" : "ltr",
          }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
          className="w-full"
        >
          <CarouselContent>
            {testimonials.map((item, index) => (
              <CarouselItem
                key={index}
                className="ps-4 basis-full sm:basis-1/2 lg:basis-1/3 pb-6"
              >
                <TestimonialCard
                  quote={item.quote}
                  name={item.name}
                  role={item.role}
                  rating={item.rating}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation buttons — positions swap automatically via start/end in RTL */}
          <CarouselPrevious
            isRtl={locale == "ar"}
            className={`max-md:hidden size-10  bg-brand text-white hover:bg-gray-900 hover:text-brand disabled:opacity-30`}
          />
          <CarouselNext
            isRtl={locale == "ar"}
            className={`max-md:hidden size-10  bg-brand text-white hover:bg-gray-900 hover:text-brand disabled:opacity-30`}
          />
        </Carousel>
      </motion.div>
    </section>
  );
}
