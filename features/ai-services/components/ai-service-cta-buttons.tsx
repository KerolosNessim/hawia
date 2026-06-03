import { Button } from "@/components/ui/button";
import {
  buildWhatsappSendHref,
  resolveWhatsappContactPhone,
} from "@/features/settings/lib/whatsapp-contact";
import { getSettings } from "@/features/settings/services/settings-service";
import * as motion from "framer-motion/client";
import { ExternalLink } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getTranslations } from "next-intl/server";

const HOWEYAH_AI_URL = "https://howeyah.ai/";

const btnClass =
  "h-12 min-w-[220px] gap-2 rounded-xl px-6 text-base font-bold shadow-md transition-all hover:shadow-lg";

export default async function AiServiceCtaButtons() {
  const t = await getTranslations("aiServicesPage");
  const settingsRes = await getSettings().catch(() => null);
  const whatsappPhone = resolveWhatsappContactPhone(settingsRes?.data?.contact);
  const whatsappHref = whatsappPhone ? buildWhatsappSendHref(whatsappPhone) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="container"
    >
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
        {whatsappHref ? (
          <Button asChild className={`${btnClass} bg-brand text-white hover:bg-brand/90`}>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="size-5" aria-hidden />
              {t("bookFreeConsultation")}
            </a>
          </Button>
        ) : (
          <Button type="button" disabled className={`${btnClass} bg-brand text-white`}>
            <FaWhatsapp className="size-5" aria-hidden />
            {t("bookFreeConsultation")}
          </Button>
        )}

        <Button asChild variant="outline" className={`${btnClass} border-brand text-brand hover:bg-brand/10`}>
          <a href={HOWEYAH_AI_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-5" aria-hidden />
            {t("contactDirect")}
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
