export type SlugRedirect = {
  toSlug: string;
  toPath?: string;
  status: number;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pickLoc(field: unknown, locale: string): string {
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

function redirectFromBlock(redirectRec: Record<string, unknown>): SlugRedirect | null {
  const toSlug = String(
    redirectRec.to_slug ?? redirectRec.toSlug ?? redirectRec.slug ?? "",
  ).trim();
  const toPath = String(
    redirectRec.target_path ??
      redirectRec.targetPath ??
      redirectRec.target_url ??
      redirectRec.targetUrl ??
      redirectRec.to ??
      "",
  ).trim();
  const status = Number(redirectRec.status ?? redirectRec.code ?? 0);
  if (!Number.isFinite(status) || status <= 0) return null;
  if (toPath) return { toSlug, toPath, status };
  if (toSlug) return { toSlug, status };
  if (status === 404 || status === 410) return { toSlug: "", status };
  return null;
}

/** Parses redirect metadata from API envelope or resource row (slug change or post-delete). */
export function parseSlugRedirect(
  raw: unknown,
  requestedSlug: string,
  locale: string,
): SlugRedirect | null {
  const envelope = asRecord(raw);
  const dataBlock = asRecord(envelope?.data);
  const redirectBlock =
    envelope?.redirect ??
    dataBlock?.redirect ??
    (envelope?.data && asRecord(envelope.data)?.redirect);
  const redirectRec = asRecord(redirectBlock);
  if (redirectRec) {
    const parsed = redirectFromBlock(redirectRec);
    if (parsed) return parsed;
  }

  const row =
    dataBlock ??
    (Array.isArray(envelope?.data) ? null : asRecord(raw)) ??
    envelope;
  if (!row) return null;

  const decoded = decodeURIComponent(requestedSlug);
  const slugLocal = row.slug_local;
  const canonical = pickLoc(slugLocal, locale) || String(row.slug ?? "").trim();
  if (!canonical || canonical === decoded) return null;

  const previous = row.previous_slug ?? row.previous_slugs;
  const prevForLocale = pickLoc(previous, locale);
  if (prevForLocale && prevForLocale !== decoded) return null;

  const codes = row.slug_redirect_code ?? row.slugRedirectCode;
  const codeRaw = pickLoc(codes, locale) || String(row.slug_redirect_code ?? "").trim();
  const status = Number(codeRaw);
  if (!Number.isFinite(status) || status <= 0) return null;

  const prevMatch =
    prevForLocale === decoded ||
    String(row.slug ?? "").trim() === decoded ||
    pickLoc(slugLocal, locale === "ar" ? "en" : "ar") === decoded;

  if (!prevMatch && prevForLocale) return null;

  return { toSlug: canonical, status };
}

export function isPermanentRedirectStatus(status: number): boolean {
  return status === 301 || status === 308;
}

export function isGoneStatus(status: number): boolean {
  return status === 404 || status === 410;
}
