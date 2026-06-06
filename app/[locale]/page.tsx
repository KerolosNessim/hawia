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
import {
  parseHomeCountryOverride,
  type HomeCountrySearchParams,
} from "@/features/home/lib/home-country-override";
import { normalizeLandingResponse } from "@/features/home/lib/normalize-landing";
import { resolveHomeCountryId } from "@/features/home/lib/resolve-home-country-id";
import { getAccreditations } from "@/features/home/services/accreditations";
import { getLandingPageData } from "@/features/home/services/hero";
import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type { Accreditation, Hero } from "@/features/home/types";
import { getServices } from "@/features/services/services/get-services";
import { pickServiceSlug } from "@/features/services/lib/services-routes";
import { getSettings } from "@/features/settings/services/settings-service";
import { resolveSettingsPageSeo } from "@/features/settings/lib/resolve-settings-seo";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { localePathname } from "@/lib/seo/metadata-helpers";
import { buildPageMetadata } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import { buildCanonicalUrl, schemaMediaUrl, serializeHomePageSchema } from "@/lib/seo/schema";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { getServerCountryRouteCode } from "@/lib/get-country";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<HomeCountrySearchParams>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const countryCode = await getServerCountryRouteCode();
  const sp = searchParams ? await searchParams : undefined;
  const countryOverride = parseHomeCountryOverride(sp);

  try {
    const [settingsRes, landingRes] = await Promise.all([
      getSettings(),
      resolveHomeCountryId(countryOverride)
        .then((countryId) => getLandingPageData(countryId))
        .catch(() => null),
    ]);
    const settings = settingsRes.data;
    const landing = normalizeLandingResponse(landingRes ?? undefined);
    const settingsSeo = await resolveSettingsPageSeo("home");
    const title =
      landing?.hero?.seo?.meta_title?.trim() ||
      settingsSeo?.title?.trim() ||
      settings.general.home_meta_title?.trim() ||
      settings.general.site_name ||
      "Howeyah";
    const description =
      landing?.hero?.seo?.meta_description?.trim() ||
      settingsSeo?.description?.trim() ||
      settings.general.home_meta_description?.trim() ||
      settings.general.site_description?.trim() ||
      undefined;

    return buildPageMetadata({
      locale: loc,
      pathname: localePathname(loc, "/", countryCode),
      title,
      description,
    });
  } catch {
    return buildStaticPageMetadata({
      locale: loc,
      pathname: localePathname(loc, "/", countryCode),
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

function normalizeHero(raw: Hero | undefined): Hero | undefined {
  if (!raw) return undefined;
  const image = resolveMediaUrl(raw.media?.image);
  return {
    ...raw,
    media: {
      ...raw.media,
      image,
      images: (raw.media?.images ?? []).map(resolveMediaUrl),
    },
  };
}

export default async function Home({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const countryOverride = parseHomeCountryOverride(sp);
  const homeCountryId = await resolveHomeCountryId(countryOverride);

  const [landingRes, accreditationsRes] = await Promise.all([
    getLandingPageData(homeCountryId).catch(() => null),
    getAccreditations(homeCountryId).catch(() => null),
  ]);

  const landing = normalizeLandingResponse(landingRes ?? undefined);
  if (!landing) return null;

  const locale = (await getLocale()) as Locale;
  const countryCode = await getServerCountryRouteCode();
  const latestBlogs = (
    await fetchPublicBlogs({ country_id: homeCountryId, per_page: 3 })
  ).slice(0, 3).map((b) => blogToCardPayload(b, locale));
  const accreditation = normalizeAccreditation(
    accreditationsRes?.data ?? landing.accreditation,
  );
  const hero = normalizeHero(landing.hero);

  const tSeo = await getTranslations({ locale, namespace: "seo" });
  const homeUrl = buildCanonicalUrl(locale, "/", countryCode);
  let homeTitle = "Howeyah";
  let homeDescription = tSeo("organizationDescription");
  try {
    const settingsRes = await getSettings();
    const homeSeo = await resolveSettingsPageSeo("home");
    homeTitle =
      hero?.seo?.meta_title?.trim() ||
      homeSeo?.title?.trim() ||
      settingsRes.data.general.home_meta_title?.trim() ||
      settingsRes.data.general.site_name ||
      homeTitle;
    homeDescription =
      hero?.seo?.meta_description?.trim() ||
      homeSeo?.description?.trim() ||
      settingsRes.data.general.home_meta_description?.trim() ||
      settingsRes.data.general.site_description?.trim() ||
      homeDescription;
  } catch {
    // use defaults
  }

  const [servicesRes, promoBanners] = await Promise.all([
    getServices(locale, { country_id: homeCountryId }).catch(() => null),
    resolveHomePromoBanners(locale, homeCountryId),
  ]);
  const serviceItems = (servicesRes?.data ?? []).slice(0, 12).map((service) => ({
    name: plainTextFromHtml(service.title),
    url: buildCanonicalUrl(
      locale,
      `/services/${encodeURIComponent(pickServiceSlug(service, locale))}`,
      countryCode,
    ),
  }));

  const homeSchemaJson = serializeHomePageSchema({
    pageUrl: homeUrl,
    name: homeTitle,
    description: homeDescription,
    inLanguage: locale === "ar" ? "ar" : "en",
    primaryImageUrl: schemaMediaUrl(hero?.media?.image ?? "/images/home-hero.webp"),
    breadcrumbs: [],
    services: serviceItems,
  });

  return (
    <main
      className="max-w-full"
      data-home-country-id={homeCountryId ?? ""}
      data-home-country-override={countryOverride ?? ""}
    >
      <PageSchemaScript json={homeSchemaJson} />
      {hero ? <HeroSection heroData={hero} /> : null}
      <div className="relative  text-white">
        <div className="container relative z-20 mx-auto min-w-0 max-w-full px-4 sm:px-6 lg:-translate-y-16 lg:pb-10 max-lg:pt-16 max-lg:pb-8">
          <HeroStats stats={hero?.stats} />
        </div>
        <WhyUsSection countryId={homeCountryId} />
      </div>
      <ServicesSection countryId={homeCountryId} /> 
      <StepsSection countryId={homeCountryId} />
      <DependenciesSection accreditation={accreditation} />
      <AdsSection countryId={homeCountryId} />
      <TestimonialsSection countryId={homeCountryId} />
      <ClientsSection countryId={homeCountryId} initialPartners={landing.partners} />
      <PackagesSection countryId={homeCountryId} />
      <ArticlesSection items={latestBlogs} />
      {promoBanners ? <PromoBannersSlider {...promoBanners} /> : null}
      <ContactSection />
    </main>
  );
}
