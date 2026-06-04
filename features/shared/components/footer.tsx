"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Mail, ArrowLeft, ArrowRight, MessageCircle, Phone } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { groupFooterServicesByCountry } from "@/features/settings/lib/group-footer-services-by-country";
import {
  MINISTRY_CERTIFICATION_LOGO,
  TRADEMARK_REGISTRATION_PDF,
} from "@/features/trademark/constants";
import { RichHtml } from "@/features/shared/components/rich-html";
import { pickServiceDisplayTitle } from "@/features/services/lib/service-display-title";
import { pickServiceSlug, servicePostPath } from "@/features/services/lib/services-routes";

type FooterOffice = { label: string; address: string };
type FooterPageLink = { href: string; label: string };

function FooterServicesSkeleton() {
  return (
    <div className="animate-pulse text-start">
      <div className="mb-4 h-8 w-32 rounded bg-gray-200" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((j) => (
          <div key={j} className="h-4 w-full rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { data: settings, isLoading: settingsLoading } = useSettings();

  const footerOffices = t.raw("offices") as FooterOffice[];
  const footerPhones = t.raw("phones") as string[];
  const footerPageLinks = t.raw("pageLinks") as FooterPageLink[];
  const email = settings?.contact?.email || t("email");

  const footerCountryColumns = useMemo(
    () => groupFooterServicesByCountry(settings?.footer?.services, locale),
    [settings?.footer?.services, locale],
  );

  const SocialIcon = ({ name }: { name: string }) => {
    const iconName = name.toLowerCase();
    switch (iconName) {
      case "linkedin":
        return <FaLinkedin className="h-5 w-5 text-white" />;
      case "snapchat":
        return <MessageCircle className="h-5 w-5 text-white" />;
      case "tiktok":
        return <FaTiktok className="h-5 w-5 text-white" />;
      case "twitter":
      case "x":
        return <FaTwitter className="h-5 w-5 text-white" />;
      case "instagram":
        return <FaInstagram className="h-5 w-5 text-white" />;
      case "facebook":
        return <FaFacebook className="h-5 w-5 text-white" />;
      case "whatsapp":
        return <FaWhatsapp className="h-5 w-5 text-white" />;
      default:
        return null;
    }
  };

  const socialLinks = settings?.social_media || [
    { platform: "facebook", link: "#" },
    { platform: "twitter", link: "#" },
    { platform: "instagram", link: "#" },
    { platform: "linkedin", link: "#" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-gray-200 bg-gray-50 pt-20 font-sans">
      <div className="container relative z-10 mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Logo Column */}
          <div className="flex flex-col items-center space-y-6 text-center lg:items-start lg:text-start rtl:lg:items-start">
            <Link href="/" className="inline-block">
              <Image
                src={settings?.general?.logo || "/logo.webp"}
                alt={settings?.general?.site_name || "Howeyah Logo"}
                width={160}
                height={60}
                className="h-auto w-auto max-w-[160px] ltr:mr-auto rtl:ml-auto"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <RichHtml
              html={settings?.general?.site_description || t("brandDescription")}
              className="mx-auto text-lg leading-snug font-bold whitespace-nowrap text-gray-700 lg:mx-0"
            />
            <div className="space-y-2 font-bold text-brand">
              <a
                href={TRADEMARK_REGISTRATION_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none lg:justify-start"
              >
                <span>{t("trademarkCertificate")}</span>
                <span className="inline-flex text-brand" aria-hidden>
                  {isRtl ? (
                    <ArrowLeft className="h-4 w-4 rounded-full bg-brand/10 p-0.5" />
                  ) : (
                    <ArrowRight className="h-4 w-4 rounded-full bg-brand/10 p-0.5" />
                  )}
                </span>
              </a>
            </div>
          </div>

          {/* SA & Oman service columns from settings */}
          {settingsLoading
            ? [1, 2].map((i) => <FooterServicesSkeleton key={i} />)
            : footerCountryColumns.map((country) => (
                <div key={country.code} className="text-start">
                  <h3 className="mb-4 inline-block border-b-2 border-brand pb-2 text-xl font-bold text-gray-900">
                    {country.name}
                  </h3>
                  {country.services.length > 0 ? (
                    <ul className="w-full space-y-4">
                      {country.services.map((service) => (
                        <li key={service.id} className="flex items-start justify-start gap-2">
                          <span className="mt-1 shrink-0 text-brand">
                            {isRtl ? (
                              <ArrowLeft className="h-4 w-4 rounded-full bg-brand/10 p-0.5" />
                            ) : (
                              <ArrowRight className="h-4 w-4 rounded-full bg-brand/10 p-0.5" />
                            )}
                          </span>
                          <Link
                            href={servicePostPath(pickServiceSlug(service, locale))}
                            className="text-start text-sm font-medium text-gray-700 transition-colors hover:text-brand"
                          >
                            {pickServiceDisplayTitle(
                              {
                                ...service,
                                highlight_description: service.highlight_description ?? "",
                                meta_title: service.meta_title ?? "",
                              },
                              locale,
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}

          {/* Site pages */}
          <div className="text-start">
            <h3 className="mb-4 inline-block border-b-2 border-brand pb-2 text-xl font-bold text-gray-900">
              {t("pagesTitle")}
            </h3>
            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-3">
              {footerPageLinks.map((item) => (
                <li key={`${item.href}-${item.label}`} className="flex items-start justify-start gap-2">
                  <span className="mt-1 shrink-0 text-brand">
                    {isRtl ? (
                      <ArrowLeft className="h-4 w-4 rounded-full bg-brand/10 p-0.5" />
                    ) : (
                      <ArrowRight className="h-4 w-4 rounded-full bg-brand/10 p-0.5" />
                    )}
                  </span>
                  <Link
                    href={item.href}
                    className="text-start text-sm font-medium text-gray-700 transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Offices | Ministry certification | Phones */}
        <div className="mt-10 grid grid-cols-1 items-start gap-8 border-t border-gray-200 pt-10 md:grid-cols-3 lg:gap-12">
          <div className="text-center md:text-start">
            <h3 className="mb-6 inline-block border-b-2 border-brand pb-2 text-2xl font-bold text-gray-900">
              {t("officesTitle")}
            </h3>
            <ul className="space-y-5">
              {footerOffices.map((office, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-center gap-3 md:justify-start"
                >
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                  <p className="text-start text-sm leading-relaxed font-medium text-gray-700">
                    <span className="font-bold text-gray-900">{office.label}: </span>
                    {office.address}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <a
              href={TRADEMARK_REGISTRATION_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex flex-col items-center gap-3 rounded-xl p-2 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <Image
                src={MINISTRY_CERTIFICATION_LOGO}
                alt={t("ministryLogoAlt")}
                width={191}
                height={117}
                className="h-auto w-full max-w-[191px] object-contain"
              />
              <p className="max-w-xs text-sm leading-snug font-bold text-gray-900 group-hover:text-brand">
                {t("authenticatedBy")}
              </p>
            </a>
          </div>

          <div className="flex flex-col items-center text-center md:items-end md:text-end">
            <h3 className="mb-6 inline-block border-b-2 border-brand pb-2 text-2xl font-bold text-gray-900">
              {t("contactTitle")}
            </h3>
            <div className="mb-6 w-full max-w-[240px] space-y-3 text-end">
              {footerPhones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone}`}
                  className="flex items-center justify-center gap-2 text-lg font-bold text-brand hover:underline md:justify-start"
                  dir="ltr"
                >
                  <Phone className="h-5 w-5 shrink-0" aria-hidden />
                  {phone}
                </a>
              ))}
            </div>
            <div className="flex w-full max-w-[240px] items-center justify-center gap-2 border-t border-gray-200 pt-4 md:justify-end">
              <a
                href={`mailto:${email}`}
                className="font-medium text-gray-600 hover:text-brand"
              >
                {email}
              </a>
              <Mail className="h-5 w-5 shrink-0 text-brand" aria-hidden />
            </div>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.link || "#"}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 shadow-sm transition-colors hover:bg-brand"
                >
                  <SocialIcon name={social.platform} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full bg-gray-900 py-6 text-gray-400">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 lg:flex-row">
          <div className="flex flex-col space-y-1 text-center lg:text-start rtl:lg:text-right">
            <p className="text-sm font-medium text-white">{t("copyright")}</p>
            <p className="text-xs">{t("rights2")}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            <Link href="/privacy-policy" className="transition-colors hover:text-white">
              {t("privacy")}
            </Link>
            <span className="text-gray-600">-</span>
            <Link href="/terms-of-use" className="transition-colors hover:text-white">
              {t("terms")}
            </Link>
            <span className="text-gray-600">-</span>
            <Link href="/refund-policy" className="transition-colors hover:text-white">
              {t("refund")}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-6 w-10 items-center justify-center rounded bg-white">
              <span className="text-[10px] font-bold tracking-tighter text-blue-900">VISA</span>
            </div>
            <div className="flex h-6 w-10 items-center justify-center rounded bg-white">
              <span className="text-[8px] font-bold tracking-tighter text-red-600">
                MasterCard
              </span>
            </div>
            <div className="flex h-6 w-10 items-center justify-center rounded bg-white">
              <span className="text-[10px] font-bold text-blue-500">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
