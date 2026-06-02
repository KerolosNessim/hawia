"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "next-intl";
import JobsHeader from "@/features/careers/components/jobs-header";
import JobsSectionRenderer from "@/features/careers/components/jobs-section-renderer";
import JobOpeningsGrid from "@/features/careers/components/job-openings-grid";
import { useJobsHeader } from "@/features/careers/hooks/useJobsHeader";
import { useJobsSections } from "@/features/careers/hooks/useJobsSections";
import { useJobOpenings } from "@/features/careers/hooks/useJobOpenings";

function SectionCardsSkeleton() {
  return (
    <div className="container py-12">
      <Skeleton className="mx-auto mb-8 h-10 w-60" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border p-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="mt-4 h-6 w-3/4" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CareersPage() {
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  const headerQuery = useJobsHeader();
  const sectionsQuery = useJobsSections();
  const openingsQuery = useJobOpenings();

  const hasSectionsError = sectionsQuery.isError;
  const hasOpeningsError = openingsQuery.isError;

  return (
    <div className="pb-16">
      <JobsHeader header={headerQuery.data ?? null} />

      {sectionsQuery.isLoading ? <SectionCardsSkeleton /> : null}
      {hasSectionsError ? (
        <LoadErrorState
          title={isAr ? "تعذر تحميل الأقسام" : "Failed to load sections"}
          onRetry={() => void sectionsQuery.refetch()}
        />
      ) : null}
      {!sectionsQuery.isLoading && !hasSectionsError ? (
        <JobsSectionRenderer sections={sectionsQuery.data ?? []} />
      ) : null}

      {openingsQuery.isLoading ? <SectionCardsSkeleton /> : null}
      {hasOpeningsError ? (
        <LoadErrorState
          title={isAr ? "تعذر تحميل الشواغر" : "Failed to load openings"}
          onRetry={() => void openingsQuery.refetch()}
        />
      ) : null}
      {!openingsQuery.isLoading && !hasOpeningsError ? (
        <JobOpeningsGrid openings={openingsQuery.data ?? []} />
      ) : null}
    </div>
  );
}

function LoadErrorState({
  title,
  onRetry,
}: {
  title: string;
  onRetry: () => void;
}) {
  return (
    <div className="container py-12">
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="font-semibold text-foreground">{title}</p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}

