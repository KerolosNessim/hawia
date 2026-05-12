"use client";

import * as motion from 'framer-motion/client'

interface PageHeaderProps {
  title: string;
  description?: string;
  /** CMS HTML (e.g. rich subtitle). Takes precedence over plain `description` when set. */
  descriptionHtml?: string;
  image?: string;
}
export default function PageHeader({
  title,
  description,
  descriptionHtml,
  image = "/seo-banner.jpg",
}: PageHeaderProps) {
  const hasRichDescription = Boolean(descriptionHtml?.trim());

  return (
    <div
      style={{ backgroundImage: `url(${image})` }}
      className="lg:h-[60vh] md:h-[40vh] h-[30vh] bg-cover bg-center bg-no-repeat"
    >
      {/* layer */}
      <div className=" bg-black/70 h-full flex items-center justify-center">
        {/* content */}
        <div className="container ">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-brand"
          >
            {title}
          </motion.h1>
          {hasRichDescription ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-white mt-4 max-w-3xl [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: descriptionHtml!.trim() }}
            />
          ) : description ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-white mt-4"
            >
              {description}
            </motion.p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
