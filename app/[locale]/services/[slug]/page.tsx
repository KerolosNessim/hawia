import OfferServiceSection from "@/features/services/components/offer-service-section";
import SeoCheckForm from "@/features/services/components/seo-check-form";
import SeoFaq from "@/features/services/components/seo-faq";
import SeoPackages from "@/features/services/components/seo-packages";
import SeoSteps from "@/features/services/components/seo-steps";
import SeoTools from "@/features/services/components/seo-tools";
import { getSingleService } from "@/features/services/services/get-single-service";
import PageContact from "@/features/shared/components/page-contact";
import PageHeader from "@/features/shared/components/page-header";
import * as motion from "framer-motion/client";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getSingleService(slug);
  return {
    title: res?.data?.meta_title,
    description: res?.data?.meta_description,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("singleService");
  const whySeo = t.raw("why_seo.items") as string[];
  const res = await getSingleService(slug);
  const service = res?.data ?? {};
  return (
    <div>
      <PageHeader
        title={service?.title || t("title")}
        image={service?.image || "/whySeo.webp"}
      />
      <div className=" py-16 space-y-16">
        {/* description */}
        {service?.highlight_description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            dangerouslySetInnerHTML={{
              __html: service?.highlight_description || "",
            }}
            className="container bg-gray-900 p-6 rounded-xl text-center text-white space-y-4 leading-loose"
          ></motion.div>
        )}

        {/* why seo */}
        {service?.benefits && (
          <div className=" container flex items-center justify-center gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-brand mb-4">
                {service?.benefits?.title || t("why_seo.title")}
              </h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: service?.benefits?.description || "",
                }}
              ></div>
            </motion.div>
            <motion.div
              className="w-2/3 max-lg:hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Image
                src={service?.benefits?.image || "/whySeo.webp"}
                alt=""
                width={500}
                height={500}
                className="w-auto h-auto mask-blob "
              />
            </motion.div>
          </div>
        )}

        {/* check form  */}
        {/* <SeoCheckForm /> */}

        {/* what we offer */}
        {service?.offerings && (
          <OfferServiceSection offerings={service?.offerings} />
        )}

        {/* seo steps */}
        {service?.steps && <SeoSteps steps={service?.steps} />}
        {/* seo tools */}

        {service?.tools && <SeoTools tools={service?.tools} />}

        {/* seo faq */}
        {service?.faqs && <SeoFaq faq={service?.faqs} />}

        {/* seo packages */}
        <SeoPackages />

        {/* contact */}
        {service?.ctas && (
          <PageContact
            title={service?.ctas?.title}
            phone={service?.ctas?.phone_number}
            description={service?.ctas?.description}
          />
        )}
      </div>
    </div>
  );
}
