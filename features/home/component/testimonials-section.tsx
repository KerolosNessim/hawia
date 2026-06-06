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
import { useTestimonials } from "../hooks/useTestimonials";

function TestimonialCard({
  quote,
  name,
  role,
  rating,
  image,
}: {
  quote: string;
  name: string;
  role: string;
  rating: number;
  image?: string;
}) {
  return (
    <div className="h-full p-2">
      <Card className="flex h-full flex-col justify-between overflow-hidden border border-white/10 bg-gray-800/90 shadow-lg ring-1 ring-brand/40 backdrop-blur-sm transition-all duration-300 hover:border-brand/50 hover:ring-brand/60">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <Quote className="h-8 w-8 text-brand opacity-90" />
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating ? "text-brand" : "text-gray-600"
                  }`}
                  fill={i < rating ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-100 md:text-base">{quote}</p>
        </CardContent>

        <CardFooter className="mt-4 flex items-center gap-4 border-t border-brand/30 bg-gray-900/40 pt-4 pb-4">
          <Avatar className="size-12 ring-2 ring-brand ring-offset-2 ring-offset-gray-900">
            <AvatarImage
              src={image || "/user.webp"}
              alt={name}
              className="h-full w-full object-cover"
            />
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-brand">{name}</span>
            <span className="text-sm text-gray-400">{role}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function TestimonialsSection({ countryId }: { countryId?: number }) {
  const t = useTranslations("testimonialsSection");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { data, isLoading } = useTestimonials(countryId);

  const testimonialRows = Array.isArray(data?.data?.testimonials)
    ? data.data.testimonials
    : [];
  const apiTestimonials = testimonialRows.map((item) => ({
    quote: item.content.content,
    name: item.content.name,
    role: item.content.job_title,
    rating: item.rate,
    image: item.image,
  }));

  const rawStatic = t.raw("items");
  const staticTestimonials = Array.isArray(rawStatic)
    ? (rawStatic as {
        quote: string;
        name: string;
        role: string;
        company: string;
        rating: number;
      }[])
    : [];

  const testimonials =
    apiTestimonials?.length > 0
      ? apiTestimonials
      : countryId == null
        ? staticTestimonials
        : [];

  if (isLoading) return null;
  if (countryId != null && testimonials.length === 0) return null;

  return (
    <section className="background-dark-img relative overflow-hidden bg-opacity-50 py-16">
      <div className="container relative z-10 space-y-8 px-4">
      <SectionHeader
        title={data?.data?.content?.title || t("title")}
        subtitleHtml={data?.data?.content?.description || t("subtitle")}
        subtitleColor="text-gray-400 [&_p]:text-gray-400"
        titleColor="text-white [&_h2]:text-white [&_h3]:text-white"
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
                  image={'image' in item ? item.image : undefined}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation buttons — positions swap automatically via start/end in RTL */}
          <CarouselPrevious
            isRtl={locale == "ar"}
            className="max-md:hidden size-10 border border-white/20 bg-brand text-white hover:border-brand hover:bg-white hover:text-gray-900 disabled:opacity-30"
          />
          <CarouselNext
            isRtl={locale == "ar"}
            className="max-md:hidden size-10 border border-white/20 bg-brand text-white hover:border-brand hover:bg-white hover:text-gray-900 disabled:opacity-30"
          />
        </Carousel>
      </motion.div>
      </div>
    </section>
  );
}

