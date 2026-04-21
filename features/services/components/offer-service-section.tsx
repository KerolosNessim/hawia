import SectionHeader from "@/features/shared/components/section-header";
import { useTranslations } from "next-intl";
import * as motion from "framer-motion/client";
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
  return (
    <div className="container space-y-6">
      <SectionHeader
        title={offerings?.title || t("title")}
        subtitle={offerings?.description || t("subtitle")}
        subtitleColor="text-gray-500"
      />
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
            <h2 className="text-lg font-bold text-brand">
              {item?.title}
            </h2>
            <div
              dangerouslySetInnerHTML={{ __html: item?.description }}></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
