import AiServiceCtaButtons from "@/features/ai-services/components/ai-service-cta-buttons";
import ServiceArticleTags from "@/features/services/components/service-article-tags";
import { ServicePageSections } from "@/features/services/components/service-page-sections";
import ServicePageScript from "@/features/services/components/service-page-script";
import type { SingleService } from "@/features/services/types";
import PageHeader from "@/features/shared/components/page-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { getTranslations } from "next-intl/server";

type Props = {
  service: SingleService;
  /** When several services stack on `/ai-services`, only the first gets the top hero. */
  showHero?: boolean;
  /** CTA row is shown once per page, not per stacked service. */
  showCta?: boolean;
};

export default async function AiServiceDetailView({
  service,
  showHero = true,
  showCta = true,
}: Props) {
  const t = await getTranslations("singleService");
  const heroTitle = plainTextFromHtml(service.singlePageTitle || service.title).trim() || t("title");
  const heroDescriptionHtml =
    service.subtitle?.trim() ||
    service.inside_desc ||
    service.description ||
    t("description");
  const heroImage = service.image || "/whySeo.webp";

  return (
    <div id={`ai-service-${service.id}`} className="scroll-mt-24">
      {service.pageScript ? <ServicePageScript scriptHtml={service.pageScript} /> : null}

      {showHero ? (
        <PageHeader
          titleHtml={service.singlePageTitle || service.title || heroTitle}
          descriptionAsHeader
          descriptionHtml={heroDescriptionHtml}
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

      <div className="space-y-16 py-16">
        {showCta ? <AiServiceCtaButtons /> : null}

        <ServicePageSections service={service} excludeKeys={["articleTags"]} />
      </div>

      {service.articleTags.length > 0 ? (
        <div className="space-y-16 pb-16">
          <ServiceArticleTags tags={service.articleTags} heading={t("articleTagsHeading")} />
        </div>
      ) : null}
    </div>
  );
}
