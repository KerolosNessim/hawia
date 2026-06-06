"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { RichHtml } from "@/features/shared/components/rich-html";
import { Link } from "@/i18n/navigation";

type Props = {
  href: string;
  title: string;
  description?: string;
  priceLabel: string;
  imageSrc: string;
};

export function CourseCard({ href, title, description, priceLabel, imageSrc }: Props) {
  return (
    <Link href={href} className="block h-full transition-transform duration-300 hover:scale-[1.02]">
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl border bg-white p-0 shadow-md">
        <div className="relative">
          <Image
            src={imageSrc}
            alt={title}
            width={600}
            height={300}
            className="h-[220px] w-full object-cover"
            unoptimized={imageSrc.startsWith("http") || imageSrc.startsWith("https")}
          />
        </div>
        <CardContent className="flex-1 flex flex-col space-y-3 py-6 text-center">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {description?.trim() ? (
            <RichHtml
              html={description}
              className="line-clamp-2 min-h-[3rem] text-sm leading-relaxed text-gray-500 [&_p+_p]:mt-1"
            />
          ) : null}
        </CardContent>
        <CardFooter className="mt-auto flex items-center justify-between px-6 pb-6">
          <span className="flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white">
            <ShoppingCart size={18} />
          </span>
          <span className="text-xl font-bold">{priceLabel}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
