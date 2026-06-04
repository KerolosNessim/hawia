import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import * as motion from "framer-motion/client";
import { getTranslations } from "next-intl/server";

const btnClass =
  "h-12 min-w-[220px] gap-2 rounded-xl px-6 text-base font-bold shadow-md transition-all hover:shadow-lg";

export default async function AiServiceCtaButtons() {
  const t = await getTranslations("aiServicesPage");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="container"
    >
      <div className="flex flex-col items-center justify-center">
        <Button asChild className={`${btnClass} bg-brand text-white hover:bg-brand/90`}>
          <Link href="/contact-us">{t("aiToolsCta")}</Link>
        </Button>
      </div>
    </motion.div>
  );
}
