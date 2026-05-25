import type { PublicBlog } from "@/features/blogs/server/public-blogs";

export type BlogCategoryRef = {
  id: number;
  name: string;
  slug?: string;
  /** Pivot or category timestamp for “latest assignment” ordering. */
  sortAt?: string | null;
};

function parseTimestamp(value: unknown): number {
  if (typeof value !== "string" || !value.trim()) return 0;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
}

function categoryRefFromRecord(raw: Record<string, unknown>): BlogCategoryRef | null {
  const idRaw = raw.id ?? raw.blog_category_id ?? raw.category_id;
  const id = typeof idRaw === "number" ? idRaw : Number(idRaw);
  if (!Number.isFinite(id)) return null;

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const slug = typeof raw.slug === "string" && raw.slug.trim() ? raw.slug.trim() : undefined;

  const pivot = raw.pivot;
  let sortAt: string | null = null;
  if (pivot && typeof pivot === "object" && !Array.isArray(pivot)) {
    const p = pivot as Record<string, unknown>;
    const candidate =
      (typeof p.created_at === "string" && p.created_at) ||
      (typeof p.updated_at === "string" && p.updated_at) ||
      (typeof p.attached_at === "string" && p.attached_at) ||
      null;
    sortAt = candidate;
  }
  if (!sortAt) {
    sortAt =
      (typeof raw.created_at === "string" && raw.created_at) ||
      (typeof raw.updated_at === "string" && raw.updated_at) ||
      null;
  }

  return { id: id as number, name, slug, sortAt };
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/** Collects category refs from API shapes: `category`, `categories`, `blog_categories`. */
export function extractBlogCategoriesFromRaw(raw: Record<string, unknown>): BlogCategoryRef[] {
  const byId = new Map<number, BlogCategoryRef>();

  const add = (ref: BlogCategoryRef | null) => {
    if (!ref) return;
    const prev = byId.get(ref.id);
    if (!prev || parseTimestamp(ref.sortAt) >= parseTimestamp(prev.sortAt)) {
      byId.set(ref.id, ref);
    }
  };

  for (const key of ["categories", "blog_categories"] as const) {
    const arr = raw[key];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      const rec = asRecord(item);
      if (!rec) continue;
      const nested = asRecord(rec.category);
      add(categoryRefFromRecord(nested ?? rec));
    }
  }

  const single = asRecord(raw.category);
  if (single) add(categoryRefFromRecord(single));

  const loneId = raw.blog_category_id ?? raw.category_id;
  if (loneId != null && !byId.size) {
    const id = typeof loneId === "number" ? loneId : Number(loneId);
    if (Number.isFinite(id)) {
      add({ id: id as number, name: "", slug: undefined, sortAt: null });
    }
  }

  return [...byId.values()];
}

/** When a blog has multiple categories, use the most recently assigned one. */
export function pickLatestBlogCategory(refs: BlogCategoryRef[]): BlogCategoryRef | null {
  if (refs.length === 0) return null;
  if (refs.length === 1) return refs[0]!;

  return refs.reduce((latest, current) => {
    const lt = parseTimestamp(latest.sortAt);
    const ct = parseTimestamp(current.sortAt);
    if (ct > lt) return current;
    if (ct < lt) return latest;
    return current.id >= latest.id ? current : latest;
  });
}

export function pickPrimaryBlogCategory(blog: PublicBlog): PublicBlog["category"] {
  const refs = blog.categories?.length ? blog.categories : blog.category ? [blog.category] : [];
  const latest = pickLatestBlogCategory(
    refs.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      sortAt: "sortAt" in c ? (c as BlogCategoryRef).sortAt : null,
    })),
  );
  if (!latest) return null;
  return { id: latest.id, name: latest.name, slug: latest.slug };
}
