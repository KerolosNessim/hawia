import { useTranslations } from "next-intl";

export default function SeoTools() {
  const t = useTranslations("singleService.seoTools");
  const s = useTranslations("singleService.whyUs");
  const paidTools = t.raw("paidTools") as string[];
  const freeTools = t.raw("freeTools") as string[];
  const points = s.raw("points") as string[];
  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* tools */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-brand">{t("title")}</h2>
        <p>{t("subtitle")}</p>
        <div>
          <h3 className="text-2xl font-bold text-brand mb-3">
            {t("paidToolsTitle")}
          </h3>
          <ul className="space-y-2">
            {paidTools.map((tool, index) => (
              <li
                key={index}
                className="font-semibold flex items-baseline gap-2"
              >
                <span className="w-2 h-2 bg-brand rounded-full shrink-0"></span>
                {tool}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-brand mb-3">
            {t("freeToolsTitle")}
          </h3>
          <ul className="space-y-2">
            {freeTools.map((tool, index) => (
              <li
                key={index}
                className="font-semibold flex items-baseline gap-2"
              >
                <span className="w-2 h-2 bg-brand rounded-full shrink-0"></span>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* why choose us */}
      <div className="space-y-4 border-2 border-brand rounded-lg p-6">
        <h2 className="text-xl font-bold text-brand">{s("title")}</h2>
        <ul className="space-y-2">
          {points.map((point, index) => (
            <li key={index} className="font-semibold flex items-baseline gap-2">
              <span className="w-2 h-2 bg-brand rounded-full shrink-0"></span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
