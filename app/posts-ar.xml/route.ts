import { buildPostsSitemapEntries, generateUrlsetXml } from "@/lib/sitemap-utils";

export const revalidate = 3600;

export async function GET() {
  const entries = await buildPostsSitemapEntries("ar");
  const xml = generateUrlsetXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
