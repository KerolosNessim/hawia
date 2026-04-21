import SectionHeader from "@/features/shared/components/section-header";
import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Section } from "../types";

interface Item {
  id: string;
  title: string;
  description: string;
}
export default function SeoSteps({steps}: {steps: Section}) {
  const t = useTranslations("singleService.seoSteps");
  const items = t.raw("steps") as Item[];
  return (
    <div className="py-12 bg-gray-900">
      <div className="container space-y-8">
        <SectionHeader title={steps?.title || t("title")} subtitle={steps?.description || t("subtitle")} />
        {/* content */}
        <div className="flex items-center">
          {/* items */}
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            {steps?.items?.map((item:any,index:number) => (
              <div key={index} className="bg-gray-700 p-4 rounded-xl border border-brand text-white">
                <p className=" font-bold">
                  <span>{item?.title}</span>
                </p>
                <p className=" mt-2">{item?.description}</p>
              </div>
            ))}

          </div>
          <div className=" max-lg:hidden shrink-0">
            <Image
              src={steps?.image || "/whySeo.webp"}
              alt=""
              width={500}
              height={500}
              className="w-auto h-auto mask-blob "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
