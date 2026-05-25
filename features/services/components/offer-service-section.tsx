import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { hasSectionImage } from "@/features/services/lib/has-section-image";
import SectionHeader from "@/features/shared/components/section-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { useTranslations } from "next-intl";
import * as motion from "framer-motion/client";
import Image from "next/image";
import { Section } from "../types";

interface OfferServiceItemProps {
  id: string;
  title: string;
  description: string;
  points: string[];
}

export default function OfferServiceSection({
  offerings,
}: {
  offerings: Section;
}) {
  const t = useTranslations("singleService.whatWeOffer");
  const items = t.raw("cards") as OfferServiceItemProps[];
  const hasImage = hasSectionImage(offerings?.image);

  return (
    <div className="container space-y-6">
      <SectionHeader
        titleHtml={offerings?.title || undefined}
        title={t("title")}
        subtitleHtml={offerings?.description || t("subtitle")}
        subtitleColor="text-gray-500"
      />
      {hasImage && offerings.image ? (
        <div className="flex justify-center">
          <Image
            src={offerings.image}
            alt={offerings.image_alt ?? ""}
            width={640}
            height={400}
            className="h-auto max-h-[400px] w-full max-w-2xl rounded-2xl object-contain"
            unoptimized={isRemoteMediaUrl(offerings.image)}
          />
        </div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offerings?.items?.map((item: any, index: number) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 * index }}
            viewport={{ once: true }}
            key={item.id}
            className=" p-6 rounded-xl  space-y-4 leading-loose border-2 border-brand hover:bg-gray-900 hover:text-white transition-all duration-300 group"
          >
            <RichHtml
              html={item?.title}
              as="h2"
              className="text-lg font-bold text-brand"
            />
            <RichHtml html={item?.description} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
