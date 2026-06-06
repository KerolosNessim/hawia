import { RichHtml } from "@/features/shared/components/rich-html";
import type { SectionTone } from "../lib/section-tone";
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
      ? "text-base leading-8 text-slate-200 [&_*]:!text-inherit [&_a]:!text-brand [&_strong]:!text-white"
      : "text-base leading-8 text-gray-600 [&_*]:!text-inherit [&_a]:!text-brand [&_strong]:!text-gray-900";
  const panelClass =
    tone === "dark"
      ? "space-y-5 rounded-lg border border-brand/60 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
      : "space-y-5 rounded-lg border border-brand/40 bg-brand/5 p-6 shadow-sm";

  return (
    <div className="container grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
        {/* tools */}
        <div className="space-y-5">
          <RichHtml
            html={tools?.title}
            className="text-3xl font-bold text-brand [&_*]:!text-inherit [&_h1]:!text-brand [&_h2]:!text-brand [&_h2]:text-3xl [&_p]:mb-0 [&_strong]:font-bold"
          />
          <RichHtml html={tools?.description} className={bodyTextClass} />
        </div>
        <div className={panelClass}>
          <RichHtml
            html={tools?.sub_title}
            className="text-xl font-bold text-brand [&_*]:!text-inherit [&_h2]:!text-brand [&_h3]:!text-brand [&_p]:mb-0 [&_strong]:font-bold"
          />
          <RichHtml html={tools?.sub_description} className={bodyTextClass} />
        </div>
    </div>
  );
}
