import AboutVideoDialog from "@/features/about/components/about-video-dialog";
import {
  accreditationToLogoTiles,
  getPartnersListFromResponse,
  normalizeAccreditationForAbout,
  partnersToLogoTiles,
} from "@/features/about/lib/normalize-about-logos";
import { getAccreditations } from "@/features/home/services/accreditations";
import { getPartners } from "@/features/home/services/partners";
import Identity from "@/features/about/components/identity";
import VissionAndMession from "@/features/about/components/vision-and-mession";
import ServicesSection from "@/features/services/components/services-section";
import Values from "@/features/about/components/values";
import PageContact from "@/features/shared/components/page-contact";
import PageHeader from "@/features/shared/components/page-header";
import LogoMarqueeSection from "@/features/shared/components/logo-marquee-section";
import LogoTilesSection from "@/features/shared/components/logo-tiles-section";
import { getAboutData } from "@/features/about/services/about";
import { getTranslations } from "next-intl/server";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { localePathname } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import { buildCanonicalUrl, serializeStaticPageSchema } from "@/lib/seo/schema";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import SectionHeader from "@/features/shared/components/section-header";

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

  const tClients = await getTranslations("clientsSection");
  const tAccreditations = await getTranslations("dependenciesSection");

  let data;
  let accreditation;
  let partnerTiles: ReturnType<typeof partnersToLogoTiles> = [];
  let partnersSectionTitle = tClients("title");
  let partnersSectionSubtitle = tClients("subtitle");

  try {
    const [aboutRes, accreditationsRes, partnersRes] = await Promise.all([
      getAboutData(),
      getAccreditations().catch(() => null),
      getPartners().catch(() => null),
    ]);
    data = aboutRes.data;
    accreditation = normalizeAccreditationForAbout(accreditationsRes?.data);

    const partners = getPartnersListFromResponse(partnersRes);
    partnerTiles = partnersToLogoTiles(partners, locale);
    if (partners[0]?.title?.trim()) partnersSectionTitle = partners[0].title.trim();
    if (partners[0]?.description?.trim()) partnersSectionSubtitle = partners[0].description.trim();
  } catch (error) {
    console.error("Failed to fetch About Us data:", error);
  }

  const accreditationTiles = accreditationToLogoTiles(accreditation, locale);

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
        align="center"
      />

      <div className="space-y-16 finger-print-background">
        <AboutVideoDialog
          videoUrl={data?.video_url}
          watchLabel={t("watchVideo")}
        />
        {/* identity */}
        <Identity
          title={data?.sections[0]?.title || t("identity.title")}
          description={data?.sections[0]?.description || ""}
          image={data?.sections[0]?.image || "/about-identity.webp"}
        />
      </div>
      {/* vision and mession */}
      <VissionAndMession
        image={data?.image || "/hero-bg.webp"}
        data={data?.vision_sections[0]}
      />
      {/* services */}
      <ServicesSection lightBg={true} />
      {/* values */}
      <Values data={data?.why_us_sections[0]} />
      {/* ideal client */}

      <LogoMarqueeSection
        title={accreditation?.title || tAccreditations("title")}
        subtitleHtml={accreditation?.description || tAccreditations("subtitle")}
        images={accreditationTiles}
      />

      <LogoMarqueeSection
        variant="white"
        title={partnersSectionTitle}
        subtitleHtml={partnersSectionSubtitle}
        images={partnerTiles}
        rowCount={3}
      />
      <div className="container rounded-3xl shadow-lg bg-white px-5 py-10">
        <SectionHeader
          title={t("ideal_client_title")}
          subtitle={t("ideal_client")}
          subtitleColor="text-gray-500"
          titleColor="text-gray-900"
        />
      </div>
      <PageContact
        title={data?.contact_sections[0]?.title || t("contact.title")}
        description={
          data?.contact_sections[0]?.description || t("contact.description")
        }
        phone={data?.contact_sections[0]?.phone}
      />
    </div>
  );
}
