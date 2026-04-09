"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import logo from "@/public/logo.png";
import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export default function NavbarSheet() {
    const t = useTranslations("navbar");
    const path = usePathname();
    const locale = useLocale();
    const active = " bg-brand text-white  rounded-full";
    const hover =
      " hover:bg-brand hover:text-white hover: hover:rounded-full transition-all duration-300 ease-in-out";
    const links = [
      { href: "/", label: t("home") },
      { href: "/about", label: t("about") },
      { href: "/services", label: t("services") },
      { href: "/contact", label: t("contact") },
      { href: "/clients", label: t("clients") },
      { href: "/blog", label: t("blog") },
      { href: "/courses", label: t("courses") },
      { href: "/faq", label: t("faq") },
      { href: "/contact-us", label: t("contact-us") },
    ];
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button  className="xl:hidden size-14! rounded-full bg-brand text-white">
            <Menu className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side={locale === "ar" ? "right" : "left"} >
          <SheetHeader>
            <SheetTitle className="my-4" >
              <Link href={"/"} className="block w-fit mx-auto">
                <Image
                  src={logo}
                  alt="logo"
                  width={100}
                  height={100}
                  className="w-30 h-30 object-contain"
                />
              </Link>
            </SheetTitle>
            <SheetDescription>
              <nav className="flex flex-col items-center gap-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={` ${path === link.href ? active : ""}  p-2 rounded-full font-semibold ${hover}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
