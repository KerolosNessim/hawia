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

export function setAuthToken(token: string, expires: number) {
  if (typeof document !== "undefined") {
    // expires is in seconds, convert to date
    const date = new Date();
    date.setTime(date.getTime() + expires * 1000);
    document.cookie = `auth_token=${token}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  }
}

export function removeAuthToken() {
  if (typeof document !== "undefined") {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
  }
}

