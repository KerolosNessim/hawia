import AiToolsLeadFormSection from "@/features/ai-services/components/ai-tools-lead-form-section";
import ServiceArticleTags, {
  resolveServiceArticleTags,
} from "@/features/services/components/service-article-tags";
import { ServicePageSections } from "@/features/services/components/service-page-sections";
import ServicePageScript from "@/features/services/components/service-page-script";
import type { SingleService } from "@/features/services/types";
import PageHeader from "@/features/shared/components/page-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

type Props = {
  service: SingleService;
  /** When several services stack on `/ai-services`, only the first gets the top hero. */
  showHero?: boolean;
  /** Continue section tone alternation when multiple services stack on one page. */
  sectionStartIndex?: number;
  /** Place the AI tools lead form as section 2 (after the first CMS block). */
  toolsLeadFormAfterFirstSection?: boolean;
};

export default async function AiServiceDetailView({
  service,
  showHero = true,
  sectionStartIndex = 0,
  toolsLeadFormAfterFirstSection = false,
}: Props) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("singleService");
  const heroTitleHtml = service.singlePageTitle?.trim() || service.title;
  const heroTitle =
    plainTextFromHtml(heroTitleHtml).trim() || t("title");
  const heroSubtitle =
    service.subtitle?.trim() || service.description?.trim() || "";
  const heroImage = service.image || "/whySeo.webp";

  const articleTags = resolveServiceArticleTags(service);

  return (
    <div id={`ai-service-${service.id}`} className="scroll-mt-24">
      {service.pageScript ? <ServicePageScript scriptHtml={service.pageScript} /> : null}

      {showHero ? (
        <PageHeader
          titleHtml={heroTitleHtml || heroTitle}
          descriptionHtml={heroSubtitle || undefined}
          image={heroImage}
          imageAlt={service.image_alt || ""}
        />
      ) : (
        <div className="container max-w-6xl border-t border-border pt-12">
          <RichHtml
            html={service.singlePageTitle || service.title}
            className="cms-rich-html text-3xl font-bold text-brand [&_p]:mb-0"
          />
        </div>
      )}

      {service.description?.trim() && service.pageSections.length === 0 ? (
        <div className="container py-12">
          <RichHtml
            html={service.description}
            className="cms-rich-html mx-auto max-w-4xl space-y-4"
          />
        </div>
      ) : null}

      <ServicePageSections
        service={service}
        excludeKeys={["articleTags"]}
        surface="ai-services"
        startIndex={sectionStartIndex}
        insertAfterIndex={toolsLeadFormAfterFirstSection ? 0 : undefined}
        insertion={
          toolsLeadFormAfterFirstSection ? (
            <AiToolsLeadFormSection
              locale={locale}
              serviceId={service.id}
              embedded={true}
            />
          ) : undefined
        }
      />

      {articleTags.length > 0 ? (
        <div className="pb-16 pt-8">
          <ServiceArticleTags tags={articleTags} heading={t("tagsHeading")} />
        </div>
      ) : null}
    </div>
  );
}
