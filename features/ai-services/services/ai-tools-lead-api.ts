import { pickLocalizedField } from "@/features/services/lib/pick-localized-field";
import type {
  AiToolsLeadFormCopy,
  AiToolsLeadSubmitPayload,
} from "@/features/ai-services/types/tools-lead-form";
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
  "title",
  "challenge_placeholder",
  "email_placeholder",
  "consent_text",
  "submit_button_text",
  "ai_tools_button_text",
] as const;

/**
 * Parses `GET /v1/service_ais/tools-lead-form`:
 * `{ status, message, data: { title, challenge_placeholder, ... } }`
 */
function normalizeAiToolsLeadFormCopy(
  payload: unknown,
  locale: string,
): AiToolsLeadFormCopy | null {
  const root = asRecord(payload);
  if (!root) return null;

  const row = asRecord(root.data) ?? root;
  const pick = (key: string) => pickLocalizedField(row[key], locale) || asText(row[key]);
  const title =
    pick("title") ||
    pick("heading") ||
    pickLocalizedField(row.heading, locale) ||
    asText(row.heading);

  const copy: AiToolsLeadFormCopy = {
    title,
    challenge_placeholder: pick("challenge_placeholder"),
    email_placeholder: pick("email_placeholder"),
    consent_text: pick("consent_text") || pick("agreement_text"),
    submit_button_text: pick("submit_button_text"),
    ai_tools_button_text: pick("ai_tools_button_text") || pick("ai_tools_button"),
  };

  return isCompleteAiToolsLeadFormCopy(copy) ? copy : null;
}

export function isCompleteAiToolsLeadFormCopy(
  copy: AiToolsLeadFormCopy | null | undefined,
): copy is AiToolsLeadFormCopy {
  if (!copy) return false;
  return COPY_KEYS.every((key) => copy[key].trim().length > 0);
}

/** Dynamic form labels from `GET /v1/service_ais/tools-lead-form`. */
export async function getAiToolsLeadFormCopy(
  locale: string,
): Promise<AiToolsLeadFormCopy | null> {
  try {
    const lang = openingsLocale(locale);
    const body = await apiClient.get<unknown>("/v1/service_ais/tools-lead-form", {
      headers: { "Accept-Language": lang },
    });
    return normalizeAiToolsLeadFormCopy(body, locale);
  } catch {
    return null;
  }
}

/** `POST /v1/service-ai-tool-submissions` */
export async function submitAiToolsLead(
  payload: AiToolsLeadSubmitPayload,
  locale?: string,
): Promise<string> {
  const lang = openingsLocale(locale ?? "ar");
  const response = await apiClient.post<{ message?: string }>(
    "/v1/service-ai-tool-submissions",
    payload,
    { headers: { "Accept-Language": lang } },
  );
  return asText(response?.message) || "OK";
}

export { ApiError as AiToolsLeadApiError };
