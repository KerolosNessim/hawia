import {
  DEFAULT_INLINE_IMG_HEIGHT,
  DEFAULT_INLINE_IMG_WIDTH,
} from "@/lib/inline-image-alt";
import { RichHtml } from "@/features/shared/components/rich-html";
import { SiteBreadcrumbBar } from "@/features/shared/components/site-breadcrumb";
import { LegalPageData } from "../types";

export function LegalPageContent({ data }: { data: LegalPageData }) {
  return (
    <>
      <SiteBreadcrumbBar />
      <div className="container mx-auto min-h-[60vh] px-4 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        {data.image && (
          <div className="mb-12 w-full h-[300px] md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <img
              src={data.image}
              alt={data.meta_title}
              width={DEFAULT_INLINE_IMG_WIDTH}
              height={DEFAULT_INLINE_IMG_HEIGHT}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <h1 className="absolute bottom-10 left-10 right-10 text-4xl md:text-5xl font-bold text-white">
              {data.meta_title}
            </h1>
          </div>
        )}
        
        {!data.image && (
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-primary">
            {data.meta_title}
          </h1>
        )}

        <RichHtml
          html={data.description}
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary hover:prose-a:underline"
        />
      </div>
      </div>
    </>
  );
}
