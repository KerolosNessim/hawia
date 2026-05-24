import { localePath } from "@/features/blogs/lib/blog-routes";
import { jsonLdScript } from "@/features/blogs/lib/json-ld";
import { ServicePageSections } from "@/features/services/components/service-page-sections";
import { buildServiceMetadata } from "@/features/services/lib/service-metadata";
import { getSingleService } from "@/features/services/services/get-single-service";
import PageHeader from "@/features/shared/components/page-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { buildFaqPageJsonLd } from "@/features/shared/lib/faq-json-ld";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import * as motion from "framer-motion/client";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { headers } from "next/headers";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await getSingleService(slug, locale);
  if (!res?.data) return { title: "Service", robots: { index: false, follow: false } };
  return buildServiceMetadata(res.data, locale);
}

async function absolutePath(path: string): Promise<string | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (path.startsWith("http")) return path;
  return `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("singleService");
  const res = await getSingleService(slug, locale);
  console.log({ res });

  if (!res?.data) redirectToNotFound();
  const service = res.data;

  const serviceSlug =
    service.slug_local?.[locale === "ar" ? "ar" : "en"] ?? service.slug;
  const servicePath = localePath(
    locale,
    `/services/${encodeURIComponent(serviceSlug)}`,
  );
  const serviceAbs = (await absolutePath(servicePath)) ?? servicePath;

  const faqItems = service.pageSections
    .filter((section) => section.key === "faqs")
    .flatMap((section) => (section.data as { items?: { question: string; answer: string }[] }).items ?? []);
  const faqLd =
    faqItems.length > 0
      ? buildFaqPageJsonLd({
        items: faqItems.map((item) => ({
          question: item.question,
          answer: item.answer,
        })),
        url: serviceAbs,
        name:
          plainTextFromHtml(service.faqs?.title ?? "") ||
          plainTextFromHtml(service.title) ||
          undefined,
      })
      : null;

  const faqStructuredData = faqLd ? jsonLdScript(faqLd) : null;

  return (
    <div>
      {faqStructuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqStructuredData }}
        />
      ) : null}
      <PageHeader
        descriptionAsHeader
        descriptionHtml={service.inside_desc || service.title || t("description")}
        image={service.image || "/whySeo.webp"}
        imageAlt={service.image_alt || ""}
      />
      <div className="space-y-16 py-16">
        {service.highlight_description ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="container rounded-xl bg-gray-900 p-6 text-center leading-loose text-white"
          >
            <RichHtml html={service.highlight_description} className="space-y-4" />
          </motion.div>
        ) : null}

        <ServicePageSections service={service} />
      </div>
    </div>
  );
}
