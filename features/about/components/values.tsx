import { useTranslations } from "next-intl";
import * as motion from "framer-motion/client";
import Image from "next/image";
import { WhyUsSection } from "../types";
import { RichHtml } from "@/features/shared/components/rich-html";

export default function Values({ data }: { data: WhyUsSection | undefined }) {
  const t = useTranslations("about");
  const whyChoose = t.raw("why_choose");
  const values = t.raw("values");
  return (
    <section className="background-dark-img py-16">

    <div className=" container flex items-center justify-center gap-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-brand mb-4">
            {data?.title || t("why_choose_title")}
          </h2>
          {data?.description ? (
            <RichHtml
              html={data.description}
              className="text-white font-semibold [&_p]:text-brand [&_p]:font-bold"
            />
          ) : (
            <ul className="space-y-3  ">
              {whyChoose?.map((item: string, index: number) => (
                <li
                  key={index}
                  className="font-semibold flex items-baseline gap-2 text-white"
                >
                  <span className="w-2 h-2 bg-brand rounded-full shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4 mt-10">
          <h2 className="text-3xl font-bold text-brand mb-4">
            {data?.values_title || t("values_title")}
          </h2>
          {
            data?.values_description ? (
              <RichHtml
                html={data.values_description}
                className="font-semibold [&_p]:text-brand [&_p]:font-bold"
              />
            ) : (
          <ul className="space-y-3  ">
            {values?.map(
              (item: { title: string; description: string }, index: number) => (
                <li
                  key={index}
                  className="font-semibold flex items-baseline gap-2"
                >
                  <span className="w-2 h-2 bg-brand rounded-full shrink-0"></span>
                  <span className="text-brand font-bold">{item.title}</span>
                  <RichHtml  html={item.description} className="inline text-white" />
                </li>
              ),
            )}
          </ul>
          )}
        </div>
      </motion.div>
      <motion.div
        className="w-1/2 max-lg:hidden"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <Image
          src={data?.image || "/values.webp"}
          alt=""
          width={500}
          height={500}
          className="w-full h-auto mask-blob "
        />
      </motion.div>
    </div>
    </section>
  );
}
