import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { apiClient } from "@/lib/api";
import { normalizeSingleService } from "../lib/normalize-single-service";
import { normalizeServiceForLocale } from "../lib/normalize-service";
import { pickServiceSlug } from "../lib/services-routes";
import type { GetSingleServiceResponse } from "../types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pickServiceShowPayload(payload: unknown): Record<string, unknown> | null {
  const rec = asRecord(payload);
  if (!rec) return null;
  const data = asRecord(rec.data);
  const redirect = asRecord(data?.redirect) ?? asRecord(rec.redirect);
  if (redirect) {
    const status = Number(redirect.status ?? redirect.code ?? 0);
    if (Number.isFinite(status) && status > 0) return data ?? { redirect };
  }
  if (data && !Array.isArray(data)) return data;
  if (rec.id != null || rec.slug) return rec;
  return null;
}

export async function fetchServiceRow(slug: string): Promise<Record<string, unknown> | null> {
  try {
    const catalog = await apiClient.get<unknown>(
      `/v1/service-catalog/${encodeURIComponent(slug)}`,
    );
    const row = pickServiceShowPayload(catalog);
    if (row) return row;
  } catch {
    /* try legacy services API */
  }

  try {
    const body = await apiClient.get<unknown>(`/v1/services/${encodeURIComponent(slug)}`);
    return pickServiceShowPayload(body);
  } catch {
    return null;
  }
}

async function resolveServiceRow(
  slug: string,
  locale: string,
): Promise<Record<string, unknown> | null> {
  const decoded = decodePathSegment(slug);
  let row = await fetchServiceRow(decoded);
  if (row) return row;

  try {
    let list: unknown = null;
    try {
      list = await apiClient.get<unknown>("/v1/service-catalog");
    } catch {
      list = await apiClient.get<unknown>("/v1/services");
    }
    const rows: Record<string, unknown>[] = [];
    if (list && typeof list === "object") {
      const p = list as Record<string, unknown>;
      const inner = p.data;
      if (Array.isArray(inner)) rows.push(...(inner as Record<string, unknown>[]));
      else if (inner && typeof inner === "object") {
        const nested = (inner as Record<string, unknown>).data;
        if (Array.isArray(nested)) rows.push(...(nested as Record<string, unknown>[]));
      }
    }
    const match = rows.find((r) => {
      if (String(r.slug) === decoded) return true;
      const local = r.slug_local;
      if (local && typeof local === "object") {
        const o = local as Record<string, unknown>;
        return o.ar === decoded || o.en === decoded;
      }
      return false;
    });
    if (!match) return null;
    const slugsToTry = [
      decoded,
      pickServiceSlug(
        match as { slug: string; slug_local?: { ar?: string; en?: string } },
        locale,
      ),
      String(match.slug ?? ""),
    ].filter((s, i, arr) => s && arr.indexOf(s) === i);
    for (const trySlug of slugsToTry) {
      const full = await fetchServiceRow(trySlug);
      if (full) return full;
    }
    return normalizeServiceForLocale(match, locale) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Fetches a service by slug (or localized slug) and normalizes the API payload.
 */
export async function getSingleService(
  slug: string,
  locale = "ar",
): Promise<GetSingleServiceResponse | null> {
  const row = await resolveServiceRow(slug, locale);
  if (!row) return null;
  return {
    status: "true",
    message: "OK",
    data: normalizeSingleService(row, locale),
  };
}
