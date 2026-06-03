import AdsSection from "@/features/home/component/ads-section";
import ArticlesSection from "@/features/blogs/components/articles-section";
import { blogToCardPayload, fetchPublicBlogs } from "@/features/blogs/server/public-blogs";
import ClientsSection from "@/features/home/component/clients-section";
import ContactSection from "@/features/home/component/contact-section";
import PromoBannersSlider from "@/features/home/component/promo-banners-slider";
import { resolveHomePromoBanners } from "@/features/home/services/get-promo-banners";
import DependenciesSection from "@/features/home/component/depndnces-sction";
import HeroSection from "@/features/home/component/hero";
import { HeroStats } from "@/features/home/component/hero-stats";
import PackagesSection from "@/features/home/component/packages-section";
import StepsSection from "@/features/home/component/steps-sections";
import TestimonialsSection from "@/features/home/component/testimonials-section";
import WhyUsSection from "@/features/home/component/why-us-section";
import ServicesSection from "@/features/services/components/services-section";
import { getAccreditations } from "@/features/home/services/accreditations";
import { getLandingPageData } from "@/features/home/services/hero";
import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type { Accreditation } from "@/features/home/types";
import { getServices } from "@/features/services/services/get-services";
import { pickServiceSlug } from "@/features/services/lib/services-routes";
import { getSettings } from "@/features/settings/services/settings-service";
import { resolveSettingsPageSeo } from "@/features/settings/lib/resolve-settings-seo";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { localePathname } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import { buildCanonicalUrl, schemaMediaUrl, serializeHomePageSchema } from "@/lib/seo/schema";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;

  try {
    const response = await getSettings();
    const settings = response.data;

    return buildStaticPageMetadata({
      locale: loc,
      pathname: localePathname(loc, "/"),
      pageKey: "home",
      title: settings.general.site_name || "Howeyah",
      description: settings.general.site_description || undefined,
    });
  } catch {
    return buildStaticPageMetadata({
      locale: loc,
      pathname: localePathname(loc, "/"),
      pageKey: "home",
      title: "Howeyah",
      description: "Howeyah platform for consulting and educational services.",
    });
  }
}

function normalizeAccreditation(raw: Accreditation | undefined): Accreditation | undefined {
  if (!raw?.images?.length) return undefined;
  return {
    ...raw,
    images: raw.images.map((img) => ({
      ...img,
      url: resolveMediaUrl(img.url),
    })),
  };
}

export default async function Home() {
  const [data, accreditationsRes] = await Promise.all([
    getLandingPageData(),
    getAccreditations().catch(() => null),
  ]);

  if (!data.data) return null;

  const locale = (await getLocale()) as Locale;
  const latestBlogs = (await fetchPublicBlogs()).slice(0, 3).map((b) => blogToCardPayload(b, locale));
  const accreditation = normalizeAccreditation(
    accreditationsRes?.data ?? data.data.accreditation,
  );

  const tSeo = await getTranslations({ locale, namespace: "seo" });
  const homeUrl = buildCanonicalUrl(locale, "/");
  let homeTitle = "Howeyah";
  let homeDescription = tSeo("organizationDescription");
  try {
    const settingsRes = await getSettings();
    const homeSeo = await resolveSettingsPageSeo("home");
    homeTitle =
      homeSeo?.title?.trim() ||
      settingsRes.data.general.home_meta_title?.trim() ||
      settingsRes.data.general.site_name ||
      homeTitle;
    homeDescription =
      homeSeo?.description?.trim() ||
      settingsRes.data.general.home_meta_description?.trim() ||
      settingsRes.data.general.site_description?.trim() ||
      homeDescription;
  } catch {
    // use defaults
  }

  const [servicesRes, promoBanners] = await Promise.all([
    getServices(locale).catch(() => null),
    resolveHomePromoBanners(locale),
  ]);
  const serviceItems = (servicesRes?.data ?? []).slice(0, 12).map((service) => ({
    name: plainTextFromHtml(service.title),
    url: buildCanonicalUrl(locale, `/services/${encodeURIComponent(pickServiceSlug(service, locale))}`),
  }));

  const homeSchemaJson = serializeHomePageSchema({
    pageUrl: homeUrl,
    name: homeTitle,
    description: homeDescription,
    inLanguage: locale === "ar" ? "ar" : "en",
    primaryImageUrl: schemaMediaUrl("/images/home-hero.webp"),
    breadcrumbs: [],
    services: serviceItems,
  });

  return (
    <main className="max-w-full overflow-x-clip">
      <PageSchemaScript json={homeSchemaJson} />
      <HeroSection heroData={data?.data?.hero} />
      <div className="bg-gray-900">
        <div className="container mx-auto min-w-0 max-w-full overflow-x-hidden lg:-translate-y-16 max-lg:pt-16">
          <HeroStats stats={data?.data?.hero?.stats} />
        </div>
        <WhyUsSection />
      </div>
      <ServicesSection /> 
      <StepsSection />
      <DependenciesSection accreditation={accreditation} />
      <AdsSection />
      <ClientsSection />
      <TestimonialsSection />
      <PackagesSection />
      <ArticlesSection items={latestBlogs} />
      {promoBanners ? <PromoBannersSlider {...promoBanners} /> : null}
      <ContactSection />
    </main>
  );
}
