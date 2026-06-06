"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type { PublicClientCard } from "@/features/clients/services/clients-public-api";
import { RichHtml } from "@/features/shared/components/rich-html";
import Image from "next/image";

type Props = {
  client: PublicClientCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ClientImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const resolvedSrc = src.trim() || "/hero-bg.webp";

  return (
    <div className="relative flex w-full items-center justify-center finger-print-background bg-white px-4 py-6">
      <Image
        src={resolvedSrc}
        alt={alt}
        width={960}
        height={720}
        priority={priority}
        className="relative z-10 h-auto max-h-[min(70vh,36rem)] w-full object-contain"
        unoptimized={isRemoteMediaUrl(resolvedSrc)}
      />
    </div>
  );
}

export default function ClientDetailDialog({
  client,
  open,
  onOpenChange,
}: Props) {
  if (!client) return null;

  const extraImages = client.imageUrls.slice(1).filter((url) => url.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92vh,56rem)] max-w-4xl flex-col gap-0 overflow-hidden bg-white p-0 sm:max-w-5xl"
      >
        <DialogTitle className="sr-only">{client.title}</DialogTitle>

        <div data-lenis-prevent className="overflow-y-auto bg-white">
          <ClientImage
            src={client.imageUrl}
            alt={client.title}
            priority
          />

          <div
            data-client-detail-content
            className="relative finger-print-background bg-white"
          >
            <div className="relative z-10 space-y-6 p-6 md:p-8">
              <h2 className="text-2xl font-black text-gray-900 md:text-4xl">
                {client.title}
              </h2>

              {client.descriptionHtml ? (
                <RichHtml
                  html={client.descriptionHtml}
                  className="max-w-none text-base leading-8 text-gray-600 md:text-lg md:leading-9 [&_h1]:text-3xl [&_h1]:font-black [&_h2]:text-2xl [&_h2]:font-black [&_h3]:text-xl [&_h3]:font-bold"
                />
              ) : null}

              {extraImages.length > 0 ? (
                <div className="space-y-4">
                  {extraImages.map((image, index) => (
                    <ClientImage
                      key={image}
                      src={image}
                      alt={`${client.title} ${index + 2}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
