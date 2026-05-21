import { getBaseUrl } from "@/lib/sitemap-utils";

export const revalidate = 3600;

export async function GET() {
  const baseUrl = getBaseUrl();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/pages-ar.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/pages-en.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/products-ar.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/products-en.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/posts-ar.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/posts-en.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
