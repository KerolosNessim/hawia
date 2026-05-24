"use client";
import { Link, usePathname } from "@/i18n/navigation";
import logo from "@/public/logo.png";
import * as motion from "framer-motion/client";
import { ChevronDown, LucideUserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import LocaleSwitcher from "./locale-switcher";
import NavbarSheet from "./navbar-sheet";
import { SearchDialog } from "./searh-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { useGetServices } from "@/features/services/hooks/useGetServices";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutation";
import { filterServicesByCountryCode } from "@/features/services/lib/filter-services-by-country";
import { pickServiceSlug } from "@/features/services/lib/services-routes";
import { useCountry } from "@/hooks/use-country";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import React from "react";

/** Title-case each word for English service labels (e.g. "seo services" → "Seo Services"). */
function titleCaseEnglish(text: string): string {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function serviceNavLabel(title: string | undefined, locale: string): string {
  const text = plainTextFromHtml(title);
  if (!text) return "";
  return locale === "en" ? titleCaseEnglish(text) : text;
}

export default function Navbar() {
  const locale = useLocale();
  const t = useTranslations("navbar");
  const tServicesPage = useTranslations("servicesPage");
  const path = usePathname();
  const { data, isLoading, error } = useGetServices();
  const { data: settings } = useSettings();
  const userCountryCode = useCountry();
  const allServices = Array.isArray(data?.data) ? data?.data : [];
  const services = filterServicesByCountryCode(allServices, userCountryCode);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { isAuthenticated, user } = useAuthStore();

  const { mutate: logout } = useLogoutMutation();

  const active = " bg-brand text-white  rounded-full";
  const hover =
    " hover:bg-brand hover:text-white hover: hover:rounded-full transition-all duration-300 ease-in-out";
  const links = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/clients", label: t("clients") },
    { href: "/blogs", label: t("blog") },
    { href: "/courses", label: t("courses") },
    { href: "/packages", label: t("packages") },
    { href: "/faq", label: t("faq") },
    { href: "/contact-us", label: t("contact-us") },
  ];
  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="container fixed left-0 right-0 top-2 z-50 flex items-center justify-between max-xl:bg-white max-xl:top-0"
    >
      <Link href={"/"} className="">
        <Image
          src={settings?.general?.logo || logo}
          alt={settings?.general?.site_name || "logo"}
          width={100}
          height={100}
          className="h-16 w-auto object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </Link>
      <div className="max-xl:hidden p-4 rounded-full backdrop-blur-2xl bg-white flex items-center justify-between">
        <nav className="flex items-center gap-3">
          {links?.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={` ${path === link.href ? active : ""} p-2 rounded-full font-semibold ${hover}`}
            >
              {link.label}
            </Link>
          ))}

          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button className="group/btn bg-transparent text-primary text-base font-semibold px-0">
                {t("services")}
                <ChevronDown className="size-4 group-hover/btn:rotate-180 transition-all duration-300 ease-in-out" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="flex flex-col gap-2">
                {services?.map((service) => {
                  const serviceSlug = pickServiceSlug(service, locale);
                  return (
                  <Link
                    key={service.id}
                    href={`/services/${encodeURIComponent(serviceSlug)}`}
                    className={` ${path === `/services/${serviceSlug}` ? active : ""} p-2 rounded-full font-semibold ${hover}`}
                  >
                    {serviceNavLabel(service?.title, locale)}
                  </Link>
                  );
                })}
                <Link
                  href="/services"
                  className={`mt-1 border-t border-border/60 pt-3 text-center font-semibold text-brand ${path === "/services" ? active : ""} p-2 rounded-full ${hover}`}
                >
                  {tServicesPage("viewAll")}
                </Link>
              </div>
            </HoverCardContent>
          </HoverCard>

          {links?.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={` ${path === link.href ? active : ""} p-2 rounded-full font-semibold ${hover}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <SearchDialog />

        {mounted &&
          (isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => logout()}
                variant="destructive"
                className="h-14! rounded-full "
              >
                {t("logout") || "Logout"}
              </Button>
            </div>
          ) : (
            <Link
              href={"/login"}
              className=" px-4 h-14! rounded-full bg-brand text-white flex items-center gap-2"
            >
              <LucideUserRound className="size-6" />
              <p className="font-semibold ">{t("login")}</p>
            </Link>
          ))}

        <NavbarSheet />
      </div>
    </motion.header>
  );
}
