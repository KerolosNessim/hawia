import type { BlogCardPayload } from "@/features/blogs/lib/blog-card-payload";
import { blogPostPath } from "@/features/blogs/lib/blog-routes";
import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { apiClient } from "@/lib/api";
import { completeLaravelPaginationMeta, type LaravelPaginationMeta } from "@/lib/laravel-pagination";
import type { Locale } from "next-intl";

type PublicAuthorRelatedBlog = {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  published_at: string | null;
};

export type PublicAuthor = {
  id: number;
  slug: string;
  name: string;
  job_title: string | null;
  bio: string;
  image: string | null;
  image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  related_blogs: PublicAuthorRelatedBlog[];
  related_blogs_meta: LaravelPaginationMeta;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function normalizeAuthorBlog(raw: Record<string, unknown>): PublicAuthorRelatedBlog | null {
  const idRaw = raw.id;
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  if ((typeof idRaw !== "number" && typeof idRaw !== "string") || !slug) return null;
  const id = typeof idRaw === "number" ? idRaw : Number(idRaw);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    title: typeof raw.title === "string" ? raw.title : "",
    slug,
    description: typeof raw.description === "string" ? raw.description : "",
    image: typeof raw.image === "string" ? raw.image : null,
    published_at: typeof raw.published_at === "string" ? raw.published_at : null,
  };
}

function normalizeAuthor(
  raw: Record<string, unknown>,
  relatedMetaRaw: Record<string, unknown>,
  paginationPath: string,
): PublicAuthor | null {
  const idRaw = raw.id;
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  if ((typeof idRaw !== "number" && typeof idRaw !== "string") || !slug) return null;
  const id = typeof idRaw === "number" ? idRaw : Number(idRaw);
  if (!Number.isFinite(id)) return null;
  const relatedRaw = Array.isArray(raw.related_blogs) ? raw.related_blogs : [];
  const related_blogs_meta =
    completeLaravelPaginationMeta(relatedMetaRaw, paginationPath) ??
    completeLaravelPaginationMeta(
      {
        current_page: 1,
        last_page: 1,
        per_page: relatedRaw.length || 10,
        total: relatedRaw.length,
      },
      paginationPath,
    )!;

  return {
    id,
    slug,
    name: typeof raw.name === "string" ? raw.name : "",
    job_title: typeof raw.job_title === "string" ? raw.job_title : null,
    bio: typeof raw.bio === "string" ? raw.bio : "",
    image: typeof raw.image === "string" ? raw.image : null,
    image_alt: typeof raw.image_alt === "string" ? raw.image_alt : null,
    meta_title: typeof raw.meta_title === "string" ? raw.meta_title : null,
    meta_description: typeof raw.meta_description === "string" ? raw.meta_description : null,
    related_blogs: relatedRaw
      .map((row) => normalizeAuthorBlog(asRecord(row) ?? {}))
      .filter((b): b is PublicAuthorRelatedBlog => b != null),
    related_blogs_meta,
  };
}

export async function fetchPublicAuthorBySlug(
  slugParam: string,
  params?: { page?: number; per_page?: number; paginationPath?: string },
): Promise<PublicAuthor | null> {
  const slug = decodePathSegment(slugParam);
  if (!slug) return null;
  try {
    const paginationPath = params?.paginationPath || `/authors/${encodeURIComponent(slug)}`;
    const query: Record<string, string> = {};
    if (params?.page && params.page > 0) query.page = String(params.page);
    if (params?.per_page && params.per_page > 0) query.per_page = String(params.per_page);

    const raw = await apiClient.get<unknown>(`/v1/authors/${encodeURIComponent(slug)}`, {
      query: Object.keys(query).length ? query : undefined,
    });
    const rec = asRecord(raw);
    if (!rec) return null;
    const data = asRecord(rec.data);
    if (!data) return null;
    const authorRaw = asRecord(data.author);
    if (!authorRaw) return null;
    const relatedBlock = asRecord(data.related_blogs);
    const relatedRows = Array.isArray(relatedBlock?.data) ? relatedBlock.data : [];
    const relatedMeta = asRecord(relatedBlock?.meta) ?? {};
    return normalizeAuthor(
      {
        ...authorRaw,
        related_blogs: relatedRows,
      },
      relatedMeta,
      paginationPath,
    );
  } catch {
    return null;
  }
}

export function authorRelatedBlogsToCards(
  blogs: PublicAuthorRelatedBlog[],
  locale: Locale,
): BlogCardPayload[] {
  return blogs.slice(0, 6).map((b) => {
    let date = "—";
    if (b.published_at) {
      try {
        date = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(b.published_at));
      } catch {
        date = b.published_at;
      }
    }
    return {
      title: b.title,
      description: b.description,
      date,
      image: resolveMediaUrl(b.image),
      link: blogPostPath(b.slug),
    };
  });
}
