import { Button } from "@/components/ui/button";
import { TypingAnimation } from "@/components/ui/typing-animation";
import * as motion from "framer-motion/client";
import { FileText, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Hero } from "../types";
import BookingDialog from "@/features/booking/components/booking-dialog";
export default function HeroSection({heroData}:{heroData:Hero}) {
  const t = useTranslations("hero");
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
            dangerouslySetInnerHTML={{
              __html: heroData?.content?.title || t("title"),
            }}
          ></motion.div>
          <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 1 }}
                      className="cms-rich-html xl:text-2xl max-xl:text-base text-lg font-bold text-gray-900 max-xl:mt-1 mt-4"

          dangerouslySetInnerHTML={{
            __html: heroData?.content?.description || t("description"),
          }}>

          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
            className="cms-rich-html xl:text-2xl max-xl:text-sm max-xl:font-normal text-lg font-bold text-gray-900"
            dangerouslySetInnerHTML={{
              __html: heroData?.content?.sub_description || t("subDescription"),
            }}
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 2 }}
            className="flex max-xl:flex-col flex-row items-center justify-center max-xl:gap-4 gap-4 max-xl:mt-3 mt-6 w-full max-xl:max-w-sm max-xl:px-4"
          >
            <Button
              asChild
              className="rounded-full bg-brand text-background max-xl:h-auto max-xl:w-full px-10 py-6 max-xl:px-8 max-xl:py-5 text-lg max-xl:text-base"
            >
              <a href={`tel:${heroData?.phone}`}>
                <Phone className="size-6 max-xl:size-5 rtl:rotate-y-180" />
                {t("contactUs")}
              </a>
            </Button>
            <div className="max-xl:w-full max-xl:[&_span]:block max-xl:[&_button]:w-full">
              <BookingDialog
                trigger={
                  <Button className="h-auto w-full rounded-full bg-brand px-10 py-6 text-lg text-white max-xl:px-8 max-xl:py-5 max-xl:text-base">
                    <FileText className="size-6 max-xl:size-5 rtl:rotate-y-180" />
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
