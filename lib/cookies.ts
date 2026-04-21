/**
 * Universal cookie retriever that works on both Server and Client environments.
 */
export async function getAuthToken(): Promise<string | undefined> {
  const isServer = typeof window === "undefined";

  if (isServer) {
    try {
      // ✅ Dynamic import to prevent next/headers from leaking into client bundles
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get("auth_token")?.value;
    } catch (error) {
      console.warn("Server-side cookie access failed:", error);
      return undefined;
    }
  }

  // ✅ Client-side fallback using document.cookie
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^|;)\s*auth_token\s*=\s*([^;]+)/);
    return match ? decodeURIComponent(match[2]) : undefined;
  }

  return undefined;
}
