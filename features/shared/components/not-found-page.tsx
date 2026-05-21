import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Home, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import PageHeader from "./page-header";

export default async function NotFoundPage() {
  const t = await getTranslations("not-found");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} image="/seo-banner.jpg" />
      <section className="container flex flex-col items-center justify-center py-16 text-center md:py-24">
        <p
          className="pointer-events-none select-none text-[clamp(5rem,20vw,11rem)] font-black leading-none text-brand"
          aria-hidden
        >
          404
        </p>
        <p className="mt-4 max-w-xl text-xl font-bold text-gray-900 md:text-2xl">{t("subtitle")}</p>
        <p className="mt-3 max-w-lg text-base text-muted-foreground md:text-lg">{t("hint")}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-brand px-8 text-base font-bold text-white hover:bg-brand/90"
          >
            <Link href="/">
              <Home className="size-5" aria-hidden />
              {t("backHome")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-brand px-8 text-base font-bold text-brand hover:bg-brand/5"
          >
            <Link href="/contact-us">
              <MessageCircle className="size-5" aria-hidden />
              {t("contactUs")}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
