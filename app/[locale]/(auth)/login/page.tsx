import LoginForm from "@/features/auth/components/login-form";
import {
  buildPageMetadata,
  localePathname,
} from "@/lib/seo/metadata-helpers";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "navbar" });
  const loc = locale as Locale;

  return buildPageMetadata({
    locale: loc,
    pathname: localePathname(loc, "/login"),
    title: t("login"),
    robots: { index: false, follow: true },
  });
}

export default function LoginPage() {
  return (
    <div className="py-20 lg:pt-30">
      <LoginForm />
    </div>
  );
}
