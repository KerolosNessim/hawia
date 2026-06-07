import { pickLocalizedField } from "@/features/services/lib/pick-localized-field";
import type {
  ApplicationSeoFormCopy,
  ApplicationSeoConfig,
  ApplicationSeoSubmitPayload,
} from "@/features/services/types/application-seo";
import { apiClient, ApiError } from "@/lib/api";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function asText(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function openingsLocale(locale: string): "ar" | "en" {
  return locale.startsWith("ar") ? "ar" : "en";
}

function parseServiceIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((id) => (typeof id === "number" ? id : Number(id)))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function normalizeApplicationSeoConfig(
  payload: unknown,
  locale: string,
): ApplicationSeoConfig | null {
  const root = asRecord(payload);
  if (!root) return null;

  const row = asRecord(root.data);
  if (!row) return null;

  const pick = (key: string) =>
    pickLocalizedField(row[key], locale) || asText(row[key]);

  return {
    copy: {
      heading: pick("heading"),
      website_placeholder: pick("website_placeholder"),
      email_placeholder: pick("email_placeholder"),
      consent_text: pick("consent_text"),
      submit_button_text: pick("submit_button_text"),
    },
    serviceIds: parseServiceIds(row.service_ids ?? row.serviceIds),
  };
}

export function isServiceInApplicationSeoScope(
  serviceId: number,
  serviceIds: number[],
): boolean {
  if (!serviceIds.length) return true;
  return serviceIds.includes(serviceId);
}

export async function getApplicationSeoConfig(
  locale: string,
): Promise<ApplicationSeoConfig | null> {
  try {
    const lang = openingsLocale(locale);
    const body = await apiClient.get<unknown>("/v1/application-seo", {
      headers: { "Accept-Language": lang },
    });
    return normalizeApplicationSeoConfig(body, locale);
  } catch {
    return null;
  }
}

/** @deprecated Use {@link getApplicationSeoConfig} */
export async function getApplicationSeoFormCopy(
  locale: string,
): Promise<ApplicationSeoFormCopy | null> {
  const config = await getApplicationSeoConfig(locale);
  return config?.copy ?? null;
}

export async function submitApplicationSeo(
  payload: ApplicationSeoSubmitPayload,
): Promise<string> {
  const body = await apiClient.post<{ message?: string }>("/v1/application-seo/submit", payload);
  return asText(body?.message) || "OK";
}

export { ApiError as ApplicationSeoApiError };
