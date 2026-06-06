import { TRADEMARK_REGISTRATION_PDF } from "@/features/trademark/constants";
import PageHeader from "@/features/shared/components/page-header";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { FileText } from "lucide-react";

export default async function TrademarkCertificatePage() {
  const t = await getTranslations("trademarkCertificatePage");

  return (
    <div className="pb-16">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="container max-w-4xl space-y-8 py-12">
        <p className="text-center text-lg font-bold text-gray-900">{t("authenticatedBy")}</p>
        <p className="text-center text-muted-foreground">{t("registeredNote", { number: "181546" })}</p>

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <iframe
            src={TRADEMARK_REGISTRATION_PDF}
            title={t("pdfTitle")}
            className="min-h-[70vh] w-full"
          />
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg" className="rounded-full bg-brand text-white hover:bg-brand/90">
            <a href={TRADEMARK_REGISTRATION_PDF} target="_blank" rel="noopener noreferrer">
              <FileText className="size-5" aria-hidden />
              {t("openPdf")}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
