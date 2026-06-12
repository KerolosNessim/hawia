"use client";

import { RichHtml } from "@/features/shared/components/rich-html";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";

type Props = {
  html: string;
  className?: string;
};

export default function ServiceHighlightDescription({ html, className }: Props) {
  if (!html.trim()) return null;

  return (
    <section
      data-service-highlight
      className={cn(
        "finger-print-background bg-white py-12 md:py-16",
        className,
      )}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <RichHtml
            html={html}
            className={cn(
              "mx-auto w-full rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center text-base font-medium leading-loose text-gray-700 shadow-sm sm:px-10 sm:py-10 sm:text-lg",
              "[&_*]:!text-inherit [&_a]:text-brand [&_p]:mb-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold",
            )}
          />
        </motion.div>
      </div>
    </section>
  );
}
