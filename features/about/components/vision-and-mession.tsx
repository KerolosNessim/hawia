import { RichHtml } from "@/features/shared/components/rich-html";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import * as motion from "framer-motion/client";
import { Crosshair, Eye, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { VisionSection } from "../types";

const VICTOR_FRAME = "/public/shape-9.svg";
const FALLBACK_IMAGE = "/hero-bg.webp";

type VisionMissionCardProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconImage?: string;
  delay?: number;
};

function VisionMissionCard({
  title,
  description,
  icon: Icon,
  iconImage,
  delay = 0,
}: VisionMissionCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="rounded-2xl bg-slate-50 p-6 sm:p-8"
    >
      <div className="mb-5 flex ">
        {iconImage ? (
          <Image
            src={iconImage}
            alt=""
            width={56}
            height={56}
            unoptimized={isRemoteMediaUrl(iconImage)}
            className="size-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-sm">
            <Icon className="size-7" aria-hidden />
          </div>
        )}
      </div>

      <h3 className="mb-3  text-xl font-bold text-gray-900 sm:text-2xl">
        {title}
      </h3>

      {description ? (
        <RichHtml
          html={description}
          className="cms-rich-html  text-base leading-relaxed text-gray-600 [&_p:last-child]:mb-0 [&_p]:mb-3"
        />
      ) : null}
    </motion.article>
  );
}



export default function VissionAndMession({
  data,
  image,
}: {
  data: VisionSection | undefined;
  image: string;
}) {
  const t = useTranslations("about");

  return (
    <section className="relative overflow-hidden finger-print-background bg-white py-16 md:py-20">
      <div className="container relative">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-14 xl:gap-16">
        <div className=" lg:col-span-2">
          <Image
            src={image || "/about-identity.webp"}
            alt=""
            width={500}
            height={500}
            className="w-full h-auto mask-about "
          />
        </div>
          <div className=" flex flex-col gap-6  lg:col-span-3">
            <VisionMissionCard
              title={data?.vision_title || t("vision.title")}
              description={data?.vision_description}
              icon={Eye}
              iconImage={data?.vision_image}
              delay={0}
            />
            <VisionMissionCard
              title={data?.message_title || t("mession.title")}
              description={data?.message_description}
              icon={Crosshair}
              iconImage={data?.message_image}
              delay={0.1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
