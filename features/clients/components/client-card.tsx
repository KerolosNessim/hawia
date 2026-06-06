"use client";

import Image from "next/image";
import * as motion from "framer-motion/client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RichHtml } from "@/features/shared/components/rich-html";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type { PublicClientCard } from "@/features/clients/services/clients-public-api";

const FALLBACK_IMAGE = "/hero-bg.webp";

function resolveClientImageUrl(imageUrl: string | null | undefined): string {
  const trimmed = imageUrl?.trim();
  return trimmed || FALLBACK_IMAGE;
}

interface ClientCardProps {
  client: PublicClientCard;
  onOpen: (client: PublicClientCard) => void;
  className?: string;
}

export default function ClientCard({
  client,
  onOpen,
  className,
}: ClientCardProps) {
  const { title, descriptionPlain } = client;
  const imageSrc = resolveClientImageUrl(client.imageUrl);

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(client)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(client);
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "group/card block h-full cursor-pointer focus-visible:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        className,
      )}
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 transition-all duration-300 group-hover/card:border-brand/40 group-hover/card:shadow-xl">
        <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden border-b border-gray-100 bg-linear-to-b from-brand/10 to-muted/20 p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-3/5 w-3/5 rounded-full bg-brand/15 blur-3xl" />
          </div>
          <Image
            src={imageSrc}
            alt={title}
            width={1200}
            height={900}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 440px"
            className="relative z-10 h-full w-full object-contain object-center drop-shadow-md transition-transform duration-300 group-hover/card:scale-[1.02]"
            unoptimized={isRemoteMediaUrl(imageSrc)}
          />
        </div>

        <CardContent className="flex flex-1 flex-col justify-center p-5 sm:p-6">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover/card:text-brand lg:text-xl">
            {title}
          </h3>
          {descriptionPlain ? (
            <RichHtml
              html={descriptionPlain}
              className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600"
            />
          ) : null}
        </CardContent>
      </Card>
    </motion.article>
  );
}
