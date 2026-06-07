import AuthorCard from "@/features/blogs/components/author-card";
import { fetchAllPublicAuthors } from "@/features/blogs/server/public-authors";
import { localePathname } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

type Props = Readonly<{
  params: Promise<{ locale: Locale }>;
}>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("authorsPage");

  return buildStaticPageMetadata({
    locale,
    pathname: localePathname(locale, "/authors"),
    pageKey: "author",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function AuthorsPage({ params }: Props) {
  await params;
  const t = await getTranslations("authorsPage");
  const authors = await fetchAllPublicAuthors();

  return (
    <div className="container mx-auto space-y-10 px-4 pb-16 pt-30">
      <h1 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
        {t("title")}
      </h1>

      {authors.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center text-muted-foreground">
          {t("empty")}
        </p>
      )}
    </div>
  );
}
