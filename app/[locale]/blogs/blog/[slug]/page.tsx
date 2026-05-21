import { blogPostHref } from "@/features/blogs/lib/blog-routes";
import type { Locale } from "next-intl";
import { permanentRedirect } from "next/navigation";

/** Permanent redirect from legacy `/blogs/blog/{slug}` to `/blogs/{slug}`. */
export default async function LegacyBlogPostRedirect({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  permanentRedirect(blogPostHref(locale, slug));
}
