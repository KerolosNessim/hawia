import { buildPostsSitemapEntries, generateUrlsetXml } from "@/lib/sitemap-utils";
import { withSecurityHeaders } from "@/lib/security-headers";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const entries = await buildPostsSitemapEntries("ar");
  const xml = generateUrlsetXml(entries);

  return new Response(
    xml,
    withSecurityHeaders({
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    }),
  );
}
