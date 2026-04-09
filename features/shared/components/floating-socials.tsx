"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale } from "next-intl";
import { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaPlus,
  FaTiktok,
  FaTimes,
  FaTwitter,
  FaWhatsapp
} from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function FloatingSocials() {
  const [open, setOpen] = useState(true);
  const locale = useLocale()
  const t = useTranslations("socials");

  // خريطة الأيقونات لكل منصة
  const socials = [
    {
      icon: <FaFacebook className="text-blue-600 text-xl" />,
      name: t("facebook"),
    },
    { icon: <FaTwitter className="text-sky-500 text-xl" />, name: t("twitter") },
    {
      icon: <FaInstagram className="text-pink-500 text-xl" />,
      name: t("instagram"),
    },
    { icon: <FaTiktok className="text-black text-xl" />, name: t("tiktok") },
    {
      icon: <FaWhatsapp className="text-green-500 text-xl" />,
      name: t("whatsapp"),
    },
  ];

  return (
    <div className={`fixed bottom-6 ${locale === "ar" ? "left-6" : "right-6"} z-50`}>
      <div className="relative flex flex-col items-center gap-1.5">
        <AnimatePresence>
          {open &&
            socials.map((item, i) => {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white shadow-sm rounded-full size-16 border border-brand/50 flex items-center justify-center hover:scale-110 transition-transform"
                  title={item.name}
                >
                  {item.icon}
                </motion.div>
              );
            })}
        </AnimatePresence>
        <button
          onClick={() => setOpen(!open)}
          className="bg-brand text-white size-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          {open ? <FaTimes /> : <FaPlus />}
        </button>
      </div>
    </div>
  );
}
