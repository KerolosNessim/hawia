"use client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { RichHtml } from "@/features/shared/components/rich-html";
import { FaWhatsapp } from "react-icons/fa";
import type { SectionTone } from "@/features/services/lib/section-tone";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";

export default function PageContact({
  title,
  description,
  phone,
  tone = "dark",
}: {
  title?: string;
  description?: string;
  phone?: string;
  tone?: SectionTone;
}) {
  const t = useTranslations("singleService.contact");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "container space-y-6 rounded-2xl bg-white px-4 py-10 text-center shadow-lg",
        tone === "dark" ? "ring-1 ring-gray-200" : "border border-brand/25",
      )}
    >
      {title ? (
        <RichHtml
          html={title}
          className="text-2xl font-bold text-brand [&_p]:mb-0 [&_strong]:font-bold"
        />
      ) : null}
      {description ? (
        <RichHtml html={description} className="text-2xl font-bold text-brand" />
      ) : null}
      <Button
        className="h-12 w-32 rounded-full bg-brand font-bold text-white shadow-md transition-all duration-300 hover:bg-brand/90 hover:text-white"
        onClick={() => window.open(`https://wa.me/${phone}`)}
      >
        {t("btn")}
        <FaWhatsapp className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
