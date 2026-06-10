import SectionHeader from "@/features/shared/components/section-header";
import { clientsIndexPath } from "@/features/clients/lib/clients-routes";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import { localePath } from "@/features/blogs/lib/blog-routes";
import { getServerCountryRouteCode } from "@/lib/get-country";
import type { Locale } from "next-intl";
import { getLocale } from "next-intl/server";
import { getAdsData } from "../services/ads";

export default async function AdsSection({ countryId }: { countryId?: number }) {
  const t = await getTranslations("adsSection");
  const [section, locale, countryCode] = await Promise.all([
    getAdsData(countryId),
    getLocale(),
    getServerCountryRouteCode(),
  ]);

  if (!section?.categories?.length) return null;

  const title = section.title || t("title");
  const subtitle = section.descriptionHtml || t("subtitle");

  return (
    <section className="relative space-y-8 overflow-hidden finger-print-background py-16">
      {/* <div
        className="pointer-events-none absolute inset-0 text-brand opacity-5"
        aria-hidden
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="ads-wavy"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 50 Q 25 25, 50 50 T 100 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ads-wavy)" />
        </svg>
      </div> */}

      <div className="container relative z-10 px-4">
        <SectionHeader title={title} subtitleHtml={subtitle} />
      </div>

      <div className="container relative z-10 px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {section.categories.map((item, index) => {
            const logicalPath =
              item.href || clientsIndexPath({ categorySlug: item.slug });
            const href = localePath(locale as Locale, logicalPath, countryCode);
            return (
            <a
              key={item.id}
              href={href}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="shadow-lg rounded-lg bg-linear-to-b from-brand to-white p-6 text-center text-gray-900 transition-all duration-300 hover:from-white hover:to-brand hover:text-white"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt || item.title}
                  width={100}
                  height={100}
                  unoptimized={isRemoteMediaUrl(item.imageUrl)}
                  className="mx-auto size-24 object-contain sm:size-40"
                />
                <h3 className="my-2 text-xl font-extrabold">{item.title}</h3>
              </motion.div>
            </a>
          );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href={localePath(locale as Locale, clientsIndexPath(), countryCode)}
            className="inline-flex"
          >
            <Button className="rounded-full bg-brand px-6 py-3 text-base text-white hover:bg-brand/90">
              {t("showAll")}
              <ArrowRight className="size-4 rtl:rotate-y-180" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
