import { getBaseUrl, fetchAllSlugs, generateUrlsetXml, SitemapEntry } from "@/lib/sitemap-utils";

export const revalidate = 3600;

export async function GET() {
  const baseUrl = getBaseUrl();
  const locale = "en";
  const now = new Date();
  const slugData = await fetchAllSlugs();

  const entries: SitemapEntry[] = [];

  const addDynamicEntries = (
    slugs: string[] | undefined,
    routePrefix: string,
    priority: number,
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  ) => {
    if (!slugs || !Array.isArray(slugs)) return;
    for (const slug of slugs) {
      if (!slug) continue;
      entries.push({
        url: `${baseUrl}/${locale}/${routePrefix}/${encodeURIComponent(slug)}`,
        lastModified: now,
        changeFrequency,
        priority,
      });
    }
  };

  addDynamicEntries(slugData.services, "services", 0.9, "weekly");
  addDynamicEntries(slugData.packages, "packages", 0.8, "weekly");
  addDynamicEntries(slugData.package_categories, "packages/categories", 0.8, "weekly");
  addDynamicEntries(slugData.courses, "courses", 0.8, "weekly");
  addDynamicEntries(slugData.blogs, "blogs/blog", 0.7, "weekly");
  addDynamicEntries(slugData.blog_categories, "blogs", 0.7, "weekly");
  addDynamicEntries(slugData.solutions, "clients", 0.8, "weekly");

  const xml = generateUrlsetXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
