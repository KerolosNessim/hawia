"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Props = {
  href: string;
  title: string;
  priceLabel: string;
  imageSrc: string;
};

export function CourseCard({ href, title, priceLabel, imageSrc }: Props) {
  return (
    <Link href={href} className="block transition-transform duration-300 hover:scale-[1.02]">
      <Card className="h-full overflow-hidden rounded-2xl border bg-white p-0 shadow-md">
        <div className="relative">
          <Image
            src={imageSrc}
            alt={title}
            width={600}
            height={300}
            className="h-[220px] w-full object-cover"
            unoptimized={imageSrc.startsWith("http")}
          />
        </div>
        <CardContent className="py-6 text-center">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </CardContent>
        <CardFooter className="flex items-center justify-between px-6 pb-6">
          <span className="flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white">
            <ShoppingCart size={18} />
          </span>
          <span className="text-xl font-bold">{priceLabel}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
