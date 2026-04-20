"use client";
import { Link, usePathname } from "@/i18n/navigation";
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

export default function Navbar() {
  const t = useTranslations("navbar");
  const path = usePathname();
  const active = " bg-brand text-white  rounded-full";
  const hover =
    " hover:bg-brand hover:text-white hover: hover:rounded-full transition-all duration-300 ease-in-out";
  const links = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/clients", label: t("clients") },
    { href: "/blogs", label: t("blog") },
    { href: "/courses", label: t("courses") },
    { href: "/faq", label: t("faq") },
    { href: "/contact-us", label: t("contact-us") },
  ];
  const servicesLinks = t.raw("servicesLinks") as string[];
  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="container fixed left-0 right-0 top-2 z-50 flex items-center justify-between max-xl:bg-white max-xl:top-0"
    >
      <Link href={"/"} className="bg-white rounded-full px-6">
        <Image
          src={logo}
          alt="logo"
          width={100}
          height={100}
          className="w-18 h-18 object-contain"
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
            <HoverCardContent >
              <div className="flex flex-col gap-2">
                {servicesLinks?.map((link, index) => (
                  <Link
                    key={index}
                    href={`/services/${index + 1}`}
                    className={` ${path === `/services/${index + 1}` ? active : ""} p-2 rounded-full font-semibold ${hover}`}
                  >
                    {link}
                  </Link>
                ))}
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
        <Link
          href={"/login"}
          className=" px-4 h-14! rounded-full bg-brand text-white flex items-center gap-2"
        >
          <LucideUserRound className="size-6" />
          <p className="font-semibold ">{t("login")}</p>
        </Link>
        <NavbarSheet />
      </div>
    </motion.header>
  );
}
