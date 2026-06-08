import { pickLocalizedField } from "@/features/services/lib/pick-localized-field";
import type {
  ApplicationSeoFormCopy,
  ApplicationSeoSettings,
  ApplicationSeoSubmitPayload,
} from "@/features/services/types/application-seo";
import { apiClient, ApiError } from "@/lib/api";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function asText(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v.trim() : "";
}

function openingsLocale(locale: string): "ar" | "en" {
  return locale.startsWith("ar") ? "ar" : "en";
}

const COPY_KEYS = [
  "heading",
  "website_placeholder",
  "email_placeholder",
  "consent_text",
  "submit_button_text",
] as const;

function parseServiceIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((id) => (typeof id === "number" ? id : Number(id)))
    .filter((id) => Number.isFinite(id) && id > 0);
}

/**
 * Parses `GET /v1/application-seo`:
 * `{ status, message, data: { heading, ..., service_ids: [39] } }`
 */
function normalizeApplicationSeoSettings(
  payload: unknown,
  locale: string,
): ApplicationSeoSettings | null {
  const root = asRecord(payload);
  if (!root) return null;

  const row = asRecord(root.data);
  if (!row) return null;

  const pick = (key: (typeof COPY_KEYS)[number]) =>
    pickLocalizedField(row[key], locale) || asText(row[key]);

  const copy: ApplicationSeoFormCopy = {
    heading: pick("heading"),
    website_placeholder: pick("website_placeholder"),
    email_placeholder: pick("email_placeholder"),
    consent_text: pick("consent_text"),
    submit_button_text: pick("submit_button_text"),
  };

  if (!isCompleteApplicationSeoCopy(copy)) return null;

  return {
    copy,
    serviceIds: parseServiceIds(row.service_ids ?? row.serviceIds),
  };
}

export function isCompleteApplicationSeoCopy(
  copy: ApplicationSeoFormCopy | null | undefined,
): copy is ApplicationSeoFormCopy {
  if (!copy) return false;
  return COPY_KEYS.every((key) => copy[key].trim().length > 0);
}

/** When `service_ids` is empty, any service with `application_seo: true` may show the form. */
export function isServiceInApplicationSeoScope(
  serviceId: number,
  serviceIds: number[],
): boolean {
  if (!serviceIds.length) return true;
  return serviceIds.includes(serviceId);
}

/** Whether the SEO audit form should render for this service. */
export async function shouldShowApplicationSeoForm(
  serviceId: number,
  locale: string,
  applicationSeo: boolean,
): Promise<boolean> {
  if (!applicationSeo) return false;
  const settings = await getApplicationSeoSettings(locale);
  return !!(settings && isServiceInApplicationSeoScope(serviceId, settings.serviceIds));
}

/** Settings + copy from `GET /v1/application-seo`. */
export async function getApplicationSeoSettings(
  locale: string,
): Promise<ApplicationSeoSettings | null> {
  try {
    const lang = openingsLocale(locale);
    const body = await apiClient.get<unknown>("/v1/application-seo", {
      headers: { "Accept-Language": lang },
    });
    return normalizeApplicationSeoSettings(body, locale);
  } catch {
    return null;
  }
}

export async function submitApplicationSeo(
  payload: ApplicationSeoSubmitPayload,
): Promise<string> {
  const body = await apiClient.post<{ message?: string }>("/v1/application-seo/submit", payload);
  return asText(body?.message) || "OK";
}

export { ApiError as ApplicationSeoApiError };
