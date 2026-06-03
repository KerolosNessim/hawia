"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPlus,
  FaTiktok,
  FaTimes,
  FaTwitter,
  FaWhatsapp
} from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useSettings } from "@/features/settings/hooks/use-settings";

export default function FloatingSocials() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    if (media.matches) setOpen(true);
  }, []);
  const t = useTranslations("socials");
  const { data: settings } = useSettings();

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook": return <FaFacebook className="text-blue-600 text-xl" />;
      case "twitter": 
      case "x": return <FaTwitter className="text-sky-500 text-xl" />;
      case "instagram": return <FaInstagram className="text-pink-500 text-xl" />;
      case "tiktok": return <FaTiktok className="text-black text-xl" />;
      case "whatsapp": return <FaWhatsapp className="text-green-500 text-xl" />;
      case "linkedin": return <FaLinkedin className="text-blue-700 text-xl" />;
      default: return null;
    }
  };

  const socials = settings?.social_media.map(item => ({
    icon: getIcon(item.platform),
    name: item.platform,
    link: item.link
  })) || [
    {
      icon: <FaFacebook className="text-blue-600 text-xl" />,
      name: t("facebook"),
      link: "#"
    },
    { icon: <FaTwitter className="text-sky-500 text-xl" />, name: t("twitter"), link: "#" },
    {
      icon: <FaInstagram className="text-pink-500 text-xl" />,
      name: t("instagram"),
      link: "#"
    },
    { icon: <FaTiktok className="text-black text-xl" />, name: t("tiktok"), link: "#" },
    {
      icon: <FaWhatsapp className="text-green-500 text-xl" />,
      name: t("whatsapp"),
      link: "#"
    },
  ];

  return (
    <div
      className={`fixed bottom-4 z-40 max-md:scale-90 sm:bottom-6 ${locale === "ar" ? "left-3 sm:left-6" : "right-3 sm:right-6"}`}
    >
      <div className="relative flex flex-col items-center gap-1 max-md:gap-1 sm:gap-1.5">
        <AnimatePresence>
          {open &&
            socials.map((item, i) => {
              return (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex size-12 items-center justify-center rounded-full border border-brand/50 bg-white shadow-sm transition-transform hover:scale-110 sm:size-14 md:size-16"
                    title={item.name}
                  >
                    {item.icon}
                  </motion.div>
                </a>
              );
            })}
        </AnimatePresence>
        <button
          onClick={() => setOpen(!open)}
          className="flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-110 sm:size-14 md:size-16"
        >
          {open ? <FaTimes /> : <FaPlus />}
        </button>
      </div>
    </div>
  );
}
