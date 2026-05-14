import { getBaseUrl, generateUrlsetXml, SitemapEntry } from "@/lib/sitemap-utils";

export const revalidate = 3600;

export async function GET() {
  const baseUrl = getBaseUrl();
  const locale = "en";
  const now = new Date();

  const entries: SitemapEntry[] = [
    { url: `${baseUrl}/${locale}`, priority: 1.0, changeFrequency: "daily", lastModified: now },
    { url: `${baseUrl}/${locale}/about`, priority: 0.8, changeFrequency: "monthly", lastModified: now },
    { url: `${baseUrl}/${locale}/contact-us`, priority: 0.8, changeFrequency: "monthly", lastModified: now },
    { url: `${baseUrl}/${locale}/faq`, priority: 0.8, changeFrequency: "weekly", lastModified: now },
    { url: `${baseUrl}/${locale}/courses`, priority: 0.9, changeFrequency: "daily", lastModified: now },
    { url: `${baseUrl}/${locale}/packages`, priority: 0.9, changeFrequency: "daily", lastModified: now },
    { url: `${baseUrl}/${locale}/blogs`, priority: 0.9, changeFrequency: "daily", lastModified: now },
    { url: `${baseUrl}/${locale}/clients`, priority: 0.9, changeFrequency: "daily", lastModified: now },
    { url: `${baseUrl}/${locale}/privacy-policy`, priority: 0.5, changeFrequency: "yearly", lastModified: now },
    { url: `${baseUrl}/${locale}/refund-policy`, priority: 0.5, changeFrequency: "yearly", lastModified: now },
    { url: `${baseUrl}/${locale}/terms-of-use`, priority: 0.5, changeFrequency: "yearly", lastModified: now },
    { url: `${baseUrl}/${locale}/login`, priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { url: `${baseUrl}/${locale}/register`, priority: 0.7, changeFrequency: "monthly", lastModified: now },
  ];

  const xml = generateUrlsetXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
