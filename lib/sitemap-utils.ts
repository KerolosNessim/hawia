export type AllSlugsResponse = {
  status: string | boolean;
  message: string;
  data: {
    blogs?: string[];
    blog_categories?: string[];
    services?: string[];
    solutions?: string[];
    solution_categories?: string[];
    courses?: string[];
    faq_categories?: string[];
    packages?: string[];
    package_categories?: string[];
    legal_pages?: string[];
    generic_categories?: string[];
    why_choose_us?: string[];
    accreditations?: string[];
  };
};

import {
  blogCategoryPath,
  blogPostPath,
  localePath,
} from "@/features/blogs/lib/blog-routes";
import type { Locale } from "next-intl";

export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://hawia.vercel.app";
}

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "https://howeyah.subcodeco.com/api";
}

export async function fetchAllSlugs(): Promise<AllSlugsResponse["data"]> {
  try {
    const res = await fetch(`${getApiUrl()}/v1/all-slugs`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = (await res.json()) as AllSlugsResponse;
      if (json && json.data) {
        return json.data;
      }
    }
  } catch (error) {
    console.error("Failed to fetch all-slugs for sitemap:", error);
  }
  return {};
}

/** Blog index, category pages, and article URLs for `posts-{locale}.xml`. */
export async function buildPostsSitemapEntries(locale: Locale): Promise<SitemapEntry[]> {
  const baseUrl = getBaseUrl();
  const now = new Date();
  const slugData = await fetchAllSlugs();
  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];

  const push = (pathname: string, priority: number, changeFrequency: SitemapEntry["changeFrequency"]) => {
    const url = `${baseUrl}${localePath(locale, pathname)}`;
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({ url, lastModified: now, changeFrequency, priority });
  };

  push("/blogs", 0.9, "daily");

  for (const slug of slugData.blog_categories ?? []) {
    if (!slug) continue;
    push(blogCategoryPath(slug), 0.8, "weekly");
  }

  for (const slug of slugData.blogs ?? []) {
    if (!slug) continue;
    push(blogPostPath(slug), 0.7, "weekly");
  }

  return entries;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateUrlsetXml(entries: SitemapEntry[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(entry.url)}</loc>\n`;
    if (entry.lastModified) {
      xml += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
    }
    if (entry.changeFrequency) {
      xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
    }
    if (entry.priority !== undefined) {
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}
