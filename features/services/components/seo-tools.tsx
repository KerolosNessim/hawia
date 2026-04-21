import { Tools } from "../types";

export default function SeoTools({ tools }: { tools: Tools }) {

  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* tools */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-brand">
          {tools?.title }
        </h2>
        <div dangerouslySetInnerHTML={{ __html: tools?.description || '' }}></div>

      </div>
      {/* why choose us */}
      <div className="space-y-4 border-2 border-brand rounded-lg p-6">
        <h2 className="text-xl font-bold text-brand">{tools?.sub_title}</h2>
        <div dangerouslySetInnerHTML={{ __html: tools?.sub_description || '' }}></div>
      </div>
    </div>
  );
}
