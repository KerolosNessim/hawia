import OfferServiceSection from "@/features/services/components/offer-service-section";
import SeoCheckForm from "@/features/services/components/seo-check-form";
import SeoFaq from "@/features/services/components/seo-faq";
import SeoPackages from "@/features/services/components/seo-packages";
import SeoSteps from "@/features/services/components/seo-steps";
import SeoTools from "@/features/services/components/seo-tools";
import PageContact from "@/features/shared/components/page-contact";
import PageHeader from "@/features/shared/components/page-header";
import * as motion from "framer-motion/client";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ServicePage() {
  const t = useTranslations("singleService");
  const whySeo = t.raw("why_seo.items") as string[];
  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <div className=" py-16 space-y-16">
        {/* description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="container bg-gray-900 p-6 rounded-xl text-center text-white space-y-4 leading-loose"
        >
          <p>{t("seo_section.description_top")}</p>
          <h2 className="text-3xl font-bold text-brand">
            {t("seo_section.title")}
          </h2>
          <p>{t("seo_section.description_bottom")}</p>
        </motion.div>

        {/* why seo */}
        <div className=" container flex items-center justify-center gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-brand mb-4">
              {t("why_seo.title")}
            </h2>
            <ul className="space-y-3  ">
              {whySeo.map((item, index) => (
                <li
                  key={index}
                  className="font-semibold flex items-baseline gap-2"
                >
                  <span className="w-2 h-2 bg-brand rounded-full shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            className="w-2/3 max-lg:hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Image
              src="/whySeo.webp"
              alt=""
              width={500}
              height={500}
              className="w-auto h-auto mask-blob "
            />
          </motion.div>
        </div>

        {/* check form  */}
        <SeoCheckForm />

        {/* what we offer */}
        <OfferServiceSection />

        {/* seo steps */}
        <SeoSteps />
        {/* seo tools */}
        <SeoTools />

        {/* seo faq */}
        <SeoFaq />

        {/* seo packages */}
        <SeoPackages />

        {/* contact */}
        <PageContact title={t("contact.title")}  />

      </div>
    </div>
  );
}
