import localFont from "next/font/local";

/** Self-hosted Cairo (Arabic) — files in `app/fonts/cairo/`. */
export const cairoLocal = localFont({
  src: [
    {
      path: "../app/fonts/cairo/cairo-arabic-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../app/fonts/cairo/cairo-arabic-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../app/fonts/cairo/cairo-arabic-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../app/fonts/cairo/cairo-arabic-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../app/fonts/cairo/cairo-arabic-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../app/fonts/cairo/cairo-arabic-900-normal.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-cairo",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Segoe UI", "Tahoma", "sans-serif"],
});

/** Self-hosted Geist Sans variable — file in `app/fonts/geist/`. */
export const geistLocal = localFont({
  src: "../app/fonts/geist/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

/** Primary woff2 served from `/fonts/*` (public) for `<link rel="preload">`. */
export const fontPreloadByLocale = {
  ar: {
    href: "/fonts/cairo/cairo-arabic-400-normal.woff2",
    type: "font/woff2",
  },
  en: {
    href: "/fonts/geist/Geist-Variable.woff2",
    type: "font/woff2",
  },
} as const;
