import PageHeader from "@/features/shared/components/page-header";
import { Button } from "@/components/ui/button";
import type { BreadcrumbTrailItem } from "@/features/shared/lib/breadcrumb-trail";
import { ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

const YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const VIDEO_THUMBNAIL = "/blogs-banner.jfif";

export default async function AiServicesContentPage() {
  const t = await getTranslations("aiServicesContentPage");
  const tNav = await getTranslations("navbar");
  const tAi = await getTranslations("aiServicesPage");

  const contentParagraphs = t.raw("contentParagraphs") as string[];
  const contentBullets = t.raw("contentBullets") as string[];

  const breadcrumbItems: BreadcrumbTrailItem[] = [
    { label: tNav("home"), href: "/" },
    { label: tAi("title"), href: "/ai-services" },
    { label: t("breadcrumb"), href: "/ai-services/content" },
  ];

  return (
    <div className="pb-16">
      <PageHeader
        image="/blogs-banner.jfif"
        title={t("title")}
        description={t("description")}
        breadcrumbItems={breadcrumbItems}
      />

      <div className="container max-w-6xl space-y-16 pt-10">
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("videoSectionTitle")}</h2>
              <p className="mt-2 text-muted-foreground">{t("videoSectionSubtitle")}</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 shadow-lg">
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-video w-full"
              >
                <Image
                  src={VIDEO_THUMBNAIL}
                  alt={t("videoThumbnailAlt")}
                  fill
                  className="object-cover opacity-90 transition-opacity group-hover:opacity-75"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/45">
                  <span className="flex size-16 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-white/20 transition-transform group-hover:scale-105">
                    <Play className="size-8 fill-current ps-1" aria-hidden />
                  </span>
                </span>
              </a>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-gray-900 px-4 py-3">
                <p className="text-sm font-medium text-gray-300">{t("videoCaption")}</p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-brand/40 bg-transparent text-brand hover:bg-brand/10 hover:text-brand"
                >
                  <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" aria-hidden />
                    {t("youtubeLabel")}
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <article className="space-y-6 lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900">{t("contentTitle")}</h2>

            <div className="space-y-4 text-base leading-relaxed text-gray-700">
              {contentParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>

            <ul className="space-y-3 rounded-2xl border border-brand/20 bg-brand/5 p-6">
              {contentBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm font-medium text-gray-800">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}
