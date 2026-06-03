import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { apiClient } from "@/lib/api";
import { normalizeSingleService } from "../lib/normalize-single-service";
import { normalizeServiceForLocale } from "../lib/normalize-service";
import { pickServiceSlug } from "../lib/services-routes";
import type { GetSingleServiceResponse } from "../types";
import { fetchServiceShowEnvelope } from "./fetch-service-show-envelope";

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

function pickLocalizedSlugField(field: unknown, locale: string): string {
  if (field == null) return "";
  if (typeof field === "string") return field.trim();
  if (typeof field === "object" && !Array.isArray(field)) {
    const o = field as Record<string, unknown>;
    const key = locale.startsWith("ar") ? "ar" : "en";
    const primary = o[key];
    if (typeof primary === "string" && primary.trim()) return primary.trim();
    const fallback = o.en ?? o.ar;
    if (typeof fallback === "string" && fallback.trim()) return String(fallback).trim();
  }
  return "";
}

function serviceRowMatchesSlug(
  row: Record<string, unknown>,
  decoded: string,
  locale: string,
): boolean {
  if (String(row.slug ?? "").trim() === decoded) return true;
  const local = row.slug_local;
  if (local && typeof local === "object") {
    const o = local as Record<string, unknown>;
    if (o.ar === decoded || o.en === decoded) return true;
  }
  const previous = row.previous_slug ?? row.previous_slugs;
  const prev = pickLocalizedSlugField(previous, locale);
  if (prev && prev === decoded) return true;
  if (/^\d+$/.test(decoded) && String(row.id ?? "") === decoded) return true;
  return false;
}

async function fetchServiceRowFromApi(slug: string): Promise<Record<string, unknown> | null> {
  const envelopeRow = await fetchServiceShowEnvelope(slug);
  if (envelopeRow) {
    if (envelopeRow.redirect != null && envelopeRow.id == null && !envelopeRow.slug) {
      return envelopeRow;
    }
    if (envelopeRow.id != null || envelopeRow.slug) return envelopeRow;
  }

  try {
    const catalog = await apiClient.get<unknown>(
      `/v1/service-catalog/${encodeURIComponent(slug)}`,
    );
    return pickServiceShowPayload(catalog);
  } catch {
    return null;
  }
}

/** Fetches raw service row by slug (services API first, then catalog). */
export async function fetchServiceRow(slug: string): Promise<Record<string, unknown> | null> {
  return fetchServiceRowFromApi(slug);
}

export async function resolveServiceRow(
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
    const match = rows.find((r) => serviceRowMatchesSlug(r, decoded, locale));
    if (!match) return null;
    const slugsToTry = [
      decoded,
      pickServiceSlug(
        match as { slug: string; slug_local?: { ar?: string; en?: string } },
        locale,
      ),
      pickLocalizedSlugField(match.slug_local, locale),
      String(match.slug ?? ""),
      pickLocalizedSlugField(match.previous_slug, locale),
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
