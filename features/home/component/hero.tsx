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
      <div className="xl:w-1/2 container  flex items-center justify-center ">
        <div className="flex flex-col gap-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
            className="xl:text-9xl! text-5xl! font-bold mb-4 text-gray-900 **:text-inherit! **:font-inherit! [&_h1]:m-0!"
            dangerouslySetInnerHTML={{
              __html: heroData?.content?.title || t("title"),
            }}
          ></motion.div>
          <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 1 }}
                      className="xl:text-2xl text-lg font-bold text-gray-900 mt-4 "

          dangerouslySetInnerHTML={{
            __html: heroData?.content?.description || t("description"),
          }}>

          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
            className="xl:text-2xl text-lg font-bold text-gray-900 "
            dangerouslySetInnerHTML={{
              __html: heroData?.content?.sub_description || t("subDescription"),
            }}
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 2 }}
            className="flex items-center justify-center gap-4 mt-6"
          >
            <Button
              asChild
              className=" rounded-full bg-brand text-background px-10 py-6 text-lg"
            >
              <a href={`tel:${heroData?.phone}`}>
                <Phone className=" size-6 rtl:rotate-y-180" />
                {t("contactUs")}
              </a>
            </Button>
            <BookingDialog
              trigger={
                <Button className=" rounded-full bg-brand text-white px-10 py-6 text-lg">
                  <FileText className="size-6 rtl:rotate-y-180" />
                  {t("bookNow") || "Book Now"}
                </Button>
              }
            />

          </motion.div>
        </div>
      </div>
    </div>
  );
}
