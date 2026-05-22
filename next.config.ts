import { SECURITY_RESPONSE_HEADERS } from "./lib/security-headers";
import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_RESPONSE_HEADERS],
      },
      {
        source: "/_next/:path*",
        headers: [...SECURITY_RESPONSE_HEADERS],
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