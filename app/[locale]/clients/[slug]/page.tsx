"use client";

import PageHeader from "@/features/shared/components/page-header";
import { useTranslations } from "next-intl";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import LightGallery to avoid SSR issues
const LightGallery = dynamic(() => import("lightgallery/react"), { ssr: false });

// import styles
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

// import plugins
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

const events = [
  { id: 1, name: "Event 1", image: "/hero-bg.webp" },
  { id: 2, name: "Event 2", image: "/hero-bg.webp" },
  { id: 3, name: "Event 3", image: "/hero-bg.webp" },
  { id: 4, name: "Event 4", image: "/hero-bg.webp" },
  { id: 5, name: "Event 5", image: "/hero-bg.webp" },
  { id: 6, name: "Event 6", image: "/hero-bg.webp" },
  { id: 7, name: "Event 7", image: "/hero-bg.webp" },
  { id: 8, name: "Event 8", image: "/hero-bg.webp" },
];

export default function SingleClientPage() {
  const t = useTranslations("clients");

  return (
    <div className="space-y-16 pb-16">
      <PageHeader
        title={t("single_client.title")}
        description={t("single_client.description")}
        image="/hero-bg.webp"
      />

      <div dir="ltr" className="container mx-auto px-4">
        <LightGallery
          speed={500}
          plugins={[lgThumbnail, lgZoom]}
          elementClassNames="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6"
          selector=".gallery-item"
        >
          {events.map((event) => (
            <a
              href={event.image}
              key={event.id}
              className="gallery-item block overflow-hidden rounded-xl group relative shadow-lg hover:shadow-xl transition-all duration-300 break-inside-avoid mb-6"
            >
              <div className="relative w-full">
                <Image
                  alt={event.name}
                  src={event.image}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
            </a>
          ))}
        </LightGallery>
      </div>
    </div>
  );
}
