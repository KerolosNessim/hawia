"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CareerCardImage } from "@/features/careers/components/career-card-image";
import { cn } from "@/lib/utils";
import { RichHtml } from "@/features/shared/components/rich-html";
import type { JobSection } from "@/features/careers/types/jobs";

type Props = {
  sections: JobSection[];
};

export default function JobsSectionRenderer({ sections }: Props) {
  if (!sections.length) return null;

  return (
    <>
      {sections.map((section) => {
        const isCulture = section.section_type === "culture";
        const isBenefits = section.section_type === "benefits";

        return (
          <section
            key={section.id}
            className={cn(
              "py-12",
              isBenefits ? "bg-muted/30" : "bg-transparent"
            )}
          >
            <div className="container space-y-7">
              <h2 className="text-center text-3xl font-bold text-foreground">{section.name}</h2>

              <div
                className={cn(
                  "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3",
                  !isCulture && !isBenefits && "gap-4"
                )}
              >
                {section.items.map((item, index) => {
                  const image = item.image || item.images?.ar || item.images?.en || null;
                  const alt = item.image_alt || item.title || `Section item ${index + 1}`;
                  return (
                    <Card
                      key={`${section.id}-${index}-${item.title}`}
                      className={cn(
                        "gap-0 overflow-hidden border-border/70 py-0",
                        isBenefits
                          ? "shadow-md transition hover:shadow-lg"
                          : "shadow-sm"
                      )}
                    >
                      {image ? (
                        <CareerCardImage src={image} alt={alt} />
                      ) : null}
                      <CardContent className="space-y-2 p-5">
                        <h3 className="text-lg font-bold text-foreground">
                          <RichHtml html={item.title} as="span" className="[&_p]:mb-0" />
                        </h3>
                        {item.description ? (
                          <RichHtml
                            html={item.description}
                            className="text-sm leading-relaxed text-muted-foreground"
                          />
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}

