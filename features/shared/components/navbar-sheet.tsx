"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutation";
import {
  navLinkClassName,
  useNavbarNavigation,
} from "@/features/shared/hooks/use-navbar-navigation";
import { Link } from "@/i18n/navigation";
import logo from "@/public/logo.png";
import { ChevronDown, LucideUserRound, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import LocaleSwitcher from "./locale-switcher";
import { SearchDialog } from "./searh-dialog";
import { cn } from "@/lib/utils";
import React from "react";

type NavbarSheetProps = {
  actionBtnClass?: string;
};

export default function NavbarSheet({ actionBtnClass }: NavbarSheetProps) {
  const t = useTranslations("navbar");
  const { locale, path, links, serviceLinks, tServicesPage } = useNavbarNavigation();
  const { data: settings } = useSettings();
  const { isAuthenticated } = useAuthStore();
  const { mutate: logout } = useLogoutMutation();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const menuBtnClass = cn(
    actionBtnClass,
    "xl:hidden bg-brand text-white hover:bg-brand/90",
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className={menuBtnClass} aria-label="Open navigation menu">
          <Menu className="size-4 sm:size-5 md:size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={locale === "ar" ? "right" : "left"}
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-sm"
      >
        <SheetHeader className="shrink-0 border-b border-border/40 px-4 py-3">
          <SheetTitle className="sr-only">{t("home")}</SheetTitle>
          <Link href="/" className="mx-auto block w-fit">
            <Image
              src={settings?.general?.logo || logo}
              alt={settings?.general?.site_name || "logo"}
              width={100}
              height={100}
              className="h-10 w-auto object-contain sm:h-12"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>
        </SheetHeader>

        <nav
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-4"
          aria-label={t("home")}
        >
          {links.slice(0, 2).map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className={navLinkClassName(path, link.href, "text-center")}
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}

          <Collapsible className="w-full">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "group/services h-auto w-full justify-center gap-2 rounded-full py-2 font-semibold",
                path.startsWith("/services") ? "bg-brand text-white" : "",
                )}
              >
                {t("services")}
                <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]/services:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-1 ps-2 pt-1">
              {serviceLinks.map((service) => (
                <SheetClose asChild key={service.id}>
                  <Link
                    href={service.href}
                    className={navLinkClassName(
                      path,
                      service.href,
                      "text-center text-sm",
                    )}
                  >
                    {service.label}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Link
                  href="/services"
                  className={navLinkClassName(
                    path,
                    "/services",
                    "mt-1 border-t border-border/60 pt-3 text-center text-brand text-sm",
                  )}
                >
                  {tServicesPage("viewAll")}
                </Link>
              </SheetClose>
            </CollapsibleContent>
          </Collapsible>

          <SheetClose asChild>
            <Link
              href="/ai-services"
              className={navLinkClassName(path, "/ai-services", "text-center")}
            >
              {t("aiServices")}
            </Link>
          </SheetClose>

          {links.slice(2).map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className={navLinkClassName(path, link.href, "text-center")}
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <SheetFooter className="shrink-0 gap-3 border-t border-border/40 bg-muted/30 px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <LocaleSwitcher triggerClassName={actionBtnClass} />
            <SearchDialog triggerClassName={actionBtnClass} />
          </div>

          {mounted && isAuthenticated ? (
            <SheetClose asChild>
              <Button
                variant="destructive"
                className="h-12 w-full rounded-full"
                onClick={() => logout()}
              >
                {t("logout") || "Logout"}
              </Button>
            </SheetClose>
          ) : mounted ? (
            <SheetClose asChild>
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand font-semibold text-white"
              >
                <LucideUserRound className="size-5" />
                {t("login")}
              </Link>
            </SheetClose>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
