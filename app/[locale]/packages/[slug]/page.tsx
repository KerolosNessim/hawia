import { fetchPublicPackageDetail } from "@/features/packages/services/packages-public-api";
import { PackageIcon, DetailsButton } from "@/features/packages/components/public-package-cards";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

type Props = Readonly<{ params: Promise<{ locale: string; slug: string }> }>;

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("packageDetail");
  const decoded = decodeURIComponent(slug);

  const pkg = await fetchPublicPackageDetail(decoded, locale);
  if (!pkg) notFound();

  const priceUi =
    pkg.price != null && String(pkg.price).trim() !== ""
      ? pkg.currency?.trim()
        ? `${pkg.currency.trim()} ${pkg.price}`
        : String(pkg.price)
      : pkg.priceLabel;

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Button variant="ghost" asChild className="mb-8 rounded-full gap-2">
        <Link href="/packages">
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
      </Button>

      <div className="rounded-3xl border border-border/60 bg-white p-8 md:p-12 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-8 md:items-start">
          <div className="mx-auto md:mx-0 shrink-0 bg-gray-50 rounded-full p-5 border border-gray-100 h-[96px] w-[96px] flex items-center justify-center">
            <PackageIcon pkg={pkg} className="w-14 h-14 text-brand" />
          </div>
          <div className="flex-1 text-center md:text-start space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{pkg.title}</h1>
            {priceUi ? (
              <p className="text-lg font-semibold text-brand">{priceUi}</p>
            ) : null}
            <p className="text-muted-foreground leading-relaxed">{pkg.description}</p>
            <DetailsButton pkg={pkg} fallbackLabel={t("order")} />
          </div>
        </div>

        {pkg.features.length > 0 ? (
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold mb-6">{t("features")}</h2>
            <ul className="space-y-3">
              {pkg.features.map((f, i) => (
                <li key={i} className="flex gap-3 text-sm md:text-base">
                  <span
                    className={
                      f.isIncluded ? "text-emerald-600 font-bold shrink-0" : "text-gray-400 shrink-0"
                    }
                    aria-hidden
                  >
                    {f.isIncluded ? "✓" : "✕"}
                  </span>
                  <span className={f.isIncluded ? "text-gray-900" : "text-gray-400 line-through"}>
                    {f.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
