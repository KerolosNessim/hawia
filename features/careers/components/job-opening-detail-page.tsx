"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ApplyJobModal from "@/features/careers/components/apply-job-modal";
import type { JobOpening } from "@/features/careers/types/jobs";
import { RichHtml } from "@/features/shared/components/rich-html";
import { Link } from "@/i18n/navigation";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { useLocale } from "next-intl";

type Props = {
  opening: JobOpening;
};

export default function JobOpeningDetailPage({ opening }: Props) {
  const locale = useLocale();
  const isAr = locale.startsWith("ar");
  const [applyOpen, setApplyOpen] = useState(false);
  const title = plainTextFromHtml(opening.title);

  return (
    <div className="container space-y-8 py-12 lg:pt-30 pt-20">
      <Button variant="ghost" asChild className="gap-2 rounded-full">
        <Link href="/careers">
          {isAr ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
          {isAr ? "العودة إلى الوظائف" : "Back to careers"}
        </Link>
      </Button>

      <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        {opening.media.image ? (
          <img
            src={opening.media.image}
            alt={opening.media.image_alt || title}
            className="h-56 w-full object-cover md:h-72"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-muted/30 text-brand md:h-72">
            <BriefcaseBusiness className="size-12" />
          </div>
        )}

        <div className="space-y-5 p-6 md:p-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
            {opening.job_type ? <Badge variant="secondary">{opening.job_type}</Badge> : null}
          </div>

          <RichHtml
            html={opening.description}
            className="text-base leading-relaxed text-muted-foreground"
          />

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-brand text-white hover:bg-brand/90"
              onClick={() => setApplyOpen(true)}
            >
              {isAr ? "قدّم الآن" : "Apply now"}
            </Button>

            {opening.linkedin_url ? (
              <Button
                asChild
                variant="outline"
                className="gap-2 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/10"
              >
                <a
                  href={opening.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="size-4" aria-hidden />
                  LinkedIn
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </article>

      <ApplyJobModal
        opening={opening}
        open={applyOpen}
        onOpenChange={setApplyOpen}
      />
    </div>
  );
}
