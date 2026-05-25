import { apiClient } from "@/lib/api";
import type { GetServicesApiRaw } from "../types";

function acceptLanguage(locale: string): "ar" | "en" {
  return locale.toLowerCase().startsWith("en") ? "en" : "ar";
}

function unwrapListRows(body: unknown): Record<string, unknown>[] {
  if (!body || typeof body !== "object") return [];
  const p = body as Record<string, unknown>;
  const inner = p.data;
  if (Array.isArray(inner)) return inner as Record<string, unknown>[];
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const nested = (inner as Record<string, unknown>).data;
    if (Array.isArray(nested)) return nested as Record<string, unknown>[];
  }
  return [];
}

/** GET /v1/service-catalog — new simplified Service resource (falls back to null if not deployed). */
export async function fetchServiceCatalogRaw(
  lang: "ar" | "en",
  query?: Record<string, string>,
): Promise<GetServicesApiRaw | null> {
  try {
    return await apiClient.get<GetServicesApiRaw>("/v1/service-catalog", {
      headers: { "Accept-Language": lang },
      query: query && Object.keys(query).length > 0 ? query : undefined,
    });
  } catch {
    return null;
  }
}

export async function fetchServiceCatalogListMerged(
  locale = "ar",
  query?: Record<string, string>,
): Promise<{
  raw: GetServicesApiRaw;
  rows: Record<string, unknown>[];
} | null> {
  const active = acceptLanguage(locale);
  const other = active === "en" ? "ar" : "en";

  const [rawActive, rawOther] = await Promise.all([
    fetchServiceCatalogRaw(active, query),
    fetchServiceCatalogRaw(other, query),
  ]);

  if (!rawActive) return null;

  const activeRows = unwrapListRows(rawActive);
  const otherRows = rawOther ? unwrapListRows(rawOther) : [];

  const otherById = new Map<number, Record<string, unknown>>();
  for (const row of otherRows) {
    const id = Number(row.id);
    if (Number.isFinite(id)) otherById.set(id, row);
  }

  const rows = activeRows.map((row) => {
    const id = Number(row.id);
    const other = Number.isFinite(id) ? otherById.get(id) : undefined;
    if (!other) return row;
    return {
      ...row,
      title: pickRich(row.title, other.title),
      subtitle: pickRich(row.subtitle, other.subtitle),
      description: pickRich(row.description, other.description),
    };
  });

  return { raw: rawActive, rows };
}

function pickRich(primary: unknown, fallback: unknown): unknown {
  const p = typeof primary === "string" ? primary.trim() : "";
  if (p) return primary;
  const f = typeof fallback === "string" ? fallback.trim() : "";
  if (f) return fallback;
  return primary ?? fallback ?? "";
}
