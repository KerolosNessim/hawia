"use client";

import Image from "next/image";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { RichHtml } from "@/features/shared/components/rich-html";

interface ClientCardProps {
  slug: string;
  title: string;
  description?: string;
  image: string;
  className?: string;
}

export default function ClientCard({
  slug,
  title,
  description,
  image,
  className,
}: ClientCardProps) {
  const href = `/clients/${encodeURIComponent(slug)}`;

  return (
    <Link
      href={href}
      className={cn(
        "group/card block h-full focus-visible:rounded-[2.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative aspect-4/5 w-full overflow-hidden rounded-[2.5rem] p-8 shadow-2xl transition-all duration-500 group-hover/card:scale-[1.02]"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[60%] w-[60%] rounded-full bg-[#ccff00] opacity-20 blur-[100px]" />
          <div className="absolute top-0 h-full w-full bg-linear-to-b from-brand to-white" />
        </div>

        <div className="relative z-10 flex h-[70%] w-full flex-col items-center justify-center">
          <motion.div
            className="relative h-full w-full"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
            />
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-30">
          <div className="rounded-3xl border border-white/10 bg-white/85 px-5 py-4 shadow-lg backdrop-blur">
            <h3 className="text-lg font-bold text-gray-900 lg:text-xl">{title}</h3>
            {description ? (
              <RichHtml
                html={description}
                className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-600"
              />
            ) : null}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-[#ccff0010] to-transparent" />
      </motion.div>
    </Link>
  );
}
