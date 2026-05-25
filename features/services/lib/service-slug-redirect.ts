import type { Locale } from "next-intl";
import { servicePostPath } from "./services-routes";

export type ServiceSlugRedirect = {
  toSlug: string;
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

/** Parses redirect metadata from API envelope or service row. */
export function parseServiceSlugRedirect(
  raw: unknown,
  requestedSlug: string,
  locale: string,
): ServiceSlugRedirect | null {
  const envelope = asRecord(raw);
  const redirectBlock =
    envelope?.redirect ?? (envelope?.data && asRecord(envelope.data)?.redirect);
  const redirectRec = asRecord(redirectBlock);
  if (redirectRec) {
    const toSlug = String(
      redirectRec.to_slug ?? redirectRec.toSlug ?? redirectRec.slug ?? "",
    ).trim();
    const status = Number(redirectRec.status ?? redirectRec.code ?? 301);
    if (toSlug && Number.isFinite(status)) {
      return { toSlug, status };
    }
  }

  const row =
    asRecord(envelope?.data) ??
    (Array.isArray(envelope?.data) ? null : asRecord(raw)) ??
    asRecord(raw);
  if (!row) return null;

  const decoded = decodeURIComponent(requestedSlug);
  const slugLocal = row.slug_local;
  const canonical =
    pickLoc(slugLocal, locale) || String(row.slug ?? "").trim();
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

export function serviceRedirectPath(locale: Locale, toSlug: string): string {
  return servicePostPath(toSlug);
}

export function isPermanentRedirectStatus(status: number): boolean {
  return status === 301 || status === 308;
}

export function isGoneStatus(status: number): boolean {
  return status === 404 || status === 410;
}
