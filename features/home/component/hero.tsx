import { Button } from "@/components/ui/button";
import { Highlighter } from "@/components/ui/highlighter";
import { MorphingText } from "@/components/ui/morphing-text";
import { TypingAnimation } from "@/components/ui/typing-animation";
import * as motion from "framer-motion/client";
import { File, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeroStats } from "./hero-stats";
export default function HeroSection() {
  const t = useTranslations("hero");
  return (
    <div className="max-xl:pt-20 relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden  bg-[url('/hero-bg.webp')] bg-cover bg-center bg-no-repeat ">
      {/* <DotPattern
        className={cn(
          "-z-10 mask-[radial-gradient(700px_circle_at_center,var(--color-brand),transparent)]",
        )}
      /> */}
      {/* content */}
      <div className="xl:w-1/2 container  flex items-center justify-center ">
        <div className="flex flex-col gap-4 text-center">
          <Highlighter
            animationDuration={1000}
            action="highlight"
            color="#a3cd39"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 1 }}
              className=""
            >
              <MorphingText
                className="xl:text-9xl text-5xl xl:py-22  text-white"
                texts={[t("title")]}
              />
            </motion.div>
          </Highlighter>
          <div className=" w-fit mx-auto xl:py-3 py-1">
            <TypingAnimation delay={1000} loop className="xl:text-2xl text-lg font-bold ">
              {t("description")}
            </TypingAnimation>
          </div>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
            className="xl:text-2xl text-lg font-bold"
          >
            {t("subDescription")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 2 }}
            className="flex items-center justify-center gap-4 mt-6"
          >
            <Button className=" rounded-full bg-brand text-background px-10 py-6 text-lg">
              <Phone className=" size-6 rtl:rotate-y-180" />
              {t("contactUs")}
            </Button>
            <Button className=" rounded-full bg-brand text-white px-10 py-6 text-lg">
              <File className="size-6 rtl:rotate-y-180" />
              {t("viewServices")}
            </Button>
          </motion.div>
        </div>
      </div>
      {/* stats */}
      <div className="xl:absolute max-xl:hidden xl:top-1/2 xl:-translate-y-1/2 xl:rtl:right-16 xl:ltr:left-14">
        <HeroStats />
      </div>
    </div>
  );
}
