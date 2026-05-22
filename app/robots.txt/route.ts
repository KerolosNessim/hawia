import { getScripts } from "@/features/settings/services/settings-service";
import { withSecurityHeaders } from "@/lib/security-headers";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const scriptsResponse = await getScripts().catch(() => null);
  const robotsTxt = scriptsResponse?.data?.robots_txt;

  const responseHeaders = {
    "Content-Type": "text/plain; charset=utf-8",
  };

  if (!robotsTxt) {
    return new Response(
      "User-agent: *\nAllow: /",
      withSecurityHeaders({ headers: responseHeaders }),
    );
  }

  return new Response(robotsTxt, withSecurityHeaders({ headers: responseHeaders }));
}
