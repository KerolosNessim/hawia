import { getScripts } from "@/features/settings/services/settings-service";

export const revalidate = 3600;

export async function GET() {
  const scriptsResponse = await getScripts().catch(() => null);
  const robotsTxt = scriptsResponse?.data?.robots_txt;

  if (!robotsTxt) {
    return new Response("User-agent: *\nAllow: /", {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
