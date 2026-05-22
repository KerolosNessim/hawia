import { ofetch } from "ofetch";
import { CONFIG } from "@/config";
import { getAuthToken } from "./cookies";

export class ApiError extends Error {
  validationErrors?: Record<string, string[] | string>;

  constructor(message: string | Record<string, string[] | string>) {
    if (typeof message === "string") {
      super(message);
      this.message = message;
    } else {
      super("Validation Error");
      this.validationErrors = message;
    }
    this.name = "ApiError";
  }
}

function toAcceptLanguageTag(locale: string | undefined): "ar" | "en" {
  const raw = (locale ?? "ar").toLowerCase();
  return raw.startsWith("ar") ? "ar" : "en";
}

export const api = ofetch.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || CONFIG.BACK_URL,
  cache: "no-store",
  next: { revalidate: 0 },

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  async onResponse({ response }) {
    const data = response._data;

    if (data?.status === "false" || data?.status === false) {
      throw new ApiError(data.message);
    }
  },

  async onResponseError({ response }) {
    const data = response._data;
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        const { useAuthStore } = await import("@/features/auth/store/auth-store");
        const { removeAuthToken } = await import("./cookies");
        useAuthStore.getState().logout();
        removeAuthToken();
        // Optional: redirect to login
        // window.location.href = "/login";
      }
    }

    const { resolveRequestLocale } = await import("./api-locale");
    const { getGenericApiErrorMessage } = await import("./api-messages");
    const locale = await resolveRequestLocale();
    throw new ApiError(data?.message || getGenericApiErrorMessage(locale));
  },


  async onRequest({ options }) {
    try {
      const isServer = typeof window === "undefined";
      options.headers = new Headers(options.headers as HeadersInit);

      // ✅ Always fetch token securely (Universal helper handles env check)
      const token = await getAuthToken();
      if (token) {
        options.headers.set("Authorization", `Bearer ${token}`);
      }

      // ✅ Add locale header (Environment-safe)
      let locale: string | undefined;

      if (isServer) {
        // Only import next-intl/server on the server
        const { getLocale } = await import("next-intl/server");
        locale = await getLocale();
      } else {
        // Client-side: try to get from HTML lang attribute
        locale = document.documentElement.lang || "ar";
      }

      options.headers.set("Accept-Language", toAcceptLanguageTag(locale));
      
    } catch (err) {
      console.error("Failed to attach auth headers:", err);
    }
  },
});

export const apiClient = {
  get: <T = any>(url: string, options?: any) =>
    api<T>(url, { method: "GET", ...options }),

  post: <T = any>(url: string, body?: any, options?: any) =>
    api<T>(url, { method: "POST", body, ...options }),

  put: <T = any>(url: string, body?: any, options?: any) =>
    api<T>(url, { method: "PUT", body, ...options }),

  patch: <T = any>(url: string, body?: any, options?: any) =>
    api<T>(url, { method: "PATCH", body, ...options }),

  delete: <T = any>(url: string, options?: any) =>
    api<T>(url, { method: "DELETE", ...options }),
};
