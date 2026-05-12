import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type { BlogCardPayload } from "@/features/blogs/lib/blog-card-payload";
import { apiClient } from "@/lib/api";
import type { Locale } from "next-intl";

export type PublicBlogCategory = {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  is_active: boolean;
  is_searchable: boolean;
  blogs_count?: number;
  /** Localized category description HTML from the API (rich text stored as string). */
  descriptionRich?: string;
};

export type PublicBlog = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  /** Raw API `title` when bilingual `{ ar, en }`. */
  titleRichSource?: unknown;
  /** Resolved default (English) HTML/plain string for non-locale callers. */
  description: string;
  content: string;
  /** Raw API `description`: string or `{ ar, en }` rich-text HTML — use with `pickLocalizedRichText`. */
  descriptionRichSource?: unknown;
  /** Raw API `subtitle` — same shape as description for bilingual snippets. */
  subtitleRichSource?: unknown;
  /** Raw API `content` for bilingual HTML bodies. */
  contentRichSource?: unknown;
  image: string | null;
  image_alt: string | null;
  canonical_url: string | null;
  is_searchable: boolean;
  publisher_name: string;
  tags: string[];
  reading_time: number | null;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
  is_active: boolean;
  published_at: string | null;
  category: { id: number; name: string; slug?: string } | null;
  created_at: string | null;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function unwrapData<T = unknown>(payload: unknown): T | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (p.status === "false" || p.status === false) return null;
  return (p.data as T) ?? null;
}

/** Whether this JSON payload is explicitly an ApiResponse failure envelope. */
function isApiEnvelopeFailure(payload: Record<string, unknown>): boolean {
  const s = payload.status;
  return s === "false" || s === false || s === 0 || s === "0";
}

/**
 * Resolves a single blog JSON body whether the backend uses `{ data: blog }`, `{ blog }`,
 * nests again, returns the model at the root (no envelope), or uses `data: [blog]` for show.
 */
function pickBlogPayloadRecord(payload: unknown): Record<string, unknown> | null {
  const rec = asRecord(payload);
  if (!rec) return null;
  if (isApiEnvelopeFailure(rec)) return null;

  const id = rec.id;
  const slugVal = rec.slug;
  const slugOk = typeof slugVal === "string" && slugVal.trim() !== "";

  if (slugOk && id != null && (typeof id === "number" || typeof id === "string")) {
    return rec;
  }

  const dataVal = rec.data;
  if (Array.isArray(dataVal) && dataVal.length === 1) {
    const one = pickBlogPayloadRecord(dataVal[0]);
    if (one) return one;
  } else if (dataVal != null && typeof dataVal === "object" && !Array.isArray(dataVal)) {
    const one = pickBlogPayloadRecord(dataVal);
    if (one) return one;
  }

  for (const key of ["blog", "blog_post"] as const) {
    const next = rec[key];
    if (next != null && typeof next === "object" && !Array.isArray(next)) {
      const one = pickBlogPayloadRecord(next);
      if (one) return one;
    }
  }

  return null;
}

/** Slug as captured from the Next route — safe-decode segments that arrive percent-encoded. */
export function normalizeBlogSlugFromRoute(routeSlug: string): string {
  let s = routeSlug.trim();
  if (!s) return s;
  try {
    let prev = "";
    while (prev !== s) {
      prev = s;
      s = decodeURIComponent(s.replace(/\+/g, "%20"));
    }
  } catch {
    /* keep s */
  }
  return s;
}

/** Compare slugs tolerant of Unicode normalization (Arabic NFC/NFD mismatches vs API). */
function blogSlugsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  try {
    return a.normalize("NFKC") === b.normalize("NFKC");
  } catch {
    return false;
  }
}

function flattenCategoryTree(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const visit = (n: Record<string, unknown>) => {
    const { children: ch, ...rest } = n;
    out.push(rest);
    if (Array.isArray(ch)) {
      for (const item of ch) {
        const r = asRecord(item);
        if (r) visit(r);
      }
    }
  };
  for (const r of rows) {
    const rec = asRecord(r);
    if (rec) visit(rec);
  }
  return out;
}

/** Visible text for previews / banner lines when the API stores HTML. */
export function plainTextFromHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Localized slice for rich-text/HTML fields (`description`, `subtitle`, category `description`, …). */
export function pickLocalizedRichText(field: unknown, lang: "ar" | "en"): string {
  if (field == null) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && !Array.isArray(field)) {
    const v = (field as Record<string, unknown>)[lang];
    if (typeof v === "string") return v;
  }
  return "";
}

function pickLocalizedDescription(field: unknown, lang: "ar" | "en"): string {
  return pickLocalizedRichText(field, lang);
}

function normalizeCategory(raw: Record<string, unknown>, locale: Locale): PublicBlogCategory | null {
  const id = raw.id;
  if (typeof id !== "number" && typeof id !== "string") return null;
  const numId = typeof id === "number" ? id : Number(id);
  if (!Number.isFinite(numId)) return null;
  const name = typeof raw.name === "string" ? raw.name : "";
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  const parentRaw = raw.parent_id;
  const parent_id =
    parentRaw === null || parentRaw === undefined
      ? null
      : typeof parentRaw === "number"
        ? parentRaw
        : Number(parentRaw);
  const lang = locale === "ar" ? "ar" : "en";
  const descriptionHtml = pickLocalizedDescription(raw.description, lang).trim();
  return {
    id: numId,
    parent_id: parent_id != null && Number.isFinite(parent_id) ? parent_id : null,
    name,
    slug,
    is_active: raw.is_active !== false && raw.is_active !== 0 && raw.is_active !== "0",
    is_searchable: raw.is_searchable !== false && raw.is_searchable !== 0 && raw.is_searchable !== "0",
    blogs_count:
      typeof raw.blogs_count === "number"
        ? raw.blogs_count
        : typeof raw.blogs_count === "string"
          ? Number(raw.blogs_count) || undefined
          : undefined,
    ...(descriptionHtml
      ? { descriptionRich: descriptionHtml }
      : {}),
  };
}

function normalizeBlog(raw: Record<string, unknown>): PublicBlog | null {
  const id = raw.id;
  if (typeof id !== "number" && typeof id !== "string") return null;
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  if (!slug) return null;

  const tagsRaw = raw.tags;
  const tags = Array.isArray(tagsRaw) ? tagsRaw.map((t) => String(t)) : [];

  let category: PublicBlog["category"] = null;
  const cat = asRecord(raw.category);
  if (cat != null && cat.id != null) {
    const cid = typeof cat.id === "number" ? cat.id : Number(cat.id);
    const cname = typeof cat.name === "string" ? cat.name : "";
    const cslug = typeof cat.slug === "string" ? cat.slug : undefined;
    if (Number.isFinite(cid)) category = { id: cid as number, name: cname, slug: cslug };
  }

  const title = typeof raw.title === "string" ? raw.title : pickLocalizedRichText(raw.title, "en");
  const subtitle =
    typeof raw.subtitle === "string" ? raw.subtitle : pickLocalizedRichText(raw.subtitle, "en");
  const description =
    typeof raw.description === "string"
      ? raw.description
      : pickLocalizedRichText(raw.description, "en");
  const content = typeof raw.content === "string" ? raw.content : pickLocalizedRichText(raw.content, "en");

  return {
    id: typeof id === "number" ? id : Number(id),
    slug,
    title,
    subtitle,
    description,
    content,
    titleRichSource: raw.title,
    descriptionRichSource: raw.description,
    subtitleRichSource: raw.subtitle,
    contentRichSource: raw.content,
    image: typeof raw.image === "string" ? raw.image : null,
    image_alt: typeof raw.image_alt === "string" ? raw.image_alt : null,
    canonical_url: typeof raw.canonical_url === "string" ? raw.canonical_url : null,
    is_searchable:
      raw.is_searchable !== false && raw.is_searchable !== 0 && raw.is_searchable !== "0",
    publisher_name: typeof raw.publisher_name === "string" ? raw.publisher_name : "",
    tags,
    reading_time:
      typeof raw.reading_time === "number"
        ? raw.reading_time
        : raw.reading_time != null
          ? Number(raw.reading_time) || null
          : null,
    meta_title: typeof raw.meta_title === "string" ? raw.meta_title : null,
    meta_description: typeof raw.meta_description === "string" ? raw.meta_description : null,
    status: typeof raw.status === "string" ? raw.status : "draft",
    is_active: raw.is_active !== false && raw.is_active !== 0 && raw.is_active !== "0",
    published_at: typeof raw.published_at === "string" ? raw.published_at : null,
    category,
    created_at: typeof raw.created_at === "string" ? raw.created_at : null,
  };
}

export function isPublicBlogVisible(b: PublicBlog): boolean {
  return b.is_active && b.status === "published";
}

export async function fetchPublicBlogCategories(locale: Locale): Promise<PublicBlogCategory[]> {
  try {
    const raw = await apiClient.get<unknown>("/v1/blog-categories", {
      query: { tree: "true" },
    });
    const data = unwrapData<unknown[]>(raw);
    if (!Array.isArray(data)) return [];
    const flat = flattenCategoryTree(data.filter(Boolean) as Record<string, unknown>[]);
    return flat
      .map((r) => normalizeCategory(r, locale))
      .filter((c): c is PublicBlogCategory => c != null && c.is_active);
  } catch {
    return [];
  }
}

export type FetchBlogsQuery = {
  blog_category_id?: string | number;
  category_slug?: string;
};

export async function fetchPublicBlogs(query?: FetchBlogsQuery): Promise<PublicBlog[]> {
  try {
    const q: Record<string, string> = {};
    if (query?.blog_category_id != null && query.blog_category_id !== "")
      q.blog_category_id = String(query.blog_category_id);
    if (query?.category_slug) q.category_slug = query.category_slug;

    const raw = await apiClient.get<unknown>("/v1/blogs", {
      query: Object.keys(q).length ? q : undefined,
    });
    const data = unwrapData<unknown[]>(raw);
    if (!Array.isArray(data)) return [];
    return data
      .map((row) => normalizeBlog(asRecord(row) ?? {}))
      .filter((b): b is PublicBlog => b != null)
      .filter(isPublicBlogVisible);
  } catch {
    return [];
  }
}

export async function fetchPublicBlogBySlug(slugParam: string): Promise<PublicBlog | null> {
  const slug = normalizeBlogSlugFromRoute(slugParam);

  try {
    const raw = await apiClient.get<unknown>(`/v1/blogs/${encodeURIComponent(slug)}`);
    const data = pickBlogPayloadRecord(raw);
    const one = data ? normalizeBlog(data) : null;
    if (one && isPublicBlogVisible(one)) return one;
  } catch {
    /* try list fallback */
  }

  const all = await fetchPublicBlogs();
  return all.find((b) => blogSlugsMatch(b.slug, slug)) ?? null;
}

export function blogToCardPayload(blog: PublicBlog, locale: Locale): BlogCardPayload {
  const dateSource = blog.published_at || blog.created_at;
  let dateLabel = "—";
  if (dateSource) {
    try {
      dateLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(dateSource));
    } catch {
      dateLabel = dateSource;
    }
  }

  const lang = locale === "ar" ? "ar" : "en";
  const title =
    pickLocalizedRichText(blog.titleRichSource ?? blog.title, lang).trim() || blog.title;
  const descHtml =
    pickLocalizedRichText(blog.descriptionRichSource ?? blog.description, lang).trim() ||
    pickLocalizedRichText(blog.subtitleRichSource ?? blog.subtitle, lang).trim();

  return {
    title,
    description: descHtml || blog.description || blog.subtitle,
    date: dateLabel,
    image: resolveMediaUrl(blog.image),
    link: `/blogs/${blog.slug}`,
  };
}
