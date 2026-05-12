import { apiClient } from "@/lib/api";

export type PublicPackageCategory = {
  id: string;
  title: string;
  sortOrder: number;
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
};

export type PublicPackageDetail = PublicPackageCard & {
  features: { title: string; isIncluded: boolean }[];
  currency: string | null;
  price: string | null;
};

export type PackagesSectionPayload = {
  categories: PublicPackageCategory[];
  packagesByCategoryId: Record<string, PublicPackageCard[]>;
  uncategorized: PublicPackageCard[];
};

function unwrapArray(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (body && typeof body === "object") {
    const p = body as Record<string, unknown>;
    const inner = p.data ?? p.packages ?? p.results ?? p.items;
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
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

function readSlug(r: Record<string, unknown>): string {
  const s = r.slug;
  return typeof s === "string" && s.trim() ? s.trim() : "";
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

function recordToCard(r: Record<string, unknown>, locale: string): PublicPackageCard | null {
  const id = readId(r);
  if (!id) return null;
  const slug = readSlug(r);
  return {
    id,
    slug: slug || id,
    title: pickLoc(r.title, locale),
    description: pickLoc(r.description, locale),
    buttonText: pickLoc(r.button_text ?? r.cta_label, locale) || "—",
    detailsUrl:
      typeof r.details_url === "string" && r.details_url.trim() ? r.details_url.trim() : null,
    isFeatured: Boolean(r.is_featured ?? r.is_popular ?? false),
    iconPreset: iconPresetFromRecord(r),
    iconImageUrl: iconImageFromRecord(r),
    priceLabel: priceLabelFromRecord(r),
    categoryId: categoryIdFromPackage(r),
  };
}

export async function fetchPublicPackageCategories(locale: string): Promise<PublicPackageCategory[]> {
  try {
    const body = await apiClient.get<unknown>("/v1/packages/categories");
    const rows = unwrapArray(body);
    return rows
      .map((r) => {
        const id = readId(r);
        if (!id) return null;
        const active = r.is_active ?? r.isActive;
        if (active === false || active === 0 || active === "0") return null;
        return {
          id,
          title: pickLoc(r.title ?? r.name, locale),
          sortOrder: Number(r.sort_order ?? 0) || 0,
        };
      })
      .filter((x): x is PublicPackageCategory => x != null)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

export async function fetchPublicPackages(locale: string): Promise<PublicPackageCard[]> {
  try {
    const body = await apiClient.get<unknown>("/v1/packages");
    const rows = unwrapArray(body);
    return rows
      .map((r) => recordToCard(r, locale))
      .filter((x): x is PublicPackageCard => x != null);
  } catch {
    return [];
  }
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
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      title: pickLoc(item.title, locale),
      isIncluded: Boolean(item.is_included ?? item.isIncluded ?? true),
    }))
    .filter((f) => f.title.length > 0);
}

export async function fetchPublicPackageDetail(
  slugOrId: string,
  locale: string,
): Promise<PublicPackageDetail | null> {
  const key = encodeURIComponent(slugOrId);
  try {
    const body = await apiClient.get<unknown>(`/v1/packages/${key}`);
    let row: Record<string, unknown> | null = null;
    if (body && typeof body === "object") {
      const p = body as Record<string, unknown>;
      const d = p.data;
      if (d && typeof d === "object" && !Array.isArray(d)) row = d as Record<string, unknown>;
      else row = p;
    }
    if (!row) return null;
    const card = recordToCard(row, locale);
    if (!card) return null;
    const price = row.price != null ? String(row.price) : null;
    const currency = typeof row.currency === "string" ? row.currency : null;
    return {
      ...card,
      currency,
      price,
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
      features: [],
    };
  }
}
