import SeoCheckForm from "@/features/services/components/seo-check-form";
import {
  getApplicationSeoSettings,
  isServiceInApplicationSeoScope,
} from "@/features/services/services/application-seo-api";
import type { Locale } from "next-intl";

type Props = {
  serviceId: number;
  locale: Locale;
  /** From `GET /v1/services/{slug}` → `application_seo`. */
  applicationSeo: boolean;
  /** When nested inside `ServicePageSections` as section 2. */
  embedded?: boolean;
};

/**
 * Shows the SEO form when:
 * 1. Service has `application_seo: true`
 * 2. Service `id` is listed in `data.service_ids` from `GET /v1/application-seo`
 * 3. All form copy fields in `data` are non-null / non-empty for the active locale
 */
export default async function ServiceApplicationSeoSection({
  serviceId,
  locale,
  applicationSeo,
  embedded = false,
}: Props) {
  if (!applicationSeo) return null;

  const settings = await getApplicationSeoSettings(locale);
  if (!settings || !isServiceInApplicationSeoScope(serviceId, settings.serviceIds)) {
    return null;
  }

  return (
    <SeoCheckForm serviceId={serviceId} copy={settings.copy} embedded={embedded} />
  );
}
