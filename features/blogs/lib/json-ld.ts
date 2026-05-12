import type { PublicBlog, PublicBlogCategory } from "@/features/blogs/server/public-blogs";
import { plainTextFromHtml } from "@/features/blogs/server/public-blogs";

type JsonLd = Record<string, unknown>;

export function jsonLdScript(graph: JsonLd | JsonLd[]): string {
  const payload = Array.isArray(graph) ? { "@context": "https://schema.org", "@graph": graph } : graph;
  return JSON.stringify(payload);
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function buildBlogCategoryCollectionJsonLd(opts: {
  name: string;
  descriptionPlain: string;
  url: string;
  blogItems: { title: string; url: string; image?: string | null; datePublished?: string | null }[];
}): JsonLd[] {
  const itemList: JsonLd = {
    "@type": "ItemList",
    name: opts.name,
    description: opts.descriptionPlain,
    numberOfItems: opts.blogItems.length,
    itemListElement: opts.blogItems.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: b.url,
      name: b.title,
    })),
  };

  const collection: JsonLd = {
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.descriptionPlain,
    url: opts.url,
    isPartOf: { "@type": "WebSite", name: "Howeyah" },
    mainEntity: { "@id": `${opts.url}#itemlist` },
  };

  itemList["@id"] = `${opts.url}#itemlist`;

  return [collection, itemList];
}

export function buildBlogPostingJsonLd(opts: {
  url: string;
  headline: string;
  descriptionPlain: string;
  datePublished?: string | null;
  dateModified?: string | null;
  imageUrl?: string | null;
  authorName: string;
  keywords: string[];
  articleSection?: string | null;
  inLanguage: string;
}): JsonLd {
  const article: JsonLd = {
    "@type": "BlogPosting",
    "@id": `${opts.url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
    headline: opts.headline,
    description: opts.descriptionPlain,
    inLanguage: opts.inLanguage,
    author: { "@type": "Person", name: opts.authorName },
    publisher: { "@type": "Organization", name: "Howeyah" },
  };
  if (opts.datePublished) article.datePublished = opts.datePublished;
  if (opts.dateModified) article.dateModified = opts.dateModified;
  if (opts.imageUrl) article.image = [opts.imageUrl];
  if (opts.keywords.length) article.keywords = opts.keywords.join(", ");
  if (opts.articleSection) article.articleSection = opts.articleSection;
  return article;
}

export function blogExcerptPlain(blog: PublicBlog, title: string): string {
  const fromDesc = plainTextFromHtml(
    typeof blog.description === "string" ? blog.description : String(blog.description ?? ""),
  );
  if (fromDesc.trim()) return fromDesc.slice(0, 320);
  return plainTextFromHtml(title).slice(0, 320);
}

export function categoryDescriptionPlain(category: PublicBlogCategory): string {
  if (category.descriptionRich) return plainTextFromHtml(category.descriptionRich).slice(0, 500);
  return category.name;
}
