import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import * as motion from "framer-motion/client";
export default function ServicesContact() {
  const t = useTranslations("singleService.contact");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className=" container bg-gray-900 px-4 py-10 rounded-lg  shadow text-center space-y-6"
    >
      <p className="text-2xl font-bold text-brand">{t("title")}</p>

      <Button
        className={`w-32 h-12 rounded-full font-bold shadow-md transition-all duration-300 bg-brand hover:bg-brand/90 text-white`}
      >
        {t("btn")}
        <FaWhatsapp className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
