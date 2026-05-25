import { localePath } from "@/features/blogs/lib/blog-routes";

import { jsonLdScript } from "@/features/blogs/lib/json-ld";

import ServicePageScript from "@/features/services/components/service-page-script";

import RelatedServicesSection from "@/features/services/components/related-services-section";
import { ServicePageSections } from "@/features/services/components/service-page-sections";
import { getServices } from "@/features/services/services/get-services";

import { buildServiceMetadata } from "@/features/services/lib/service-metadata";

import { pickServiceSlug, servicePostPath } from "@/features/services/lib/services-routes";

import {

  isGoneStatus,

  isPermanentRedirectStatus,

} from "@/features/services/lib/service-slug-redirect";

import { getSingleService } from "@/features/services/services/get-single-service";

import {

  resolveServicePage,

} from "@/features/services/services/resolve-service-page";

import PageHeader from "@/features/shared/components/page-header";

import { RichHtml } from "@/features/shared/components/rich-html";

import { buildFaqPageJsonLd } from "@/features/shared/lib/faq-json-ld";

import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";

import { plainTextFromHtml } from "@/lib/plain-text-from-html";

import { getPathname, redirect } from "@/i18n/navigation";

import * as motion from "framer-motion/client";

import type { Locale } from "next-intl";

import { getLocale, getTranslations } from "next-intl/server";

import type { Metadata } from "next";

import { headers } from "next/headers";

import { permanentRedirect } from "next/navigation";



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



function applySlugRedirect(locale: Locale, toSlug: string, status: number): never {

  const href = servicePostPath(toSlug);

  const pathname = getPathname({ locale, href });

  if (isGoneStatus(status)) {

    redirectToNotFound();

  }

  if (isPermanentRedirectStatus(status)) {

    permanentRedirect(pathname);

  }

  redirect({ href, locale });

}



export default async function ServicePage({ params }: Props) {

  const { slug, locale: routeLocale } = await params;

  const locale = (await getLocale()) as Locale;

  const t = await getTranslations("singleService");



  const resolved = await resolveServicePage(slug, locale);

  if (!resolved) redirectToNotFound();

  if (resolved.kind === "gone") redirectToNotFound();

  if (resolved.kind === "redirect") {

    applySlugRedirect(routeLocale, resolved.toSlug, resolved.status);

  }



  const service = resolved.data;



  const serviceSlug = pickServiceSlug(service, locale);

  const servicePath = localePath(

    locale,

    `/services/${encodeURIComponent(serviceSlug)}`,

  );

  const serviceAbs = (await absolutePath(servicePath)) ?? servicePath;



  const heroTitle =

    service.singlePageTitle?.trim() || service.title;



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

  const servicesListRes = await getServices(locale);
  const relatedServices = (servicesListRes.data ?? []).filter((s) => s.id !== service.id);



  return (

    <div>

      {service.pageScript ? <ServicePageScript scriptHtml={service.pageScript} /> : null}

      {faqStructuredData ? (

        <script

          type="application/ld+json"

          dangerouslySetInnerHTML={{ __html: faqStructuredData }}

        />

      ) : null}

      <PageHeader

        titleHtml={heroTitle}

        descriptionAsHeader

        descriptionHtml={

          service.subtitle?.trim() ||

          service.inside_desc ||

          service.description ||

          t("description")

        }

        image={service.image || "/whySeo.webp"}

        imageAlt={service.image_alt || ""}

      />

      {service.description?.trim() && service.pageSections.length === 0 ? (

        <div className="container py-12">

          <RichHtml html={service.description} className="cms-rich-html max-w-4xl mx-auto space-y-4" />

        </div>

      ) : null}

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

      <RelatedServicesSection services={relatedServices} />

    </div>

  );

}
