"use client";

import PageHeader from "@/features/shared/components/page-header";
import type { JobHeader } from "@/features/careers/types/jobs";

type Props = {
  header: JobHeader | null;
};

export default function JobsHeader({ header }: Props) {
  if (!header) {
    return (
      <div className="border-b bg-muted/20">
        <div className="container py-12">
          <h1 className="text-3xl font-bold">Careers</h1>
          <p className="mt-2 text-muted-foreground">Explore our latest opportunities.</p>
        </div>
      </div>
    );
  }

  return (
    <PageHeader
      image={header.media.image || "/seo-banner.jpg"}
      imageAlt={header.media.image_alt || "Careers page banner"}
      titleHtml={header.content.title}
      descriptionHtml={header.content.description}
    />
  );
}

