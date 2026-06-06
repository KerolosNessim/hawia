import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { RichHtml } from "@/features/shared/components/rich-html";
import { cn } from "@/lib/utils";

interface WhyUsFeatureItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  imageAlt?: string;
}

export function WhyUsFeatureItem({
  title,
  description,
  icon: Icon,
  image,
  imageAlt,
}: WhyUsFeatureItemProps) {
  return (
    <li className="flex items-start gap-3 sm:gap-4">
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-white sm:size-14",
        )}
      >
        {image ? (
          <Image
            src={image}
            alt={imageAlt || title}
            width={36}
            height={36}
            className="size-7 object-contain sm:size-8"
          />
        ) : (
          <Icon className="size-6 sm:size-7" strokeWidth={1.75} />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5 text-start">
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">
          {title}
        </h3>
        <RichHtml
          html={description}
          className="text-sm leading-relaxed text-gray-300 sm:text-[0.95rem] [&_*]:!text-inherit [&_a]:!text-brand [&_p:last-child]:mb-0 [&_p]:mb-2"
        />
      </div>
    </li>
  );
}
