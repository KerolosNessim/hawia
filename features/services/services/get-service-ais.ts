import { apiClient } from "@/lib/api";
import type { Locale } from "next-intl";
import { pickLocalizedField } from "../lib/pick-localized-field";
import { resolveMediaUrl, isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { normalizeSingleService } from "../lib/normalize-single-service";
import type { SingleService } from "../types";

export type ServiceAi = {
  id: number;
  slug: string;
  title: string;
  description?: string;
  inside_desc?: string;
  highlight_description?: string;
  image?: string | null;
  image_alt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  slug_local?: { ar?: string; en?: string } | null;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function unwrapListRows(raw: unknown): unknown[] {
  const rec = asRecord(raw);
  if (!rec) return [];
  const data = rec.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data;
  }
  return [];
}

function pickSinglePayload(raw: unknown): Record<string, unknown> | null {
  const rec = asRecord(raw);
  if (!rec) return null;

  // direct row
  if (rec.id != null || rec.slug != null) return rec;

  // common envelope: { data: row } or nested wrappers
  const data = asRecord(rec.data);
  if (data) {
    if (data.id != null || data.slug != null) return data;
    for (const key of ["service_ai", "service", "item"] as const) {
      const nested = asRecord(data[key]);
      if (nested && (nested.id != null || nested.slug != null)) return nested;
    }
  }

  for (const key of ["service_ai", "service", "item"] as const) {
    const nested = asRecord(rec[key]);
    if (nested && (nested.id != null || nested.slug != null)) return nested;
  }

  return null;
}

function pickAiSlug(service: any, locale: string): string {
  const local = service?.slug_local;
  const key = locale.startsWith("ar") ? "ar" : "en";
  const picked =
    local && typeof local === "object"
      ? local[key] ?? local.ar ?? local.en
      : undefined;
  return String(picked ?? service?.slug ?? "").trim();
}

function pickAiTitle(service: any, locale: string): string {
  const titleField =
    service?.title ?? service?.title_local ?? service?.name ?? service?.service_title ?? "";
  const maybe = pickLocalizedField(titleField, locale);
  return maybe.trim() || String(titleField ?? "").trim();
}

function normalizeAiRow(row: Record<string, unknown>, locale: string): ServiceAi | null {
  const idRaw = row.id ?? row.service_id;
  const id =
    typeof idRaw === "number" ? idRaw : idRaw != null ? Number(idRaw) : NaN;
  if (!Number.isFinite(id) || id <= 0) return null;

  const slug = pickAiSlug(row, locale);
  if (!slug) return null;

  const title = pickAiTitle(row, locale);
  const imageRaw = typeof row.image === "string" ? row.image : row.media_url;
  const imageUrl = imageRaw ? resolveMediaUrl(String(imageRaw)) : null;

  return {
    id,
    slug,
    slug_local: row.slug_local && typeof row.slug_local === "object" ? (row.slug_local as any) : null,
    title,
    description:
      typeof row.description === "string"
        ? row.description
        : typeof row.summary === "string"
          ? row.summary
          : undefined,
    inside_desc: typeof row.inside_desc === "string" ? row.inside_desc : undefined,
    highlight_description:
      typeof row.highlight_description === "string" ? row.highlight_description : undefined,
    image: imageUrl,
    image_alt: typeof row.image_alt === "string" ? row.image_alt : null,
    meta_title: typeof row.meta_title === "string" ? row.meta_title : null,
    meta_description:
      typeof row.meta_description === "string" ? row.meta_description : null,
  };
}

export type GetServiceAisResponse = {
  status: string;
  message: string;
  data: ServiceAi[];
  meta?: unknown;
};

export async function getServiceAis(locale: Locale = "ar"): Promise<GetServiceAisResponse> {
  try {
    const raw = await apiClient.get<unknown>("/v1/service_ais");
    const rows = unwrapListRows(raw);
    const normalized = rows
      .map((r) => (asRecord(r) ? normalizeAiRow(r as Record<string, unknown>, locale) : null))
      .filter((x): x is ServiceAi => x != null);

    return {
      status: "true",
      message: "OK",
      data: normalized,
    };
  } catch {
    // Backend may fail while AI module is being deployed.
    // Keep UI stable (navbar/pages still render).
    return {
      status: "false",
      message: "AI services unavailable",
      data: [],
    };
  }
}

export async function getSingleServiceAi(
  slugParam: string,
  locale: Locale = "ar",
): Promise<{ status: "true" | "false"; data?: ServiceAi; raw?: any }> {
  const slug = decodePathSegment(String(slugParam ?? "").trim());
  if (!slug) return { status: "false" };

  try {
    const raw = await apiClient.get<unknown>(`/v1/service_ais/${encodeURIComponent(slug)}`);
    const payload = pickSinglePayload(raw);
    if (!payload) return { status: "false" };
    const normalized = normalizeAiRow(payload, locale);
    if (!normalized) return { status: "false" };

    return { status: "true", data: normalized, raw };
  } catch {
    // Fallback: resolve from list by slug / localized slug
    const list = await getServiceAis(locale).catch(() => null);
    const rows = list?.data ?? [];
    const found = rows.find((row) => {
      if (decodePathSegment(row.slug) === slug) return true;
      const local = row.slug_local;
      return (
        decodePathSegment(local?.ar ?? "") === slug ||
        decodePathSegment(local?.en ?? "") === slug
      );
    });
    return found ? { status: "true", data: found } : { status: "false" };
  }
}

export async function getSingleServiceAiAsService(
  slugParam: string,
  locale: Locale = "ar",
): Promise<{ status: "true" | "false"; data?: SingleService; raw?: any }> {
  const slug = decodePathSegment(String(slugParam ?? "").trim());
  if (!slug) return { status: "false" };

  try {
    const raw = await apiClient.get<unknown>(`/v1/service_ais/${encodeURIComponent(slug)}`);
    const payload = pickSinglePayload(raw);
    if (!payload) return { status: "false" };
    return { status: "true", data: normalizeSingleService(payload, locale), raw };
  } catch {
    return { status: "false" };
  }
}

export { isRemoteMediaUrl };

