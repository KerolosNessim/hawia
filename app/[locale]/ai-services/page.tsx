import PageHeader from "@/features/shared/components/page-header";
import { getServiceAis } from "@/features/services/services/get-service-ais";
import { resolveMediaUrl, isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { RichHtml } from "@/features/shared/components/rich-html";
import { resolveSettingsPageSeo } from "@/features/settings/lib/resolve-settings-seo";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as motion from "framer-motion/client";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await resolveSettingsPageSeo("ai-services");
  const t = await getTranslations("aiServicesPage");
  return {
    title: seo?.title || "AI Services | Howeyah",
    description: seo?.description || t("description"),
    robots: { index: true, follow: true },
  };
}

export default async function AiServicesPage() {
  const locale = (await getLocale()) as Locale;
  const tAi = await getTranslations("aiServicesPage");
  const servicesRes = await getServiceAis(locale);
  const services = servicesRes.data;

  return (
    <div className="pb-16">
      <PageHeader
        image="/blogs-banner.jfif"
        title={tAi("title")}
        description={tAi("description")}
      />

      <div className="container max-w-6xl pt-10">
        {services.length ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, idx) => (
              <Link
                key={s.id}
                href={`/ai-services/${encodeURIComponent(s.slug)}`}
                className="h-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full group"
                >
                  <Card className="service-card flex h-full min-h-88 flex-col bg-card transition-[box-shadow,background-color,ring-color] duration-300 group-hover:bg-brand/5 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-brand group-hover:ring-offset-2">
                    <CardHeader className="shrink-0">
                      <CardTitle className="flex w-full min-w-0 flex-col items-center gap-3">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand/20 ring-2 ring-brand/20 transition-colors duration-300 group-hover:bg-brand/10 md:h-24 md:w-24">
                          <Image
                            src={s.image ? resolveMediaUrl(s.image) : "/logo.png"}
                            alt={s.title}
                            fill
                            unoptimized={s.image ? isRemoteMediaUrl(s.image) : true}
                            className="object-cover"
                          />
                        </div>
                        <RichHtml
                          html={s.title}
                          as="p"
                          className="service-card__title line-clamp-2 min-h-14 w-full text-center text-xl font-bold text-foreground [&_p]:m-0"
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex min-h-0 flex-1 flex-col">
                      <CardDescription className="flex flex-1 flex-col text-center text-base font-semibold leading-relaxed text-muted-foreground">
                        <RichHtml
                          html={s.description || ""}
                          as="span"
                          className="service-card__description line-clamp-4 block w-full text-muted-foreground [&_p]:mb-2 [&_p:last-child]:mb-0"
                        />
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted-foreground text-lg">
            {tAi("empty")}
          </p>
        )}
      </div>
    </div>
  );
}

