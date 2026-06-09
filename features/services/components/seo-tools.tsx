import { RichHtml } from "@/features/shared/components/rich-html";
import { cn } from "@/lib/utils";
import { sectionItemCardClassName, type SectionTone } from "../lib/section-tone";
import { Tools } from "../types";

export default function SeoTools({
  tools,
  tone = "dark",
}: {
  tools: Tools;
  tone?: SectionTone;
}) {
  const bodyTextClass =
    tone === "dark"
      ? "text-base leading-8 text-slate-200 [&_*]:!text-inherit [&_*]:!text-start [&_a]:!text-brand [&_strong]:!text-white"
      : "text-base leading-8 text-gray-600 [&_*]:!text-inherit [&_*]:!text-start [&_a]:!text-brand [&_strong]:!text-gray-900";
  const headingClass =
    tone === "dark"
      ? "text-3xl font-bold text-white [&_*]:!text-inherit [&_*]:!text-start [&_a]:!text-brand [&_strong]:!text-white"
      : "text-3xl font-bold text-gray-900 [&_*]:!text-inherit [&_*]:!text-start [&_a]:!text-brand [&_strong]:!font-bold";
  const panelClass =
    tone === "dark"
      ? "space-y-5 rounded-lg border border-brand/60 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
      : cn(sectionItemCardClassName(tone), "space-y-5");

  return (
    <div className="container grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
        {/* tools */}
        <div className="space-y-5">
          <RichHtml html={tools?.title} className={headingClass} />
          <RichHtml html={tools?.description} className={bodyTextClass} />
        </div>
        <div className={panelClass}>
          <RichHtml
            html={tools?.sub_title}
            className={cn(
              headingClass,
              "text-xl",
            )}
          />
          <RichHtml html={tools?.sub_description} className={bodyTextClass} />
        </div>
    </div>
  );
}
