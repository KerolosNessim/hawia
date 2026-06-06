"use client";

import { useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "next-intl";
import ApplyJobModal from "@/features/careers/components/apply-job-modal";
import { jobOpeningPath } from "@/features/careers/lib/job-slug";
import type { JobOpening } from "@/features/careers/types/jobs";
import { Link } from "@/i18n/navigation";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";

type Props = {
  openings: JobOpening[];
};

export default function JobOpeningsGrid({ openings }: Props) {
  const locale = useLocale();
  const isAr = locale.startsWith("ar");
  const [applyOpening, setApplyOpening] = useState<JobOpening | null>(null);

  if (!openings.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        {isAr ? "لا توجد شواغر متاحة حالياً." : "No openings available right now."}
      </div>
    );
  }

  return (
    <>
      <section className="container space-y-7 py-12">
        <h2 className="text-center text-3xl font-bold text-foreground">
          {isAr ? "الشواغر المتاحة" : "Open Positions"}
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {openings.map((opening) => {
            const title = plainTextFromHtml(opening.title);
            const detailHref = jobOpeningPath(opening.slug);

            return (
              <Card
                key={opening.id}
                className="relative overflow-hidden border-border/70 shadow-sm transition hover:shadow-md"
              >
                <Link
                  href={detailHref}
                  className="absolute inset-0 z-[1] rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  aria-label={title}
                />
                {opening.media.image ? (
                  <img
                    src={opening.media.image}
                    alt={opening.media.image_alt || title}
                    className="relative z-0 h-44 w-full object-cover"
                  />
                ) : (
                  <div className="relative z-0 flex h-44 items-center justify-center bg-muted/30 text-brand">
                    <BriefcaseBusiness className="size-10" />
                  </div>
                )}
                <CardContent className="relative z-[2] space-y-3 p-5">
                  <div className="pointer-events-none space-y-2">
                    <h3 className="line-clamp-2 text-xl font-bold text-foreground">{title}</h3>
                    {opening.job_type ? (
                      <Badge variant="secondary">{opening.job_type}</Badge>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="pointer-events-none relative z-[2] w-full border-brand text-brand"
                      tabIndex={-1}
                      aria-hidden
                    >
                      {isAr ? "عرض التفاصيل" : "View details"}
                    </Button>
                    <Button
                      type="button"
                      className="relative z-[3] w-full bg-brand text-white hover:bg-brand/90"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setApplyOpening(opening);
                      }}
                    >
                      {isAr ? "قدّم الآن" : "Apply now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <ApplyJobModal
        opening={applyOpening}
        open={Boolean(applyOpening)}
        onOpenChange={(open) => {
          if (!open) setApplyOpening(null);
        }}
      />
    </>
  );
}
