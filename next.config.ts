import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
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