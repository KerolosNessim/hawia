"use client";

import { Link } from "@/i18n/navigation";

import logo from "@/public/logo.png";

import * as motion from "framer-motion/client";

import { ChevronDown, LucideUserRound } from "lucide-react";

import { useTranslations } from "next-intl";

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

import { useSettings } from "@/features/settings/hooks/use-settings";

import { useAuthStore } from "@/features/auth/store/auth-store";

import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutation";

import {
  NAV_ACTIVE_CLASS,
  navLinkClassName,
  useNavbarNavigation,
} from "@/features/shared/hooks/use-navbar-navigation";

import React from "react";

import { cn } from "@/lib/utils";
import { RichHtml } from "./rich-html";



const actionBtnClass =
  "size-9! sm:size-10! md:size-12! xl:size-14! rounded-full shrink-0";



export default function Navbar() {

  const t = useTranslations("navbar");

  const { path, links, serviceLinks, tServicesPage } =
    useNavbarNavigation();

  const { data: settings } = useSettings();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {

    setMounted(true);

  }, []);



  const { isAuthenticated } = useAuthStore();

  const { mutate: logout } = useLogoutMutation();



  const primaryLinks = links.slice(0, 2);

  const secondaryLinks = links.slice(2);



  return (

    <motion.header

      initial={{ opacity: 0, y: -50 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.8, ease: "easeOut" }}

      className={cn(

        "container fixed inset-x-0 top-0 z-50 mx-auto",

        "flex min-h-12 items-center justify-between gap-1.5 px-2 py-1.5 sm:min-h-14 sm:gap-2 sm:px-3 sm:py-2 md:min-h-16 md:gap-3 md:px-4 md:py-2.5",

        "xl:top-2 xl:min-h-0 xl:gap-4 xl:bg-transparent xl:py-0",

        "max-xl:border-b max-xl:border-border/40 max-xl:bg-white max-xl:shadow-sm",

      )}

    >

      <Link
        href="/"
        className={cn(
          "flex h-full shrink-0 items-center justify-center rounded-full bg-white px-2.5 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2",
        )}
      >
        <Image
          src={settings?.general?.logo || logo}
          alt={settings?.general?.site_name || "logo"}
          width={100}
          height={100}
          className="h-8 w-auto object-contain sm:h-9 md:h-10 lg:h-11"
          priority
        />
      </Link>



      <div

        className={cn(

          "hidden min-w-0 flex-1 justify-center xl:flex",

          "mx-1 2xl:mx-3",

        )}

      >

        <nav

          className={cn(

            "flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-white p-2 backdrop-blur-2xl",

            "scrollbar-none 2xl:gap-1.5 2xl:p-3",

            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",

          )}

          aria-label="Main navigation"

        >

          {primaryLinks.map((link) => (

            <Link

              key={link.href}

              href={link.href}

              className={navLinkClassName(

                path,

                link.href,

                "shrink-0 whitespace-nowrap px-2 text-sm 2xl:px-2.5 2xl:text-base",

              )}

            >

              {link.label}

            </Link>

          ))}



          <HoverCard openDelay={100} closeDelay={100}>

            <HoverCardTrigger asChild>

              <Button
                className={cn(
                  "group/btn shrink-0 bg-transparent px-2 text-sm font-semibold text-primary 2xl:text-base",
                  path.startsWith("/services") && NAV_ACTIVE_CLASS,
                )}
              >
                {t("services")}
                <ChevronDown className="size-4 transition-all duration-300 ease-in-out group-hover/btn:rotate-180" />
              </Button>

            </HoverCardTrigger>

            <HoverCardContent
              data-lenis-prevent
              className="max-h-[min(70vh,24rem)] overflow-y-auto no-scrollbar"
            >

              <div className="flex flex-col gap-1">

                {serviceLinks.map((service) => (

                  <Link

                    key={service.id}

                    href={service.href}

                    className={navLinkClassName(

                      path,

                      service.href,

                      "whitespace-normal text-start",

                    )}

                  >

                    {service.label}

                  </Link>

                ))}



                <Link

                  href="/services"

                  className={navLinkClassName(

                    path,

                    "/services",

                    "mt-1 border-t border-border/60 pt-3 text-center text-brand",

                  )}

                >

                  {tServicesPage("viewAll")}

                </Link>

              </div>

            </HoverCardContent>

          </HoverCard>
          <Link
                  href="/ai-services"
                  className={navLinkClassName(
                    path,
                    "/ai-services",
                  )}
                  >
                    {t("aiServices")}
                </Link>

          {secondaryLinks.map((link) => (

            <Link

              key={link.href}

              href={link.href}

              className={navLinkClassName(

                path,

                link.href,

                "shrink-0 whitespace-nowrap px-2 text-sm 2xl:px-2.5 2xl:text-base",

              )}

            >

              {link.label}

            </Link>

          ))}

        </nav>

      </div>



      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 md:gap-2">

        <LocaleSwitcher

          triggerClassName={cn(actionBtnClass, "max-xl:hidden")}

        />

        <SearchDialog

          triggerClassName={cn(actionBtnClass, "max-xl:hidden")}

        />



        {mounted && (

          <div className="max-xl:hidden">

            {isAuthenticated ? (

              <Button

                onClick={() => logout()}

                variant="destructive"

                className={cn(actionBtnClass, "px-4 text-sm 2xl:text-base")}

              >

                {t("logout") || "Logout"}

              </Button>

            ) : (

              <Link

                href="/login"

                className={cn(

                  "flex shrink-0 items-center gap-2 rounded-full bg-brand px-3 text-white sm:px-4",

                  "h-10 sm:h-12 xl:h-14",

                )}

              >

                <LucideUserRound className="size-5 shrink-0 sm:size-6" />

                <span className="hidden font-semibold sm:inline">

                  {t("login")}

                </span>

              </Link>

            )}

          </div>

        )}



        <NavbarSheet actionBtnClass={actionBtnClass} />

      </div>

    </motion.header>

  );

}

