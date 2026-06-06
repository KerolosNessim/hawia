import { CONFIG } from "@/config";
import { resolveRequestLocale } from "@/lib/api-locale";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/** GET `/v1/services/{slug}` without throwing on `status: "false"` (redirect / gone envelopes). */
export async function fetchServiceShowEnvelope(
  slug: string,
): Promise<Record<string, unknown> | null> {
  const locale = await resolveRequestLocale();
  const base = (process.env.NEXT_PUBLIC_API_URL || CONFIG.BACK_URL).replace(/\/$/, "");
  const url = `${base}/v1/services/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Language": locale === "en" ? "en" : "ar",
      },
      cache: "no-store",
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!body || typeof body !== "object") return null;

    if (body.status === "true" || body.status === true) {
      const data = asRecord(body.data);
      if (data) return data;
      if (body.id != null || body.slug) return body;
      return null;
    }

    const data = asRecord(body.data);
    const slugRedirect = asRecord(data?.slug_redirect);
    const redirect = asRecord(data?.redirect) ?? asRecord(body.redirect);

    if (slugRedirect) {
      const target = String(slugRedirect.target_slug ?? "").trim();
      const status = Number(slugRedirect.http_status ?? slugRedirect.status ?? 0);
      if (target && Number.isFinite(status) && status > 0) {
        return { redirect: { to_slug: target, status } };
      }
      if (Number.isFinite(status) && (status === 404 || status === 410)) {
        return { redirect: { to_slug: "", status } };
      }
    }

    if (redirect) {
      const status = Number(redirect.status ?? redirect.code ?? 0);
      const toSlug = String(redirect.to_slug ?? redirect.toSlug ?? "").trim();
      if (Number.isFinite(status) && status > 0) {
        return { redirect: { to_slug: toSlug, status } };
      }
    }

    return null;
  } catch {
    return null;
  }
}
