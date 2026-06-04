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
        "container space-y-6 rounded-2xl px-4 py-10 text-center shadow-lg",
        tone === "dark"
          ? "bg-gray-800/90 ring-1 ring-white/10"
          : "border border-brand/25 bg-brand/5",
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
        className={`w-32 h-12 rounded-full font-bold shadow-md transition-all duration-300 bg-brand hover:bg-brand/90 text-white`}
        onClick={() => window.open(`https://wa.me/${phone}`)}
      >
        {t("btn")}
        <FaWhatsapp className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
