import AiServicesContentVideoGrid from "@/features/ai-services/components/ai-services-content-video-grid";
import { getServiceAiContent } from "@/features/ai-services/services/get-service-ai-content";
import { RichHtml } from "@/features/shared/components/rich-html";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { cn } from "@/lib/utils";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

const VIDEO_POSTER_FALLBACK = "/blogs-banner.jfif";

function hasContent(text: string | undefined): boolean {
  return Boolean(plainTextFromHtml(text ?? "").trim());
}

function isHtmlString(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text.trim());
}

function ContentBlock({
  text,
  asTitle,
}: {
  text: string;
  asTitle?: boolean;
}) {
  if (!hasContent(text)) return null;

  if (isHtmlString(text)) {
    return (
      <RichHtml
        html={text}
        className={cn(
          "cms-rich-html",
          asTitle
            ? "text-2xl font-bold text-gray-900 md:text-3xl [&_p]:mb-0"
            : "text-base leading-relaxed text-muted-foreground",
        )}
      />
    );
  }

  if (asTitle) {
    return <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">{text}</h2>;
  }

  return <p className="text-base leading-relaxed text-muted-foreground">{text}</p>;
}

export default async function AiServicesApiContentSection() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("aiServicesContentPage");
  const content = await getServiceAiContent(locale);

  if (!content?.is_active) return null;

  const itemsWithVideo = content.items.filter((item) => item.video.trim());
  const hasHeader = hasContent(content.title) || hasContent(content.description);

  if (!hasHeader && itemsWithVideo.length === 0) return null;

  const fallbackPoster = content.image || VIDEO_POSTER_FALLBACK;

  return (
    <section className="border-t border-border bg-muted/20 py-16 md:py-20">
      <div className="container max-w-6xl space-y-10 md:space-y-12">
        {hasHeader ? (
          <header className="mx-auto max-w-3xl space-y-3 text-center md:text-start">
            <ContentBlock text={content.title} asTitle />
            <ContentBlock text={content.description} />
          </header>
        ) : null}

        {itemsWithVideo.length > 0 ? (
          <AiServicesContentVideoGrid
            items={itemsWithVideo}
            fallbackPoster={fallbackPoster}
            watchLabel={t("youtubeLabel")}
          />
        ) : null}
      </div>
    </section>
  );
}
