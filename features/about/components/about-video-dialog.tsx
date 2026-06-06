"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resolveVideoEmbedSrc } from "@/lib/youtube-embed";
import { ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import * as motion from "framer-motion/client";
import { useMemo, useState } from "react";

const DEFAULT_EMBED = "https://www.youtube.com/embed/pQ4dZ-GftNM";

type Props = {
  videoUrl?: string | null;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  watchLabel: string;
};

export default function AboutVideoDialog({
  videoUrl,
  thumbnailSrc = "/video-thub.webp",
  thumbnailAlt = "video",
  watchLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  const embedSrc = useMemo(() => {
    return resolveVideoEmbedSrc(videoUrl) ?? DEFAULT_EMBED;
  }, [videoUrl]);

  const externalUrl = videoUrl?.trim() || null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 mx-auto block w-full max-w-4xl cursor-pointer lg:-mt-40"
          aria-label={watchLabel}
        >
          <Image
            src={thumbnailSrc}
            alt={thumbnailAlt}
            width={900}
            height={500}
            className="h-auto w-full rounded-lg shadow-lg object-cover"
          />
          <span className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand p-4 transition-colors hover:bg-brand/90">
            <Play className="h-10 w-10 text-white" aria-hidden />
          </span>
        </motion.button>
      </DialogTrigger>

      <DialogContent
        showCloseButton
        className="max-w-4xl gap-0 overflow-hidden border-0 p-0 sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">{watchLabel}</DialogTitle>

        {open && embedSrc ? (
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={`${embedSrc}${embedSrc.includes("?") ? "&" : "?"}autoplay=1&rel=0`}
              title={watchLabel}
              className="absolute inset-0 size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : null}

        {externalUrl ? (
          <div className="flex justify-center border-t bg-muted/30 px-4 py-3">
            <Button asChild variant="outline" size="sm" className="gap-2 border-brand text-brand">
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" aria-hidden />
                {watchLabel}
              </a>
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
