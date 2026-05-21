import { localePath } from "@/features/blogs/lib/blog-routes";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { SingleService } from "../types";

function stripHtmlToPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function absoluteUrlFromPath(path: string): Promise<string> {
  if (path.startsWith("http")) return path;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return path;
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function buildServiceMetadata(
  service: SingleService,
  locale: Locale,
): Promise<Metadata> {
  const og = service.social?.open_graph;
  const tw = service.social?.twitter;

  const title = service.meta_title?.trim() || og?.title?.trim() || service.title;
  const descriptionRaw =
    service.meta_description?.trim() ||
    og?.description?.trim() ||
    tw?.description?.trim() ||
    service.description;
  const description = stripHtmlToPlainText(descriptionRaw).slice(0, 160);

  const slug = service.slug_local?.[locale === "ar" ? "ar" : "en"] ?? service.slug;
  const canonicalPath = localePath(locale, `/services/${encodeURIComponent(slug)}`);
  const canonical = await absoluteUrlFromPath(canonicalPath);

  const image = og?.image || tw?.image || service.image;
  const images = image ? [{ url: image, alt: service.image_alt || title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: og?.title?.trim() || title,
      description: og?.description ? stripHtmlToPlainText(og.description).slice(0, 160) : description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: (og?.type as "website") || "website",
      url: canonical,
      siteName: og?.site_name,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: (tw?.card as "summary_large_image") || "summary_large_image",
      title: tw?.title?.trim() || title,
      description: tw?.description ? stripHtmlToPlainText(tw.description).slice(0, 160) : description,
      ...(images ? { images: [images[0].url] } : {}),
    },
  };
}
