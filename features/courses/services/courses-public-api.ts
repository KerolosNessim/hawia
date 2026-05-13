import { apiClient } from "@/lib/api";
import { getStaticResolvedCourse } from "@/features/courses/lib/static-course-mocks";

export type CatalogCourseSummary = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  priceLabel: string;
  imageSrc: string;
};

export type ResolvedCourseLesson = {
  id: string;
  title: string;
  preview: boolean;
  durationLabel?: string | null;
  video_url?: string;
};

/** Public course shaped for course detail UI (single page). */
export type ResolvedPublicCourse = {
  id: string;
  slug: string;
  /** Localized main title */
  title: string;
  description: string;
  priceLabel: string;
  comparePriceLabel: string | null;
  imageSrc: string;
  objectives: string[];
  lessons: ResolvedCourseLesson[];
};

function unwrapArray(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (body && typeof body === "object") {
    const p = body as Record<string, unknown>;
    const inner = p.data ?? p.courses ?? p.results;
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
    if (inner && typeof inner === "object") {
      const nested = inner as Record<string, unknown>;
      const nestedRows = nested.data ?? nested.courses ?? nested.results;
      if (Array.isArray(nestedRows)) return nestedRows as Record<string, unknown>[];
    }
  }
  return [];
}

function pickLoc(field: unknown, locale: string): string {
  if (field == null) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && !Array.isArray(field)) {
    const o = field as Record<string, unknown>;
    const ar = o.ar;
    const en = o.en;
    if (locale.startsWith("ar")) {
      if (typeof ar === "string" && ar) return ar;
      if (typeof en === "string") return en;
    } else {
      if (typeof en === "string" && en) return en;
      if (typeof ar === "string") return ar;
    }
  }
  return "";
}

function readId(r: Record<string, unknown>): string {
  const v = r.id;
  return v != null ? String(v) : "";
}

function readSlug(r: Record<string, unknown>): string | null {
  const s = r.slug ?? r.url_slug;
  return typeof s === "string" && s.trim() ? s.trim() : null;
}

function parseDescription(raw: unknown, locale: string): string {
  if (raw == null) return "";
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return "";
    try {
      const o = JSON.parse(t) as unknown;
      return parseDescription(o, locale);
    } catch {
      return raw;
    }
  }
  if (typeof raw === "object") return pickLoc(raw, locale);
  return "";
}

function parseObjectives(raw: unknown, locale: string): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      out.push(item.trim());
      continue;
    }
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const o = item as Record<string, unknown>;
      const line = pickLoc(o.title ?? o.text ?? o, locale);
      if (line) out.push(line);
    }
  }
  return out;
}

export function mediaUrlFromApi(path: string): string {
  const t = path.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const origin = base.replace(/\/?api$/i, "");
  if (t.startsWith("/")) return `${origin}${t}`;
  return `${origin}/${t}`;
}

function coverFromRecord(r: Record<string, unknown>): string {
  const raw =
    r.image ??
    r.cover_image ??
    r.thumbnail ??
    r.media_url ??
    (typeof r.image_url === "string" ? r.image_url : null);

  if (typeof raw === "string" && raw.trim()) return mediaUrlFromApi(raw);
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const url = o.url ?? o.path;
    if (typeof url === "string" && url.trim()) return mediaUrlFromApi(url);
  }
  return "/course.webp";
}

function priceLabelFromRecord(r: Record<string, unknown>): string {
  const p = r.price ?? r.amount;
  const cur = r.currency;
  if (p == null || String(p).trim() === "") return "";
  const num = String(p).trim();
  if (typeof cur === "string" && cur.trim()) return `${cur.trim()}${num}`;
  return `$${num}`;
}

function comparePriceFromRecord(r: Record<string, unknown>): string | null {
  const keys = ["compare_at_price", "old_price", "list_price", "compare_price"];
  for (const k of keys) {
    const v = r[k];
    if (v != null && String(v).trim() !== "") {
      const cur = r.currency;
      const num = String(v).trim();
      if (typeof cur === "string" && cur.trim()) return `${cur.trim()}${num}`;
      return `$${num}`;
    }
  }
  return null;
}

export async function fetchCoursesCatalog(locale: string): Promise<CatalogCourseSummary[]> {
  const body = await apiClient.get<unknown>("/v1/courses");
  const rows = unwrapArray(body);
  return rows
    .map((r) => {
      const id = readId(r);
      if (!id) return null;
      const active = r.is_active ?? r.isActive;
      if (active === false || active === 0 || active === "0") return null;
      const slug = readSlug(r);
      return {
        id,
        slug,
        title: pickLoc(r.title, locale),
        description: parseDescription(r.description, locale),
        priceLabel: priceLabelFromRecord(r) || "—",
        imageSrc: coverFromRecord(r),
      };
    })
    .filter((x): x is CatalogCourseSummary => x != null);
}

async function fetchCourseRowBySlug(slug: string): Promise<Record<string, unknown> | null> {
  try {
    const body = await apiClient.get<unknown>(`/v1/courses/${encodeURIComponent(slug)}`);
    if (body && typeof body === "object") {
      const p = body as Record<string, unknown>;
      const d = p.data;
      if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, unknown>;
      return p;
    }
  } catch {
    return null;
  }
  return null;
}

export async function fetchCourseSectionsPublic(
  courseId: string,
  locale: string,
): Promise<ResolvedCourseLesson[]> {
  try {
    const body = await apiClient.get<unknown>(`/v1/courses/${courseId}/sections`);
    const sorted = unwrapArray(body).slice().sort((a, b) => {
      const ra = a as Record<string, unknown>;
      const rb = b as Record<string, unknown>;
      return Number(ra.sort_order ?? 0) - Number(rb.sort_order ?? 0);
    });
    return sorted
      .map((r) => {
        const row = r as Record<string, unknown>;
        const id = readId(row);
        if (!id) return null;
        const free = row.is_free ?? row.isFree;
        const preview = free === true || free === 1 || free === "1";
        const dur =
          typeof row.duration === "string"
            ? row.duration
            : row.duration != null
              ? String(row.duration)
              : null;
        return {
          id,
          title: pickLoc(row.title, locale),
          preview,
          durationLabel: dur,
          video_url: typeof row.video_url === "string" ? row.video_url : undefined,
        };
      })
      .filter((x): x is ResolvedCourseLesson => x != null);
  } catch {
    return [];
  }
}

function recordToResolved(
  r: Record<string, unknown>,
  locale: string,
  lessons: ResolvedCourseLesson[],
): ResolvedPublicCourse {
  const slug = readSlug(r) ?? "";
  return {
    id: readId(r),
    slug,
    title: pickLoc(r.title, locale),
    description: parseDescription(r.description, locale),
    priceLabel: priceLabelFromRecord(r) || "—",
    comparePriceLabel: comparePriceFromRecord(r),
    imageSrc: coverFromRecord(r),
    objectives: parseObjectives(r.objectives ?? r.learning_objectives ?? r.goals, locale),
    lessons,
  };
}

/** Resolve a course from URL segment: numeric id, slug, or list lookup. */
export async function resolvePublicCourse(
  identifier: string,
  locale: string,
): Promise<ResolvedPublicCourse | null> {
  const staticCourse = getStaticResolvedCourse(identifier, locale);
  if (staticCourse) return staticCourse;

  let row: Record<string, unknown> | null = await fetchCourseRowBySlug(identifier);

  if (!row) {
    const listBody = await apiClient.get<unknown>("/v1/courses");
    const list = unwrapArray(listBody);
    row =
      (list.find(
        (rec) => readId(rec) === String(identifier) || readSlug(rec) === identifier,
      ) as Record<string, unknown> | undefined) ?? null;

    if (row) {
      const slug = readSlug(row);
      if (slug) {
        const full = await fetchCourseRowBySlug(slug);
        if (full) row = full;
      }
    }
  }

  if (!row || !readId(row)) return null;

  const courseId = readId(row);
  const lessons = await fetchCourseSectionsPublic(courseId, locale);
  return recordToResolved(row, locale, lessons);
}
