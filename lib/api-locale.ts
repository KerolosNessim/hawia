export type AppLocale = "en" | "ar";

export async function resolveRequestLocale(): Promise<AppLocale> {
  try {
    if (typeof window === "undefined") {
      const { getLocale } = await import("next-intl/server");
      const l = await getLocale();
      return l === "en" ? "en" : "ar";
    }
    const lang = document.documentElement.lang || "ar";
    return lang === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}
