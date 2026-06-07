import SeoCheckForm from "@/features/services/components/seo-check-form";
import {
  getApplicationSeoConfig,
  isServiceInApplicationSeoScope,
} from "@/features/services/services/application-seo-api";
import type { ApplicationSeoFormCopy } from "@/features/services/types/application-seo";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

type Props = {
  serviceId: number;
  locale: Locale;
  enabled: boolean;
};

function mergeCopyWithFallback(
  apiCopy: ApplicationSeoFormCopy,
  fallback: ApplicationSeoFormCopy,
): ApplicationSeoFormCopy {
  return {
    heading: apiCopy.heading || fallback.heading,
    website_placeholder: apiCopy.website_placeholder || fallback.website_placeholder,
    email_placeholder: apiCopy.email_placeholder || fallback.email_placeholder,
    consent_text: apiCopy.consent_text || fallback.consent_text,
    submit_button_text: apiCopy.submit_button_text || fallback.submit_button_text,
  };
}

export default async function ServiceApplicationSeoSection({
  serviceId,
  locale,
  enabled,
}: Props) {
  if (!enabled) return null;

  const [config, t] = await Promise.all([
    getApplicationSeoConfig(locale),
    getTranslations({ locale, namespace: "singleService.seoCheckForm" }),
  ]);

  if (!config || !isServiceInApplicationSeoScope(serviceId, config.serviceIds)) {
    return null;
  }

  const copy = mergeCopyWithFallback(config.copy, {
    heading: t("title"),
    website_placeholder: t("websitePlaceholder"),
    email_placeholder: t("emailPlaceholder"),
    consent_text: t("agreement"),
    submit_button_text: t("submit"),
  });

  return <SeoCheckForm serviceId={serviceId} copy={copy} />;
}
