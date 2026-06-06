import { Button } from "@/components/ui/button";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { enhanceCmsHtml } from "@/lib/inline-image-alt";
import * as motion from "framer-motion/client";
import { FileText, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import type { Hero } from "../types";
import BookingDialog from "@/features/booking/components/booking-dialog";

const heroCtaBtnClass =
  "h-auto min-h-11 w-full justify-center gap-1.5 rounded-full bg-brand px-6 py-4 text-sm font-medium text-background max-xl:min-h-10 max-xl:px-5 max-xl:py-3.5";

export default function HeroSection({heroData}:{heroData:Hero}) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const titleHtml = useMemo(
    () => enhanceCmsHtml(heroData?.content?.title || t("title"), locale),
    [heroData?.content?.title, locale, t],
  );
  const descriptionHtml = useMemo(
    () => enhanceCmsHtml(heroData?.content?.description || t("description"), locale),
    [heroData?.content?.description, locale, t],
  );
  const subDescriptionHtml = useMemo(
    () => enhanceCmsHtml(heroData?.content?.sub_description || t("subDescription"), locale),
    [heroData?.content?.sub_description, locale, t],
  );
  return (
    <div
      className="max-xl:pt-20 relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden   bg-cover bg-center bg-no-repeat "
      style={{
        backgroundImage: `url(${heroData?.media?.image})`,
      }}
    >
      {/* content */}
      <div className="container flex min-w-0 max-w-full items-center justify-center xl:w-1/2">
        <div className="flex w-full min-w-0 max-w-full flex-col gap-2 max-xl:gap-2 xl:gap-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
            className="cms-rich-html xl:text-9xl! max-xl:text-3xl! text-5xl! font-bold max-xl:mb-1 mb-4 text-gray-900 [&_h1]:m-0!"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          ></motion.div>
          <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 1 }}
                      className="cms-rich-html xl:text-2xl max-xl:text-base text-lg font-bold text-gray-900 max-xl:mt-1 mt-4"

          dangerouslySetInnerHTML={{ __html: descriptionHtml }}>

          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
            className="cms-rich-html xl:text-2xl max-xl:text-sm max-xl:font-normal text-lg font-bold text-gray-900"
            dangerouslySetInnerHTML={{ __html: subDescriptionHtml }}
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 2 }}
            className="mx-auto mt-4 grid w-full max-w-xs grid-cols-1 gap-3 max-xl:mt-2 max-xl:px-4 xl:max-w-lg xl:grid-cols-2"
          >
            <Button asChild className={heroCtaBtnClass}>
              <a href={`tel:${heroData?.phone}`}>
                <Phone className="size-4 rtl:rotate-y-180" />
                {t("contactUs")}
              </a>
            </Button>
            <div className="w-full min-w-0 [&_span]:block [&_span]:w-full [&_button]:w-full">
              <BookingDialog
                trigger={
                  <Button className={heroCtaBtnClass}>
                    <FileText className="size-4 rtl:rotate-y-180" />
                    {t("bookNow") || "Book Now"}
                  </Button>
                }
              />
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
