import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import PageHeader from "@/features/shared/components/page-header";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import * as motion from "framer-motion/client"
import Identity from "@/features/about/components/identity";
import VissionAndMession from "@/features/about/components/vision-and-mession";
import ServicesSection from "@/features/services/components/services-section";
import Values from "@/features/about/components/values";
import SectionHeader from "@/features/shared/components/section-header";
import PageContact from "@/features/shared/components/page-contact";

export default function AboutPage() {
  const t = useTranslations("about");
  return (
    <div className="space-y-16 pb-16">
      <PageHeader
        title={t("title")}
        description={t("description")}
        image="/hero-bg.webp"
      />
      {/* video */}
      <Dialog>
        <DialogTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className=" w-full lg:h-[500px]  lg:w-4xl mx-auto relative"
          >
            <Image
              src="/video-thub.webp"
              alt="video"
              width={500}
              height={500}
              className="rounded-lg shadow-lg w-full"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  flex items-center justify-center bg-brand rounded-full p-4 hover:bg-brand/80 transition-colors cursor-pointer">
              <Play className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl w-full">
          <DialogHeader className="w-full">
            <DialogDescription className="w-full">
              <iframe
                width="100%"
                height="500"
                src="https://www.youtube.com/embed/pQ4dZ-GftNM?si=6uEa7nAEqcJo3Kj_"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* identity */}
      <Identity
        title={t("identity.title")}
        description={t.raw("identity.description")}
      />
      {/* vision and mession */}
      <VissionAndMession />
      {/* services */}
      <ServicesSection />
      {/* values */}
      <Values />
      {/* ideal client */}
      <div className="bg-gray-900 px-5 py-10">
        <SectionHeader
          title={t("ideal_client_title")}
          subtitle={t("ideal_client")}
        />
      </div>
      {/* contact */}
      <PageContact title={t("contact.title")}  description={t("contact.description")} />
    </div>
  );
}
