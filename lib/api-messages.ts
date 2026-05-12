import type { AppLocale } from "./api-locale";

const GENERIC_API_ERROR: Record<AppLocale, string> = {
  en: "Something went wrong. Please try again.",
  ar: "حدث خطأ. يرجى المحاولة مرة أخرى.",
};

export function getGenericApiErrorMessage(locale: AppLocale): string {
  return GENERIC_API_ERROR[locale];
}
