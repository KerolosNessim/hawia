import { apiClient } from "@/lib/api";

export type PublicPackageCategory = {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type PublicPackageCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  buttonText: string;
  detailsUrl: string | null;
  isFeatured: boolean;
  iconPreset: "target" | "gem" | "rocket" | null;
  iconImageUrl: string | null;
  priceLabel: string;
  categoryId: string | null;
  categorySlug: string | null;
  categoryTitle: string | null;
};

export type PublicPackageDetail = PublicPackageCard & {
  features: { title: string; isIncluded: boolean }[];
  currency: string | null;
  price: string | null;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  category: PublicPackageCategory | null;
};

export type PackagesSectionPayload = {
  categories: PublicPackageCategory[];
  packagesByCategoryId: Record<string, PublicPackageCard[]>;
  uncategorized: PublicPackageCard[];
};

type PageMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapArray(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  const p = asRecord(body);
  if (p) {
    const inner = p.data ?? p.packages ?? p.results ?? p.items;
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
    const innerRecord = asRecord(inner);
    if (innerRecord) {
      const nested =
        innerRecord.data ?? innerRecord.packages ?? innerRecord.results ?? innerRecord.items;
      if (Array.isArray(nested)) return nested as Record<string, unknown>[];
    }
  }
  return [];
}

function unwrapObject(body: unknown): Record<string, unknown> | null {
  const root = asRecord(body);
  if (!root) return null;
  const data = root.data;
  const dataRecord = asRecord(data);
  return dataRecord ?? root;
}

function readPageMeta(body: unknown): PageMeta {
  const root = asRecord(body);
  const data = asRecord(root?.data);
  const meta = asRecord(data?.meta) ?? asRecord(root?.meta);
  const toNumber = (value: unknown, fallback: number) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  return {
    currentPage: toNumber(meta?.current_page, 1),
    lastPage: toNumber(meta?.last_page, 1),
    perPage: toNumber(meta?.per_page, 10),
    total: toNumber(meta?.total, 0),
  };
}

async function fetchAllRows(url: string): Promise<Record<string, unknown>[]> {
  const first = await apiClient.get<unknown>(url);
  const firstRows = unwrapArray(first);
  const meta = readPageMeta(first);
  if (meta.lastPage <= 1) return firstRows;

  const rest = await Promise.all(
    Array.from({ length: meta.lastPage - 1 }, (_, i) =>
      apiClient.get<unknown>(url, {
        query: { page: i + 2, per_page: meta.perPage },
      }),
    ),
  );

  return rest.reduce(
    (rows, page) => rows.concat(unwrapArray(page)),
    firstRows,
  );
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

function pickString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readId(r: Record<string, unknown>): string {
  const v = r.id;
  return v != null ? String(v) : "";
}

function contentRecordFromPackage(r: Record<string, unknown>): Record<string, unknown> | null {
  return asRecord(r.content);
}

function seoRecordFromPackage(r: Record<string, unknown>): Record<string, unknown> | null {
  return asRecord(r.seo);
}

function seoString(r: Record<string, unknown>, key: string): string | null {
  return pickString(r[key]) || pickString(seoRecordFromPackage(r)?.[key]) || null;
}

function readSlug(r: Record<string, unknown>, locale: string): string {
  const s = r.slug;
  if (typeof s === "string" && s.trim()) return s.trim();
  if (s && typeof s === "object" && !Array.isArray(s)) return pickLoc(s, locale);
  return "";
}

function mediaUrlFromApi(path: string): string {
  const t = path.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const origin = base.replace(/\/?api$/i, "");
  if (t.startsWith("/")) return `${origin}${t}`;
  return `${origin}/${t}`;
}

function iconImageFromRecord(r: Record<string, unknown>): string | null {
  const raw = r.icon_url ?? r.icon ?? r.thumbnail;
  if (typeof raw === "string" && raw.trim()) return mediaUrlFromApi(raw);
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const url = o.url ?? o.path;
    if (typeof url === "string" && url.trim()) return mediaUrlFromApi(url);
  }
  return null;
}

function iconPresetFromRecord(r: Record<string, unknown>): "target" | "gem" | "rocket" | null {
  const p = r.icon_preset;
  if (p === "target" || p === "gem" || p === "rocket") return p;
  return null;
}

function priceLabelFromRecord(r: Record<string, unknown>): string {
  const p = r.price ?? r.amount;
  if (p == null || String(p).trim() === "") return "";
  const num = String(p).trim();
  const cur = r.currency;
  if (typeof cur === "string" && cur.trim()) return `${cur.trim()} ${num}`;
  return num;
}

function categoryIdFromPackage(r: Record<string, unknown>): string | null {
  const direct = r.package_category_id;
  if (direct != null && String(direct).trim() !== "") return String(direct);
  const cat = r.package_category ?? r.category;
  if (cat && typeof cat === "object" && !Array.isArray(cat)) {
    const id = (cat as Record<string, unknown>).id;
    if (id != null) return String(id);
  }
  return null;
}

function categoryRecordFromPackage(r: Record<string, unknown>): Record<string, unknown> | null {
  const cat = r.package_category ?? r.category;
  return asRecord(cat);
}

function recordToCategory(r: Record<string, unknown>, locale: string): PublicPackageCategory | null {
  const id = readId(r);
  if (!id) return null;
  const active = r.is_active ?? r.isActive;
  if (active === false || active === 0 || active === "0") return null;
  return {
    id,
    slug: readSlug(r, locale) || id,
    title: pickLoc(r.title ?? r.name, locale),
    sortOrder: Number(r.sort_order ?? 0) || 0,
    metaTitle: seoString(r, "meta_title"),
    metaDescription: seoString(r, "meta_description"),
  };
}

function recordToCard(
  r: Record<string, unknown>,
  locale: string,
  fallbackCategory?: PublicPackageCategory | null,
): PublicPackageCard | null {
  const id = readId(r);
  if (!id) return null;
  const active = r.is_active ?? r.isActive;
  if (active === false || active === 0 || active === "0") return null;
  const slug = readSlug(r, locale);
  const category = categoryRecordFromPackage(r);
  const content = contentRecordFromPackage(r);
  const categoryId = categoryIdFromPackage(r) ?? fallbackCategory?.id ?? null;
  const categorySlug = category ? readSlug(category, locale) || null : fallbackCategory?.slug ?? null;
  const categoryTitle = category
    ? pickLoc(category.title ?? category.name, locale) || null
    : fallbackCategory?.title ?? null;
  return {
    id,
    slug: slug || id,
    title: pickLoc(r.title ?? content?.title, locale),
    description: pickLoc(r.description ?? content?.description ?? content?.content, locale),
    buttonText: pickLoc(r.button_text ?? r.cta_label ?? content?.button_text, locale) || "—",
    detailsUrl:
      typeof r.details_url === "string" && r.details_url.trim() ? r.details_url.trim() : null,
    isFeatured: Boolean(r.is_featured ?? r.is_popular ?? false),
    iconPreset: iconPresetFromRecord(r),
    iconImageUrl: iconImageFromRecord(r),
    priceLabel: priceLabelFromRecord(r),
    categoryId,
    categorySlug,
    categoryTitle,
  };
}

export async function fetchPublicPackageCategories(locale: string): Promise<PublicPackageCategory[]> {
  try {
    const rows = await fetchAllRows("/v1/packages/categories");
    return rows
      .map((r) => recordToCategory(r, locale))
      .filter((x): x is PublicPackageCategory => x != null)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

export async function fetchPublicPackages(locale: string): Promise<PublicPackageCard[]> {
  try {
    const rows = await fetchAllRows("/v1/packages");
    return rows
      .map((r) => recordToCard(r, locale))
      .filter((x): x is PublicPackageCard => x != null);
  } catch {
    return [];
  }
}

export function findPublicPackageCategoryBySlug(
  categories: PublicPackageCategory[],
  slugOrId: string,
): PublicPackageCategory | null {
  const decoded = decodeURIComponent(slugOrId);
  return categories.find((c) => c.slug === decoded || c.id === decoded) ?? null;
}

export async function fetchPublicPackageCategoryById(
  id: string,
  locale: string,
): Promise<PublicPackageCategory | null> {
  try {
    const body = await apiClient.get<unknown>(`/v1/packages/categories/${encodeURIComponent(id)}`);
    const row = unwrapObject(body);
    return row ? recordToCategory(row, locale) : null;
  } catch {
    return null;
  }
}

function recordToCategoryWithPackages(
  raw: unknown,
  locale: string,
): { category: PublicPackageCategory | null; packages: PublicPackageCard[]; hasPackagesKey: boolean } {
  const row = asRecord(raw);
  if (!row) return { category: null, packages: [], hasPackagesKey: false };
  const category = recordToCategory(row, locale);
  if (!category) return { category: null, packages: [], hasPackagesKey: false };
  const hasPackagesKey = Object.prototype.hasOwnProperty.call(row, "packages");
  const packages = unwrapArray(row.packages)
    .map((pkg) => recordToCard(pkg, locale, category))
    .filter((pkg): pkg is PublicPackageCard => pkg != null);
  return { category, packages, hasPackagesKey };
}

export async function fetchPublicPackagesByCategorySlug(
  categorySlug: string,
  locale: string,
): Promise<{ category: PublicPackageCategory | null; packages: PublicPackageCard[] }> {
  const decoded = decodeURIComponent(categorySlug);
  try {
    const directBody = await apiClient.get<unknown>(
      `/v1/packages/categories/${encodeURIComponent(decoded)}`,
    );
    const direct = recordToCategoryWithPackages(unwrapObject(directBody), locale);
    if (direct.category && direct.hasPackagesKey) {
      return { category: direct.category, packages: direct.packages };
    }
  } catch {
    /* Fall back to list + client-side grouping for older API deployments. */
  }

  const categories = await fetchPublicPackageCategories(locale);
  const category = findPublicPackageCategoryBySlug(categories, categorySlug);
  if (!category) return { category: null, packages: [] };

  const detailedCategory = await fetchPublicPackageCategoryById(category.id, locale);
  const packages = (await fetchPublicPackages(locale)).filter(
    (pkg) => pkg.categoryId === category.id,
  );

  return { category: detailedCategory ?? category, packages };
}

export async function fetchPackagesSectionData(locale: string): Promise<PackagesSectionPayload> {
  const [categories, packages] = await Promise.all([
    fetchPublicPackageCategories(locale),
    fetchPublicPackages(locale),
  ]);

  const packagesByCategoryId: Record<string, PublicPackageCard[]> = {};
  for (const c of categories) {
    packagesByCategoryId[c.id] = [];
  }

  const uncategorized: PublicPackageCard[] = [];

  for (const pkg of packages) {
    const cid = pkg.categoryId;
    if (cid && Object.prototype.hasOwnProperty.call(packagesByCategoryId, cid)) {
      packagesByCategoryId[cid].push(pkg);
    } else {
      uncategorized.push(pkg);
    }
  }

  return {
    categories,
    packagesByCategoryId,
    uncategorized,
  };
}

function parseFeatures(
  raw: unknown,
  locale: string,
): { title: string; isIncluded: boolean }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { title: item, isIncluded: true };
      }
      const record = asRecord(item);
      if (!record) return null;
      return {
        title: pickLoc(record.title ?? record, locale),
        isIncluded: Boolean(record.is_included ?? record.isIncluded ?? true),
      };
    })
    .filter((f): f is { title: string; isIncluded: boolean } => f != null)
    .filter((f) => f.title.length > 0);
}

export async function fetchPublicPackageDetail(
  slugOrId: string,
  locale: string,
): Promise<PublicPackageDetail | null> {
  const key = encodeURIComponent(slugOrId);
  try {
    const body = await apiClient.get<unknown>(`/v1/packages/${key}`);
    const row = unwrapObject(body);
    if (!row) return null;
    const card = recordToCard(row, locale);
    if (!card) return null;
    const price = row.price != null ? String(row.price) : null;
    const currency = typeof row.currency === "string" ? row.currency : null;
    const category = categoryRecordFromPackage(row);
    return {
      ...card,
      currency,
      price,
      imageUrl:
        typeof row.image === "string" && row.image.trim()
          ? mediaUrlFromApi(row.image)
          : iconImageFromRecord(row),
      metaTitle: seoString(row, "meta_title"),
      metaDescription: seoString(row, "meta_description"),
      metaKeywords: seoString(row, "meta_keywords"),
      canonicalUrl: pickString(row.canonical_url) || null,
      createdAt: typeof row.created_at === "string" ? row.created_at : null,
      updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
      category: category ? recordToCategory(category, locale) : null,
      features: parseFeatures(row.features, locale),
    };
  } catch {
    const list = await fetchPublicPackages(locale);
    const hit = list.find((p) => p.slug === slugOrId || p.id === slugOrId);
    if (!hit) return null;
    return {
      ...hit,
      currency: null,
      price: hit.priceLabel || null,
      imageUrl: hit.iconImageUrl,
      metaTitle: null,
      metaDescription: null,
      metaKeywords: null,
      canonicalUrl: null,
      createdAt: null,
      updatedAt: null,
      category: null,
      features: [],
    };
  }
}
