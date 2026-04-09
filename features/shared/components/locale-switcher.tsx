"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import ReactCountryFlag from "react-country-flag";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: string) => {
    // استخدم startTransition لتأخير التبديل حتى ينتهي التفاعل مع اللغة
    startTransition(() => {
      const segments = pathname.split("/");
      segments[1] = newLocale; // أول segment هو اللغة
      router.push(segments.join("/"));
    });
  };

  return (
    <Select
      dir={locale === "ar" ? "rtl" : "ltr"}
      onValueChange={handleChange}
      defaultValue={locale}
      disabled={isPending}
    >
      <SelectTrigger
        className="w-fit bg-brand text-base size-14! rounded-full font-semibold hover:bg-main-navy transition-all duration-300  px-3 flex items-center justify-center"
        withArrow={false}
      >
        <ReactCountryFlag
          countryCode={locale === "ar" ? "SA" : "US"}
          svg
          style={{
            width: "25px",
            height: "25px",
          }}
          className="rounded-full object-cover"
        />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="ar" className="flex items-center gap-2 text-lg">
          <ReactCountryFlag
            countryCode="SA"
            svg
            style={{
              width: "20px",
              height: "20px",
            }}
            className="rounded-full object-cover"
          />
          <span>العربية</span>
        </SelectItem>
        <SelectItem value="en" className="flex items-center gap-2 text-lg">
          <ReactCountryFlag
            countryCode="US"
            svg
            style={{
              width: "20px",
              height: "20px",
            }}
            className="rounded-full object-cover"
          />
          <span>English</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
