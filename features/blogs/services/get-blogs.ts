import type { BlogSlugFields } from "@/features/blogs/lib/blog-routes";
import { pickSlugLocal } from "@/features/services/lib/pick-localized-field";
import { apiClient } from "@/lib/api";

export type GetBlogsResponse = {
  data: BlogSlugFields[];
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function parseBlogListPage(raw: unknown): { rows: Record<string, unknown>[]; lastPage: number } {
  const rec = asRecord(raw);
  if (!rec) return { rows: [], lastPage: 1 };

  const status = rec.status;
  if (status === "false" || status === false) return { rows: [], lastPage: 1 };

  const dataVal = rec.data;
  if (Array.isArray(dataVal)) {
    return {
      rows: dataVal.map((row) => asRecord(row)).filter((row): row is Record<string, unknown> => row != null),
      lastPage: 1,
    };
  }

  if (dataVal && typeof dataVal === "object" && !Array.isArray(dataVal)) {
    const d = dataVal as Record<string, unknown>;
    const rows = Array.isArray(d.data)
      ? d.data.map((row) => asRecord(row)).filter((row): row is Record<string, unknown> => row != null)
      : [];
    const meta = asRecord(d.meta);
    const lastPage = Number(meta?.last_page ?? 1);
    return { rows, lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1 };
  }

  return { rows: [], lastPage: 1 };
}

function rowToSlugFields(row: Record<string, unknown>): BlogSlugFields | null {
  const slug = typeof row.slug === "string" ? row.slug.trim() : "";
  if (!slug) return null;
  return { slug, slug_local: pickSlugLocal(row) };
}

/** Loads blog slug refs for locale switching on detail pages. */
export async function getBlogs(_locale = "ar"): Promise<GetBlogsResponse> {
  const merged: BlogSlugFields[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const raw = await apiClient.get<unknown>("/v1/blogs", {
      query: { page: String(page), per_page: "100" },
    });
    const { rows, lastPage: lp } = parseBlogListPage(raw);
    lastPage = lp;

    for (const row of rows) {
      const fields = rowToSlugFields(row);
      if (fields) merged.push(fields);
    }

    page++;
  } while (page <= lastPage);

  return { data: merged };
}
