"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Link } from "@/i18n/navigation";
import { useSearch } from "@/features/shared/hooks/use-search";
import type { SearchItem } from "@/features/shared/types/search";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  FileQuestion,
  Briefcase,
  Layers,
  GraduationCap,
  SearchIcon,
  XIcon,
  Loader2,
} from "lucide-react";

const SECTION_CONFIG: Record<
  string,
  {
    labelKey: string;
    icon: React.ElementType;
    buildHref: (slug: string) => string;
    directLink?: string;
  }
> = {
  blogs: {
    labelKey: "results.blogs",
    icon: BookOpen,
    buildHref: (slug) => `/blogs/${slug}`,
  },
  services: {
    labelKey: "results.services",
    icon: Briefcase,
    buildHref: (slug) => `/services/${slug}`,
  },
  solutions: {
    labelKey: "results.solutions",
    icon: Layers,
    buildHref: (slug) => `/clients/${slug}`,
  },
  courses: {
    labelKey: "results.courses",
    icon: GraduationCap,
    buildHref: (slug) => `/courses/${slug}`,
  },
  faqs: {
    labelKey: "results.faqs",
    icon: FileQuestion,
    buildHref: () => `/faq`,
    directLink: `/faq`,
  },
};

interface ResultItemProps {
  item: SearchItem;
  href: string;
  icon: React.ElementType;
  onClose: () => void;
}

const ResultItem = ({ item, href, icon: Icon, onClose }: ResultItemProps) => (
  <Link
    href={href as any}
    onClick={onClose}
    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-brand/10 transition-colors group"
  >

      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-brand" />
      </div>
    <span className="text-sm font-semibold text-gray-800 group-hover:text-brand transition-colors line-clamp-1">
      {item.title}
    </span>
  </Link>
);

export const SearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("searchDialog");
  const placeholders = t.raw("placeholder") as string[];

  const { data, isFetching } = useSearch(value);
  const results = data?.data;

  const hasResults =
    results &&
    Object.values(results).some((arr) => Array.isArray(arr) && arr.length > 0);

  // Cycle placeholder animation
  useEffect(() => {
    if (value) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [placeholders.length, value]);

  // Auto-focus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue("");
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setValue("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="size-14! rounded-full bg-brand text-white">
          <SearchIcon className="size-6" />
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton={false} className="sm:max-w-4xl p-0 overflow-hidden rounded-[32px]">
        <div className="p-6 pb-4">
          <DialogHeader className="space-y-6">
            {/* Title Row */}
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
              <DialogClose asChild>
                <Button className="size-10! rounded-full bg-brand text-white">
                  <XIcon className="size-5" />
                </Button>
              </DialogClose>
            </div>

            {/* Search Input */}
            <div className="flex items-center justify-center">
              <InputGroup className="h-16! rounded-full border-2 focus-visible:border-brand">
                <InputGroupInput
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="bg-transparent text-xl!"
                />
                {/* Animated placeholder */}
                <div className="absolute inset-y-0 flex items-center px-4 pointer-events-none overflow-hidden">
                  <AnimatePresence mode="wait">
                    {!value && (
                      <motion.span
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-black/80 ps-8 text-2xl font-semibold"
                      >
                        {placeholders[index]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <InputGroupAddon>
                  {isFetching ? (
                    <Loader2 className="size-6 animate-spin text-brand" />
                  ) : (
                    <SearchIcon className="size-6" />
                  )}
                </InputGroupAddon>
                <InputGroupAddon align={"inline-end"}>
                  <Button className="size-14! rounded-full bg-brand text-white">
                    <SearchIcon className="size-6" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Subtitle or results hint */}
            {!value && (
              <p className="text-center text-gray-900 mb-2">{t("description")}</p>
            )}
          </DialogHeader>
        </div>

        {/* Results Panel */}
        <AnimatePresence>
          {value.length >= 2 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 max-h-[400px] overflow-y-auto px-6 py-4 space-y-4">
                {isFetching && !hasResults && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-brand" />
                  </div>
                )}

                {!isFetching && !hasResults && (
                  <p className="text-center text-gray-500 py-6 text-sm">
                    {t("noResults")}
                  </p>
                )}

                {hasResults &&
                  Object.entries(SECTION_CONFIG).map(([key, config]) => {
                    const items = results?.[key as keyof typeof results];
                    if (!Array.isArray(items) || items.length === 0) return null;
                    const Icon = config.icon;
                    return (
                      <div key={key}>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <Icon className="w-4 h-4 text-brand" />
                          <span className="text-xs font-bold uppercase tracking-widest text-brand">
                            {t(config.labelKey)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {items.map((item) => (
                            <ResultItem
                              key={item.id}
                              item={item}
                              href={
                                config.directLink
                                  ? config.directLink
                                  : config.buildHref(item.slug)
                              }
                              icon={Icon}
                              onClose={handleClose}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
