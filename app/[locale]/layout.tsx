import { DirectionProvider } from "@/components/ui/direction";
import FloatingSocials from "@/features/shared/components/floating-socials";
import Footer from "@/features/shared/components/footer";
import Navbar from "@/features/shared/components/navbar";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Cairo, Geist } from "next/font/google";
import { redirect } from "next/navigation";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import BreadcrumbJsonLd from "@/features/shared/components/seo/breadcrumb-json-ld";
import OrganizationJsonLd from "@/features/shared/components/seo/organization-json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

import { getScripts, getSettings } from "@/features/settings/services/settings-service";

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
      icons: {
        icon: settings.general.favicon || "/favicon.ico",
      },
    };
  } catch (error) {
    console.error("Failed to fetch settings for metadata:", error);
    return {
      title: "Howeyah",
      description: "Howeyah platform for consulting and educational services.",
    };
  }
}

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800", "900"],
});

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

  const font = locale === "ar" ? cairo : geistSans;

  const dir = locale === "ar" ? "rtl" : "ltr";

  const scriptsResponse = await getScripts().catch(() => null);
  const scripts = scriptsResponse?.data;

  return (
    <html lang={locale} dir={dir} className={`${font.className} `} suppressHydrationWarning>
      <head>
        {scripts?.custom_head_scripts && (
          <script
            dangerouslySetInnerHTML={{ __html: scripts.custom_head_scripts }}
          />
        )}
      </head>
      <body className=" relative overflow-x-hidden ">
        <OrganizationJsonLd locale={locale} />
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

        {scripts?.custom_body_scripts && (
          <div
            dangerouslySetInnerHTML={{ __html: scripts.custom_body_scripts }}
          />
        )}
      </body>
    </html>
  );
}
