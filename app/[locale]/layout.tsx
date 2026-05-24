import { DirectionProvider } from "@/components/ui/direction";
import FloatingSocials from "@/features/shared/components/floating-socials";
import Footer from "@/features/shared/components/footer";
import Navbar from "@/features/shared/components/navbar";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { cairoLocal, fontPreloadByLocale, geistLocal } from "@/lib/fonts";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import BreadcrumbJsonLd from "@/features/shared/components/seo/breadcrumb-json-ld";
import { HeadTagsFromMarkup } from "@/features/shared/components/seo/head-tags-from-markup";
import { HeadScriptsFromMarkup } from "@/features/shared/components/seo/head-scripts-from-markup";
import OrganizationJsonLd from "@/features/shared/components/seo/organization-json-ld";
import { partitionBodyScripts } from "@/lib/seo/partition-body-scripts";
import { SITE_REFERRER_POLICY } from "@/lib/seo/metadata-helpers";

import { getSettings, scriptsFromSettings } from "@/features/settings/services/settings-service";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  try {
    const response = await getSettings();
    const settings = response.data;
    const homeSeo = settings.seo.find((s) => s.page_key === "home");

    return {
      title: homeSeo?.meta_title || settings.general.site_name,
      description: homeSeo?.meta_description || settings.general.site_description,
      referrer: SITE_REFERRER_POLICY,
      icons: {
        icon: settings.general.favicon || "/favicon.ico",
      },
    };
  } catch (error) {
    console.error("Failed to fetch settings for metadata:", error);
    return {
      title: "Howeyah",
      description: "Howeyah platform for consulting and educational services.",
      referrer: SITE_REFERRER_POLICY,
    };
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    redirect("/");
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  const isArabic = locale === "ar";
  const font = isArabic ? cairoLocal : geistLocal;
  const fontPreload = fontPreloadByLocale[isArabic ? "ar" : "en"];

  const dir   = isArabic ? "rtl" : "ltr";

  const settingsForScripts = await getSettings().catch(() => null);
  const scripts = settingsForScripts ? scriptsFromSettings(settingsForScripts.data) : null;
  const { headMarkup: hoistedHeadTags, bodyMarkup: bodyScriptsOnly } = partitionBodyScripts(
    scripts?.custom_body_scripts,
  );

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${font.variable} ${font.className}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="referrer" content={SITE_REFERRER_POLICY} />
        <link
          rel="preload"
          href={fontPreload.href}
          as="font"
          type={fontPreload.type}
          crossOrigin="anonymous"
        />
        <OrganizationJsonLd locale={locale} />
        <HeadTagsFromMarkup markup={hoistedHeadTags} />
        <HeadScriptsFromMarkup markup={scripts?.custom_head_scripts} />
      </head>
      <body className=" relative overflow-x-hidden ">
        <QueryProvider>
          <NextIntlClientProvider messages={messages}>
            <BreadcrumbJsonLd />
            <DirectionProvider direction={dir}>
              <Navbar/>
              {children}
              <Footer />
              <FloatingSocials />
              <Toaster  position="top-right"/>
            </DirectionProvider>
          </NextIntlClientProvider>
        </QueryProvider>

        {bodyScriptsOnly ? (
          <div dangerouslySetInnerHTML={{ __html: bodyScriptsOnly }} />
        ) : null}
      </body>
    </html>
  );
}
