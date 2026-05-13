import { apiClient } from "@/lib/api";

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
};

export type PublicClientsPageData = {
  id: string;
  title: string;
  description: string;
  clients: PublicClientCard[];
};

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
  return urls;
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
  };
}

export async function fetchPublicClients(locale: string): Promise<PublicClientCard[]> {
  try {
    const body = await apiClient.get<unknown>("/v1/solutions/singles");
    return unwrapArray(body)
      .map((row) => recordToClient(row, locale))
      .filter((client): client is PublicClientCard => client != null);
  } catch {
    return [];
  }
}

export async function fetchPublicClientsPageData(locale: string): Promise<PublicClientsPageData> {
  try {
    const body = await apiClient.get<unknown>("/v1/solutions");
    const row = unwrapObject(body);
    const content = asRecord(row?.content);
    const clients = unwrapArray(row?.singles)
      .map((single) => recordToClient(single, locale))
      .filter((client): client is PublicClientCard => client != null);

    return {
      id: row?.id != null ? String(row.id) : "",
      title: pickLoc(row?.title ?? content?.title, locale),
      description: plainTextFromHtml(pickLoc(row?.description ?? content?.description, locale)),
      clients: clients.length ? clients : await fetchPublicClients(locale),
    };
  } catch {
    return {
      id: "",
      title: "",
      description: "",
      clients: await fetchPublicClients(locale),
    };
  }
}

export async function fetchPublicClientDetail(
  slugOrId: string,
  locale: string,
): Promise<PublicClientCard | null> {
  const decoded = decodeURIComponent(slugOrId);
  try {
    const body = await apiClient.get<unknown>(`/v1/solutions/singles/${encodeURIComponent(decoded)}`);
    const row = unwrapObject(body);
    return row ? recordToClient(row, locale) : null;
  } catch {
    const clients = await fetchPublicClients(locale);
    return clients.find((client) => client.slug === decoded || client.id === decoded) ?? null;
  }
}
