import { NO_CACHE_HEADER_ENTRIES } from "./lib/no-cache-headers";
import { SECURITY_RESPONSE_HEADERS } from "./lib/security-headers";
import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const SEO_ROUTE_SOURCES = [
  "/robots.txt",
  "/sitemap.xml",
  "/pages-ar.xml",
  "/pages-en.xml",
  "/posts-ar.xml",
  "/posts-en.xml",
] as const;

const nextConfig: NextConfig = {
  async headers() {
    return [
      ...SEO_ROUTE_SOURCES.map((source) => ({
        source,
        headers: [...NO_CACHE_HEADER_ENTRIES],
      })),
      {
        source: "/:path*",
        headers: [...SECURITY_RESPONSE_HEADERS],
      },
      {
        source: "/_next/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "howeyah.subcodeco.com",
      },
      {
        protocol: "http",
        hostname: "howeyah.subcodeco.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);