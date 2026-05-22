import { RichHtml } from "@/features/shared/components/rich-html";
import { Tools } from "../types";

export default function SeoTools({ tools }: { tools: Tools }) {

  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* tools */}
      <div className="space-y-4">
        <RichHtml
          html={tools?.title}
          className="text-3xl font-bold text-brand [&_p]:mb-0 [&_h2]:text-3xl [&_strong]:font-bold"
        />
        <RichHtml html={tools?.description} />
      </div>
      {/* why choose us */}
      <div className="space-y-4 border-2 border-brand rounded-lg p-6">
        <RichHtml
          html={tools?.sub_title}
          className="text-xl font-bold text-brand [&_p]:mb-0 [&_strong]:font-bold"
        />
        <RichHtml html={tools?.sub_description} />
      </div>
    </div>
  );
}
