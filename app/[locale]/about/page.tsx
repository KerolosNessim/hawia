import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import PageHeader from "@/features/shared/components/page-header";
import { Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import * as motion from "framer-motion/client";
import Identity from "@/features/about/components/identity";
import VissionAndMession from "@/features/about/components/vision-and-mession";
import ServicesSection from "@/features/services/components/services-section";
import Values from "@/features/about/components/values";
import SectionHeader from "@/features/shared/components/section-header";
import PageContact from "@/features/shared/components/page-contact";
import { getAboutData } from "@/features/about/services/about";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { localePathname } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import { buildCanonicalUrl, serializeStaticPageSchema } from "@/lib/seo/schema";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;

  try {
    const response = await getAboutData();
    const data = response.data;

    return buildStaticPageMetadata({
      locale: loc,
      pathname: localePathname(loc, "/about"),
      pageKey: "about",
      title: data.meta_title || data.title,
      description: data.meta_description || data.description,
    });
  } catch {
    return buildStaticPageMetadata({
      locale: loc,
      pathname: localePathname(loc, "/about"),
      pageKey: "about",
      title: "About Us",
    });
  }
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const locale = (await getLocale()) as Locale;
  const tSeo = await getTranslations({ locale, namespace: "seo.breadcrumb" });

  let data;
  try {
    const response = await getAboutData();
    data = response.data;
  } catch (error) {
    console.error("Failed to fetch About Us data:", error);
  }

  const pageTitle = data?.meta_title || data?.title || t("title");
  const pageDescription =
    data?.meta_description ||
    (data?.description ? plainTextFromHtml(data.description) : t("description"));
  const pageUrl = buildCanonicalUrl(locale, "/about");
  const aboutSchemaJson = serializeStaticPageSchema({
    pageType: "AboutPage",
    pageUrl,
    name: plainTextFromHtml(pageTitle) || t("title"),
    description: plainTextFromHtml(String(pageDescription)).slice(0, 320),
    inLanguage: locale === "ar" ? "ar" : "en",
    breadcrumbs: [
      { name: tSeo("home"), url: buildCanonicalUrl(locale, "/") },
      { name: tSeo("about"), url: pageUrl },
    ],
  });

  return (
    <div className="space-y-16 pb-16">
      <PageSchemaScript json={aboutSchemaJson} />
      <PageHeader
        title={data?.title || t("title")}
        image={data?.image || "/hero-bg.webp"}
        descriptionHtml={data?.description || t("description")}
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
                src={
                  data?.video_url ||
                  "https://www.youtube.com/embed/pQ4dZ-GftNM?si=6uEa7nAEqcJo3Kj_"
                }
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
        title={data?.sections[0]?.title || t("identity.title")}
        description={data?.sections[0]?.description || ""}
        image={data?.sections[0]?.image || "/about-identity.webp"}
      />
      {/* vision and mession */}
      <VissionAndMession data={data?.vision_sections[0] } />
      {/* services */}
      <ServicesSection />
      {/* values */}
      <Values data={data?.why_us_sections[0]}/>
      {/* ideal client */}
      {/* <div className="bg-gray-900 px-5 py-10">
        <SectionHeader
          title={t("ideal_client_title")}
          subtitle={t("ideal_client")}
        />
      </div> */}
      {/* contact */}
      <PageContact
        title={data?.contact_sections[0]?.title || t("contact.title")}
        description={data?.contact_sections[0]?.description || t("contact.description")}
        phone={data?.contact_sections[0]?.phone}
      />
    </div>
  );
}
