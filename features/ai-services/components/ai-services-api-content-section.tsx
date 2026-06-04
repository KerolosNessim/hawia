import AiServicesContentVideoGrid from "@/features/ai-services/components/ai-services-content-video-grid";
import { getServiceAiContent } from "@/features/ai-services/services/get-service-ai-content";
import { RichHtml } from "@/features/shared/components/rich-html";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { SectionTone } from "@/features/services/lib/section-tone";
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
  tone = "light",
}: {
  text: string;
  asTitle?: boolean;
  tone?: SectionTone;
}) {
  if (!hasContent(text)) return null;

  if (isHtmlString(text)) {
    return (
      <RichHtml
        html={text}
        className={cn(
          "cms-rich-html",
          asTitle
            ? cn(
                "text-2xl font-bold md:text-3xl [&_p]:mb-0",
                tone === "dark" ? "text-white" : "text-gray-900",
              )
            : cn(
                "text-base leading-relaxed",
                tone === "dark" ? "text-gray-300" : "text-muted-foreground",
              ),
        )}
      />
    );
  }

  if (asTitle) {
    return (
      <h2
        className={cn(
          "text-2xl font-bold md:text-3xl",
          tone === "dark" ? "text-white" : "text-gray-900",
        )}
      >
        {text}
      </h2>
    );
  }

  return (
    <p
      className={cn(
        "text-base leading-relaxed",
        tone === "dark" ? "text-gray-300" : "text-muted-foreground",
      )}
    >
      {text}
    </p>
  );
}

export default async function AiServicesApiContentSection({
  embedded = false,
  tone = "light",
}: {
  /** When true, outer tone shell is provided by the parent (e.g. `/ai-services`). */
  embedded?: boolean;
  tone?: SectionTone;
}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("aiServicesContentPage");
  const apiContent = await getServiceAiContent(locale);

  if (!apiContent?.is_active) return null;

  const itemsWithVideo = apiContent.items.filter((item) => item.video.trim());
  const hasHeader =
    hasContent(apiContent.title) || hasContent(apiContent.description);

  if (!hasHeader && itemsWithVideo.length === 0) return null;

  const fallbackPoster = apiContent.image || VIDEO_POSTER_FALLBACK;

  const sectionBody = (
    <div className="container max-w-6xl space-y-10 md:space-y-12">
      {hasHeader ? (
        <header className="mx-auto max-w-3xl space-y-3 text-center md:text-start">
          <ContentBlock text={apiContent.title} asTitle tone={tone} />
          <ContentBlock text={apiContent.description} tone={tone} />
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
  );

  if (embedded) return sectionBody;

  return (
    <section className="border-t border-border bg-muted/20 py-16 md:py-20">
      {sectionBody}
    </section>
  );
}
