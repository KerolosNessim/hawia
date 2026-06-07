"use client";

import { AI_TOOLS_URL } from "@/features/ai-services/constants";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

export default function AiToolsLeadForm() {
  const t = useTranslations("aiServicesPage.toolsLeadForm");
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="finger-print-background container relative my-8 overflow-hidden rounded-3xl bg-[#F8FDF1] px-4 py-10 md:my-16 md:py-12"
    >
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h2 className="mx-auto mb-8 max-w-3xl text-2xl font-bold leading-normal text-gray-800 md:text-3xl">
          {t("title")}
        </h2>

        <form
          className="mx-auto flex max-w-2xl flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success(isAr ? "تم إرسال الطلب بنجاح" : "Submitted successfully");
            e.currentTarget.reset();
          }}
        >
          <input
            type="text"
            name="challenge"
            placeholder={t("challengePlaceholder")}
            className="w-full rounded-full border border-transparent bg-white px-6 py-4 text-gray-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
          />

          <input
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-full border border-transparent bg-white px-6 py-4 text-gray-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
          />

          <div className="flex items-start gap-3 px-2 text-start">
            <input
              type="checkbox"
              id="ai-tools-agreement"
              name="agreement"
              className="mt-1 size-4 shrink-0 accent-brand"
              required
            />
            <label
              htmlFor="ai-tools-agreement"
              className="cursor-pointer select-none text-sm font-medium leading-relaxed text-gray-600"
            >
              {t("agreement")}
            </label>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="submit"
              className="w-full rounded-full border-b-4 border-black/10 bg-brand py-4 text-lg font-bold text-white shadow-md transition-colors hover:bg-brand/90 active:translate-y-1 active:border-b-0"
            >
              {t("submit")}
            </button>

            <a
              href={AI_TOOLS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-brand bg-white py-4 text-lg font-bold text-brand shadow-sm transition-colors hover:bg-brand/5"
            >
              {t("aiToolsButton")}
            </a>
          </div>
        </form>
      </div>
    </motion.section>
  );
}
