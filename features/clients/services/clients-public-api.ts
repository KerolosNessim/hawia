import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { apiClient } from "@/lib/api";

export type PublicSolutionCategory = {
  id: string;
  slug: string;
  name: string;
};

/** Category card for the home “client samples” grid (`/v1/solutions/categories`). */
export type PublicSolutionCategoryCard = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  href?: string;
};

export type SolutionCategoriesSectionData = {
  title: string;
  descriptionHtml: string;
  categories: PublicSolutionCategoryCard[];
};

export type PublicClientCard = {
  id: string;
  slug: string;
  title: string;
  descriptionHtml: string;
  descriptionPlain: string;
  imageUrl: string;
  imageUrls: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  categoryIds: string[];
  categorySlugs: string[];
};

export type FetchPublicClientsOptions = {
  categorySlug?: string;
  countryId?: number;
};

export type PublicClientsPageData = {
  id: string;
  title: string;
  description: string;
  clients: PublicClientCard[];
};

function appendCountryQuery(
  query: Record<string, string>,
  countryId: number | undefined,
): Record<string, string> {
  if (countryId != null && countryId > 0) {
    query.country_id = String(countryId);
  }
  return query;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapObject(body: unknown): Record<string, unknown> | null {
  const root = asRecord(body);
  if (!root) return null;
  return asRecord(root.data) ?? root;
}

function unwrapArray(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  const root = asRecord(body);
  if (!root) return [];
  const inner = root.data ?? root.singles ?? root.results ?? root.items;
  if (Array.isArray(inner)) return inner as Record<string, unknown>[];
  const nested = asRecord(inner);
  if (!nested) return [];
  const nestedRows = nested.data ?? nested.singles ?? nested.results ?? nested.items;
  return Array.isArray(nestedRows) ? (nestedRows as Record<string, unknown>[]) : [];
}

function pickLoc(field: unknown, locale: string): string {
  if (field == null) return "";
  if (typeof field === "string") return field.trim();
  const record = asRecord(field);
  if (!record) return "";
  const ar = typeof record.ar === "string" ? record.ar.trim() : "";
  const en = typeof record.en === "string" ? record.en.trim() : "";
  return locale.startsWith("ar") ? ar || en : en || ar;
}

function pickString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function mediaUrlFromApi(path: unknown): string {
  const raw = pickString(path);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const origin = base.replace(/\/?api$/i, "");
  if (!origin) return raw;
  return raw.startsWith("/") ? `${origin}${raw}` : `${origin}/${raw}`;
}

export function plainTextFromHtml(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function seoString(row: Record<string, unknown>, key: "meta_title" | "meta_description"): string | null {
  const direct = pickString(row[key]);
  if (direct) return direct;
  const seo = asRecord(row.seo);
  const nested = pickString(seo?.[key]);
  return nested || null;
}

function imageUrlsFromRecord(row: Record<string, unknown>): string[] {
  const urls: string[] = [];
  const main = mediaUrlFromApi(row.image ?? row.image_url ?? row.thumbnail);
  if (main) urls.push(main);
  const images = Array.isArray(row.images) ? row.images : [];
  for (const image of images) {
    const imageRecord = asRecord(image);
    const url = imageRecord ? mediaUrlFromApi(imageRecord.url ?? imageRecord.path) : mediaUrlFromApi(image);
    if (url && !urls.includes(url)) urls.push(url);
  }
  return urls.filter(Boolean);
}

function categoryFromRecord(
  row: Record<string, unknown>,
  locale: string,
): { id: string | null; slug: string | null; name: string | null; ids: string[]; slugs: string[] } {
  const categoryRows = [
    row.category,
    row.solution_category,
    ...(Array.isArray(row.categories) ? row.categories : []),
    ...(Array.isArray(row.solution_categories) ? row.solution_categories : []),
  ]
    .map(asRecord)
    .filter((item): item is Record<string, unknown> => item != null);

  const ids = new Set<string>();
  const slugs = new Set<string>();
  let name = "";

  for (const category of categoryRows) {
    if (category.id != null && String(category.id).trim()) ids.add(String(category.id).trim());
    const slug = pickCategorySlug(category, locale);
    if (slug) slugs.add(slug);
    if (!name) name = pickLoc(category.title, locale) || pickLoc(category.name, locale);
  }

  for (const key of ["category_id", "solution_category_id"]) {
    const value = row[key];
    if (value != null && String(value).trim()) ids.add(String(value).trim());
  }

  for (const key of ["category_slug", "solution_category_slug"]) {
    const value = pickLoc(row[key], locale) || pickString(row[key]);
    if (value) slugs.add(value);
  }

  const id = ids.values().next().value ?? null;
  const slug = slugs.values().next().value ?? null;
  return {
    id,
    slug,
    name: name || null,
    ids: [...ids],
    slugs: [...slugs],
  };
}

function recordToClient(row: Record<string, unknown>, locale: string): PublicClientCard | null {
  const id = row.id != null ? String(row.id) : "";
  if (!id) return null;
  const active = row.is_active ?? row.isActive;
  if (active === false || active === 0 || active === "0") return null;

  const content = asRecord(row.content);
  const slug = pickLoc(row.slug, locale) || id;
  const title = pickLoc(row.title ?? content?.title, locale);
  const descriptionHtml = pickLoc(row.description ?? content?.description, locale);
  const images = imageUrlsFromRecord(row);
  const category = categoryFromRecord(row, locale);

  return {
    id,
    slug,
    title: title || slug,
    descriptionHtml,
    descriptionPlain: plainTextFromHtml(descriptionHtml),
    imageUrl: images[0] || "/hero-bg.webp",
    imageUrls: images,
    metaTitle: seoString(row, "meta_title"),
    metaDescription: seoString(row, "meta_description"),
    categoryId: category.id,
    categorySlug: category.slug,
    categoryName: category.name,
    categoryIds: category.ids,
    categorySlugs: category.slugs,
  };
}

function pickCategorySlug(row: Record<string, unknown>, locale: string): string {
  return (
    pickLoc(row.slugs, locale) ||
    pickLoc(row.slug_local, locale) ||
    pickLoc(row.slug, locale) ||
    pickString(row.slug)
  );
}

function categoryRowFromApi(row: Record<string, unknown>, locale: string): PublicSolutionCategory | null {
  const id = row.id != null ? String(row.id) : "";
  if (!id) return null;
  const active = row.is_active ?? row.isActive;
  if (active === false || active === 0 || active === "0") return null;
  const slug = pickCategorySlug(row, locale);
  const name = pickLoc(row.title, locale) || pickLoc(row.name, locale);
  if (!slug && !name) return null;
  return { id, slug: slug || id, name: name || slug || id };
}

function categoryCardFromApi(
  row: Record<string, unknown>,
  locale: string,
): PublicSolutionCategoryCard | null {
  const id = row.id != null ? String(row.id) : "";
  if (!id) return null;
  const active = row.is_active ?? row.isActive;
  if (active === false || active === 0 || active === "0") return null;

  const slug = pickCategorySlug(row, locale) || id;
  const title =
    pickLoc(row.title, locale) || pickLoc(row.name, locale) || slug;
  const media = asRecord(row.media);
  const imageUrl =
    mediaUrlFromApi(media?.image ?? row.image) || "/hero-bg.webp";
  const imageAltRaw = media?.image_alt ?? row.image_alt;
  const imageAlt =
    typeof imageAltRaw === "string"
      ? imageAltRaw.trim()
      : pickLoc(imageAltRaw, locale) || title;

  return { id, slug, title, imageUrl, imageAlt, href: `/clients?category=${encodeURIComponent(slug)}` };
}

function sectionContentFromApi(
  body: unknown,
  locale: string,
): { title: string; descriptionHtml: string } {
  const root = asRecord(body);
  const block = asRecord(root?.data) ?? root;
  const content = asRecord(block?.content);
  return {
    title: pickLoc(content?.title, locale) || pickString(content?.title),
    descriptionHtml:
      pickLoc(content?.description, locale) || pickString(content?.description),
  };
}

/** Home ads / samples block: section heading + category cards from `GET /v1/solutions/categories`. */
export async function fetchSolutionCategoriesSection(
  locale: string,
  options?: { countryId?: number },
): Promise<SolutionCategoriesSectionData | null> {
  try {
    const body = await apiClient.get<unknown>("/v1/solutions/categories", {
      query: appendCountryQuery({ per_page: "100" }, options?.countryId),
    });
    const { title, descriptionHtml } = sectionContentFromApi(body, locale);
    const categories = unwrapArray(body)
      .map((row) => categoryCardFromApi(row, locale))
      .filter((c): c is PublicSolutionCategoryCard => c != null);
    if (categories.length === 0) {
      const clients = await fetchPublicClients(locale, options);
      categories.push(
        ...clients.slice(0, 8).map((client) => ({
          id: client.id,
          slug: client.slug,
          title: client.title,
          imageUrl: client.imageUrl,
          imageAlt: client.title,
          href: `/clients/${encodeURIComponent(client.slug)}`,
        })),
      );
    }

    if (!title && categories.length === 0) return null;

    return {
      title,
      descriptionHtml,
      categories,
    };
  } catch {
    return null;
  }
}

export async function fetchPublicSolutionCategories(
  locale: string,
  options?: { countryId?: number },
): Promise<PublicSolutionCategory[]> {
  try {
    const body = await apiClient.get<unknown>("/v1/solutions/categories", {
      query: appendCountryQuery({ per_page: "100" }, options?.countryId),
    });
    return unwrapArray(body)
      .map((row) => categoryRowFromApi(row, locale))
      .filter((c): c is PublicSolutionCategory => c != null);
  } catch {
    return [];
  }
}

export function countClientsByCategorySlug(
  clients: PublicClientCard[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const client of clients) {
    const slugs = client.categorySlugs.length
      ? client.categorySlugs
      : client.categorySlug
        ? [client.categorySlug]
        : [];
    for (const slug of slugs) {
      if (!slug.trim()) continue;
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return counts;
}

function categoryMatches(client: PublicClientCard, category: PublicSolutionCategory): boolean {
  const slug = category.slug.trim();
  const id = category.id.trim();
  return (
    (slug ? client.categorySlugs.includes(slug) || client.categorySlug === slug : false) ||
    (id ? client.categoryIds.includes(id) || client.categoryId === id : false)
  );
}

export function filterClientsByCategorySlug(
  clients: PublicClientCard[],
  categorySlug: string | null | undefined,
  categories: PublicSolutionCategory[] = [],
): PublicClientCard[] {
  const slug = categorySlug?.trim();
  if (!slug) return clients;
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return clients.filter((c) => c.categorySlugs.includes(slug) || c.categorySlug === slug);
  }
  return clients.filter((client) => categoryMatches(client, category));
}

export async function fetchPublicClients(
  locale: string,
  options?: FetchPublicClientsOptions,
): Promise<PublicClientCard[]> {
  try {
    const query: Record<string, string> = {};
    const categorySlug = options?.categorySlug?.trim();
    const categories = categorySlug ? await fetchPublicSolutionCategories(locale, options) : [];
    const category = categories.find((c) => c.slug === categorySlug);
    if (categorySlug) {
      query.category_slug = categorySlug;
      query.category = categorySlug;
      if (category?.id) query.category_id = category.id;
    }
    appendCountryQuery(query, options?.countryId);
    const body = await apiClient.get<unknown>("/v1/solutions/singles", {
      ...(Object.keys(query).length ? { query } : {}),
    });
    const clients = unwrapArray(body)
      .map((row) => recordToClient(row, locale))
      .filter((client): client is PublicClientCard => client != null);
    if (categorySlug) {
      return filterClientsByCategorySlug(clients, categorySlug, categories);
    }
    return clients;
  } catch {
    return [];
  }
}

export async function fetchPublicClientsPageData(
  locale: string,
  options?: FetchPublicClientsOptions,
): Promise<PublicClientsPageData> {
  try {
    const body = await apiClient.get<unknown>("/v1/solutions");
    const row = unwrapObject(body);
    const content = asRecord(row?.content);
    let clients = unwrapArray(row?.singles)
      .map((single) => recordToClient(single, locale))
      .filter((client): client is PublicClientCard => client != null);

    if (!clients.length) {
      clients = await fetchPublicClients(locale, options);
    } else if (options?.categorySlug?.trim()) {
      const categories = await fetchPublicSolutionCategories(locale, options);
      clients = filterClientsByCategorySlug(clients, options.categorySlug, categories);
    }

    return {
      id: row?.id != null ? String(row.id) : "",
      title: pickLoc(row?.title ?? content?.title, locale),
      description: plainTextFromHtml(pickLoc(row?.description ?? content?.description, locale)),
      clients,
    };
  } catch {
    return {
      id: "",
      title: "",
      description: "",
      clients: await fetchPublicClients(locale, options),
    };
  }
}

export async function fetchPublicClientDetail(
  slugOrId: string,
  locale: string,
  options?: { countryId?: number },
): Promise<PublicClientCard | null> {
  const decoded = decodePathSegment(slugOrId);
  try {
    const body = await apiClient.get<unknown>(`/v1/solutions/singles/${encodeURIComponent(decoded)}`);
    const row = unwrapObject(body);
    return row ? recordToClient(row, locale) : null;
  } catch {
    const clients = await fetchPublicClients(locale, options);
    return clients.find((client) => client.slug === decoded || client.id === decoded) ?? null;
  }
}
