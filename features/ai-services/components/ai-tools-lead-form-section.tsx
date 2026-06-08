import AiToolsLeadForm from "@/features/ai-services/components/ai-tools-lead-form";
import { getAiToolsLeadFormCopy } from "@/features/ai-services/services/ai-tools-lead-api";
import type { AiToolsLeadFormCopy } from "@/features/ai-services/types/tools-lead-form";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

type Props = {
  locale: Locale;
  serviceId?: number;
  embedded?: boolean;
};

function mergeCopyWithFallback(
  apiCopy: AiToolsLeadFormCopy,
  fallback: AiToolsLeadFormCopy,
): AiToolsLeadFormCopy {
  return {
    title: apiCopy.title || fallback.title,
    challenge_placeholder:
      apiCopy.challenge_placeholder || fallback.challenge_placeholder,
    email_placeholder: apiCopy.email_placeholder || fallback.email_placeholder,
    consent_text: apiCopy.consent_text || fallback.consent_text,
    submit_button_text: apiCopy.submit_button_text || fallback.submit_button_text,
    ai_tools_button_text:
      apiCopy.ai_tools_button_text || fallback.ai_tools_button_text,
  };
}

export default async function AiToolsLeadFormSection({
  locale,
  serviceId,
  embedded = false,
}: Props) {
  const [apiCopy, t] = await Promise.all([
    getAiToolsLeadFormCopy(locale),
    getTranslations({ locale, namespace: "aiServicesPage.toolsLeadForm" }),
  ]);

  const fallback: AiToolsLeadFormCopy = {
    title: t("title"),
    challenge_placeholder: t("challengePlaceholder"),
    email_placeholder: t("emailPlaceholder"),
    consent_text: t("agreement"),
    submit_button_text: t("submit"),
    ai_tools_button_text: t("aiToolsButton"),
  };

  const copy = apiCopy ? mergeCopyWithFallback(apiCopy, fallback) : fallback;

  return (
    <AiToolsLeadForm
      copy={copy}
      serviceId={serviceId}
      embedded={embedded}
    />
  );
}
