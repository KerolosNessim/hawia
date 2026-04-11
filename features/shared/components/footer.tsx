"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { MapPin, Mail, ArrowLeft, ArrowRight, MessageCircle, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const omanServices = t.raw("omanServices") as string[];
  const turkeyServices = t.raw("turkeyServices") as string[];
  const saudiServices = t.raw("saudiServices") as string[];
  const offices = t.raw("offices") as string[];
  const phones = t.raw("phones") as string[];

  // Define Social Icons Component mapping
  const SocialIcon = ({ name }: { name: string }) => {
    switch (name) {
      case "linkedin": return <FaLinkedin className="w-5 h-5 text-white" />;
      case "snapchat": return <MessageCircle className="w-5 h-5 text-white" />; // Placeholder for Snapchat
      case "tiktok": return <FaTiktok className="w-5 h-5 text-white" />;
      case "x": return <FaTwitter className="w-5 h-5 text-white" />;
      case "instagram": return <FaInstagram className="w-5 h-5 text-white" />;
      case "facebook": return <FaFacebook className="w-5 h-5 text-white" />;
      default: return null;
    }
  };

  const socialLinks = [
    { name: "linkedin", url: "#" },
    { name: "snapchat", url: "#" },
    { name: "tiktok", url: "#" },
    { name: "x", url: "#" },
    { name: "instagram", url: "#" },
    { name: "facebook", url: "#" },
  ];

  return (
    <footer className="bg-gray-50 relative pt-20 overflow-hidden font-sans border-t border-gray-200">


      <div className="container px-4 mx-auto relative z-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center md:text-start lg:text-start rtl:md:text-right">
          
          {/* Logo Column */}
          <div className="flex flex-col items-center lg:items-start rtl:lg:items-start space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.webp"
                alt="Howeyah Logo"
                width={160}
                height={60}
                className="rtl:ml-auto ltr:mr-auto"
              />
            </Link>
            <p className="text-gray-700 font-bold text-lg max-w-[200px] leading-snug mx-auto lg:mx-0">
              {t("brandDescription")}
            </p>
            <div className="text-brand font-bold space-y-1">
              <p>{t("registeredTrademark")}</p>
              <div className="flex items-center justify-center lg:justify-start">
                 <span>{t("trademarkCertificate")}</span>
                 <span className="inline-flex max-w-[20px] ms-2 text-brand">▶</span>
              </div>
            </div>
            
            {/* Ministry Badge Mock (You may replace with real image) */}
            {/* <div className="bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm inline-flex flex-col items-center mt-4 mx-auto lg:mx-0">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">⌘</span>
                 </div>
                 <div className="text-[10px] text-gray-500 text-center leading-tight">
                    وزارة التجارة والاستثمار<br/>Ministry of Commerce
                 </div>
              </div>
              <p className="font-bold text-gray-800 text-sm mt-1">{t("authenticatedBy")}</p>
            </div> */}
          </div>

          {/* Oman Services */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-brand pb-2 inline-block">
              {t("omanServicesTitle")}
            </h3>
            <p className="text-sm text-gray-600 mb-6 ">{t("omanServicesIntro")}</p>
            <ul className="space-y-4">
              {omanServices.map((service, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-brand me-2 mt-1">
                    {isRtl ? <ArrowLeft className="w-4 h-4 bg-brand/10 rounded-full p-0.5" /> : <ArrowRight className="w-4 h-4 bg-brand/10 rounded-full p-0.5" />}
                  </span>
                  <span className="text-gray-700 font-medium text-sm flex-1">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Turkey Services */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-brand pb-2 inline-block">
              {t("turkeyServicesTitle")}
            </h3>
            <p className="text-sm text-gray-600 mb-6 ">{t("turkeyServicesIntro")}</p>
            <ul className="space-y-4">
              {turkeyServices.map((service, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-brand me-2 mt-1">
                    {isRtl ? <ArrowLeft className="w-4 h-4 bg-brand/10 rounded-full p-0.5" /> : <ArrowRight className="w-4 h-4 bg-brand/10 rounded-full p-0.5" />}
                  </span>
                  <span className="text-gray-700 font-medium text-sm flex-1">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Saudi Services */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-brand pb-2 inline-block">
              {t("saudiServicesTitle")}
            </h3>
            <p className="text-sm text-gray-600 mb-6 ">{t("saudiServicesIntro")}</p>
            <ul className="space-y-4">
              {saudiServices.map((service, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-brand me-2 mt-1">
                    {isRtl ? <ArrowLeft className="w-4 h-4 bg-brand/10 rounded-full p-0.5" /> : <ArrowRight className="w-4 h-4 bg-brand/10 rounded-full p-0.5" />}
                  </span>
                  <span className="text-gray-700 font-medium text-sm flex-1">{service}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-10">
          {/* Offices List */}
          <div className="rtl:text-right ltr:text-left text-center md:text-start lg:text-start">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 inline-block border-b-2 border-brand pb-2">{t("officesTitle")}</h3>
            <ul className="space-y-5">
              {offices.map((office, idx) => (
                <li key={idx} className="flex items-start  md:justify-start lg:justify-start">
                  <MapPin className="w-5 h-5 text-brand me-3 mt-0.5 shrink-0" />
                  <span className="text-gray-700 font-medium text-sm leading-relaxed max-w-md">{office}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="flex flex-col items-center md:items-end justify-center md:justify-start lg:items-end w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 inline-block border-b-2 border-brand pb-2">{t("contactTitle")}</h3>
            
            <div className="rtl:text-right ltr:text-left space-y-3 mb-8 w-full max-w-[200px]">
              {phones.map((phone, idx) => (
                <p key={idx} className="text-brand font-bold text-lg dir-ltr w-full text-center md:text-end ltr:md:text-start" dir="ltr">{phone}</p>
              ))}
              <div className="flex items-center justify-center md:justify-end ltr:md:justify-start pt-2 mt-4 border-t border-gray-200">
                <span className="text-gray-600 font-medium me-2">{t("email")}</span>
                <Mail className="w-5 h-5 text-brand" />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.url}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-brand flex items-center justify-center transition-colors shadow-sm"
                >
                  <SocialIcon name={social.name} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Rights Bar */}
      <div className="bg-gray-900 text-gray-400 py-6 relative z-10 w-full">
        <div className="container px-4 mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col text-center lg:text-start rtl:lg:text-right space-y-1">
            <p className="text-white font-medium text-sm">{t("copyright")}</p>
            <p className="text-xs">{t("rights2")}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">{t("privacy")}</Link>
            <span className="text-gray-600">-</span>
            <Link href="#" className="hover:text-white transition-colors">{t("terms")}</Link>
            <span className="text-gray-600">-</span>
            <Link href="#" className="hover:text-white transition-colors">{t("refund")}</Link>
          </div>

          {/* Payment Icons Mock */}
          <div className="flex items-center gap-3">
             <div className="w-10 h-6 bg-white rounded flex items-center justify-center"><span className="text-[10px] font-bold text-blue-900 tracking-tighter">VISA</span></div>
             <div className="w-10 h-6 bg-white rounded flex items-center justify-center"><span className="text-[8px] font-bold tracking-tighter text-red-600">MasterCard</span></div>
             <div className="w-10 h-6 bg-white rounded flex items-center justify-center"><span className="text-[10px] font-bold text-blue-500">PayPal</span></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
