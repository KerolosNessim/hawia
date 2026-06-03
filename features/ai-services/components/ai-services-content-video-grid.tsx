"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { youtubeEmbedUrl } from "@/lib/youtube-embed";
import type { ServiceAiContentItem } from "@/features/ai-services/types/service-ai-content";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { ExternalLink, Play, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

const FALLBACK_POSTER = "/blogs-banner.jfif";

type Props = {
  items: ServiceAiContentItem[];
  fallbackPoster?: string;
  watchLabel: string;
};

function itemPoster(item: ServiceAiContentItem, fallback: string): string {
  return item.previewImage?.trim() || fallback;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

function AiContentVideoCard({
  item,
  index,
  fallbackPoster,
  watchLabel,
  onPlay,
}: {
  item: ServiceAiContentItem;
  index: number;
  fallbackPoster: string;
  watchLabel: string;
  onPlay: (item: ServiceAiContentItem) => void;
}) {
  const poster = itemPoster(item, fallbackPoster);
  const videoUrl = item.video.trim();
  const canEmbed = Boolean(youtubeEmbedUrl(videoUrl));
  const label =
    item.subtitle?.trim() ||
    stripHtml(item.description) ||
    `${watchLabel} ${index + 1}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10">
      <button
        type="button"
        onClick={() => onPlay(item)}
        className="relative aspect-video w-full shrink-0 overflow-hidden bg-gray-100"
        aria-label={label}
      >
        <Image
          src={poster}
          alt={label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={isRemoteMediaUrl(poster)}
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl ring-4 ring-white/30 transition-transform duration-300 group-hover:scale-110 md:size-16">
            <Play className="size-7 fill-current ps-0.5 md:size-8" aria-hidden />
          </span>
        </span>
        {canEmbed ? (
          <span className="absolute start-3 top-3 rounded-md bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            YouTube
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        {item.subtitle ? (
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900">
            {item.subtitle}
          </h3>
        ) : null}
        {item.description && stripHtml(item.description) ? (
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {stripHtml(item.description)}
          </p>
        ) : null}

        <Button
          asChild
          size="sm"
          className="mt-auto w-full gap-2 rounded-xl bg-brand font-semibold text-white hover:bg-brand/90"
        >
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <ExternalLink className="size-4 shrink-0" aria-hidden />
            {watchLabel}
          </a>
        </Button>
      </div>
    </article>
  );
}

export default function AiServicesContentVideoGrid({
  items,
  fallbackPoster = FALLBACK_POSTER,
  watchLabel,
}: Props) {
  const [modalItem, setModalItem] = useState<ServiceAiContentItem | null>(null);
  const embedUrl = modalItem ? youtubeEmbedUrl(modalItem.video) : null;

  const handlePlay = useCallback((item: ServiceAiContentItem) => {
    const embed = youtubeEmbedUrl(item.video);
    if (embed) {
      setModalItem(item);
      return;
    }
    if (item.video.trim()) {
      window.open(item.video, "_blank", "noopener,noreferrer");
    }
  }, []);

  return (
    <>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {items.map((item, index) => (
          <li key={`${item.sort_order}-${item.video}-${index}`} className="min-h-0">
            <AiContentVideoCard
              item={item}
              index={index}
              fallbackPoster={fallbackPoster}
              watchLabel={watchLabel}
              onPlay={handlePlay}
            />
          </li>
        ))}
      </ul>

      <Dialog open={Boolean(modalItem && embedUrl)} onOpenChange={(open) => !open && setModalItem(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl gap-0 overflow-hidden border-0 p-0 sm:max-w-4xl"
        >
          <DialogTitle className="sr-only">
            {modalItem?.subtitle || watchLabel}
          </DialogTitle>
          {embedUrl ? (
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`${embedUrl}?autoplay=1&rel=0`}
                title={modalItem?.subtitle || watchLabel}
                className="absolute inset-0 size-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 border-t bg-gray-950 px-4 py-3">
            {modalItem?.subtitle ? (
              <p className="text-sm font-medium text-gray-200">{modalItem.subtitle}</p>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              {modalItem?.video ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-brand/50 text-brand hover:bg-brand/10"
                >
                  <a href={modalItem.video} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" aria-hidden />
                    {watchLabel}
                  </a>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:bg-white/10 hover:text-white"
                onClick={() => setModalItem(null)}
                aria-label="Close"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
