import type { PublicBlog, PublicBlogCategory } from "@/features/blogs/server/public-blogs";
import { plainTextFromHtml } from "@/features/blogs/server/public-blogs";

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
