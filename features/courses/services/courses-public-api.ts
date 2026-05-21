import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { getStaticResolvedCourse } from "@/features/courses/lib/static-course-mocks";
import { apiClient } from "@/lib/api";

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

function readSlugForLocale(r: Record<string, unknown>, locale: string): string | null {
  const local = r.slug_local;
  if (local && typeof local === "object" && !Array.isArray(local)) {
    const o = local as Record<string, unknown>;
    const key = locale.startsWith("ar") ? "ar" : "en";
    const localized = o[key];
    if (typeof localized === "string" && localized.trim()) return localized.trim();
    const fallback = o.en ?? o.ar;
    if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
  }
  return readSlug(r);
}

function collectSlugVariants(r: Record<string, unknown>): string[] {
  const out = new Set<string>();
  const primary = readSlug(r);
  if (primary) out.add(primary);
  const local = r.slug_local;
  if (local && typeof local === "object" && !Array.isArray(local)) {
    for (const v of Object.values(local as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim()) out.add(v.trim());
    }
  }
  return [...out];
}

function recordMatchesIdentifier(
  r: Record<string, unknown>,
  identifier: string,
): boolean {
  const decoded = decodeURIComponent(identifier);
  if (readId(r) === decoded || readId(r) === identifier) return true;
  return collectSlugVariants(r).some((s) => s === decoded || s === identifier);
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
  const resolved = resolveMediaUrl(path.trim() || null);
  return resolved === "/blog.webp" ? "/course.webp" : resolved;
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
      const slug = readSlugForLocale(r, locale) ?? readSlug(r);
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
        const lesson: ResolvedCourseLesson = {
          id,
          title: pickLoc(row.title, locale),
          preview,
          durationLabel: dur,
        };
        if (typeof row.video_url === "string") lesson.video_url = row.video_url;
        return lesson;
      })
      .filter((x): x is ResolvedCourseLesson => x !== null);
  } catch {
    return [];
  }
}

function recordToResolved(
  r: Record<string, unknown>,
  locale: string,
  lessons: ResolvedCourseLesson[],
): ResolvedPublicCourse {
  const slug = readSlugForLocale(r, locale) ?? readSlug(r) ?? "";
  const titleRaw = r.title;
  const title =
    typeof titleRaw === "string" && titleRaw.trim()
      ? titleRaw.trim()
      : pickLoc(titleRaw, locale);
  const descriptionRaw = r.description;
  const description =
    typeof descriptionRaw === "string" && descriptionRaw.trim()
      ? descriptionRaw
      : parseDescription(descriptionRaw, locale);

  return {
    id: readId(r),
    slug,
    title: title || pickLoc(titleRaw, locale),
    description,
    priceLabel: priceLabelFromRecord(r) || "—",
    comparePriceLabel: comparePriceFromRecord(r),
    imageSrc: coverFromRecord(r),
    objectives: parseObjectives(r.objectives ?? r.learning_objectives ?? r.goals, locale),
    lessons,
  };
}

async function resolveCourseRow(
  identifier: string,
  locale: string,
): Promise<Record<string, unknown> | null> {
  const decoded = decodeURIComponent(identifier);

  let row = await fetchCourseRowBySlug(decoded);
  if (row) return row;

  const listBody = await apiClient.get<unknown>("/v1/courses");
  const list = unwrapArray(listBody);
  const match = list.find((rec) => recordMatchesIdentifier(rec, decoded)) as
    | Record<string, unknown>
    | undefined;
  if (!match) return null;

  const slugCandidates = [
    decoded,
    readSlugForLocale(match, locale),
    readSlug(match),
    ...collectSlugVariants(match),
  ].filter((s): s is string => Boolean(s));

  for (const slug of [...new Set(slugCandidates)]) {
    const full = await fetchCourseRowBySlug(slug);
    if (full) return full;
  }

  return match;
}

/** Resolve a course from URL segment: numeric id, localized slug, or list lookup. */
export async function resolvePublicCourse(
  identifier: string,
  locale: string,
): Promise<ResolvedPublicCourse | null> {
  const staticCourse = getStaticResolvedCourse(identifier, locale);
  if (staticCourse) return staticCourse;

  const row = await resolveCourseRow(identifier, locale);
  if (!row || !readId(row)) return null;

  const active = row.is_active ?? row.isActive;
  if (active === false || active === 0 || active === "0") return null;

  const courseId = readId(row);
  const lessons = await fetchCourseSectionsPublic(courseId, locale);
  return recordToResolved(row, locale, lessons);
}
