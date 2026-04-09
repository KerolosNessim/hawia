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
import { SearchIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export const SearchDialog = () => {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const t = useTranslations("searchDialog");
  const placeholders = t.raw("placeholder") as string[];
useEffect(() => {
  if (value) return;

  const interval = setInterval(() => {
    setIndex((prev) => (prev + 1) % placeholders.length);
  }, 2500);

  return () => clearInterval(interval);
}, [placeholders.length, value]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="size-14! rounded-full bg-brand text-white">
          <SearchIcon className="size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-4xl">
        <DialogHeader className="space-y-8">
          <div className="flex items-center justify-between gap-2 pb-4 ">
            <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
            <DialogClose asChild>
              <Button className="size-10! rounded-full bg-brand text-white">
                <XIcon className="size-5" />
              </Button>
            </DialogClose>
          </div>

          <div className="flex items-center justify-center">
            <InputGroup className="h-16! rounded-full border-2 focus-visible:border-brand">
              <InputGroupInput
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-transparent text-xl!"
              />
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
                <SearchIcon className="size-6" />
              </InputGroupAddon>
              <InputGroupAddon align={"inline-end"}>
                <Button className="size-14! rounded-full bg-brand text-white">
                  <SearchIcon className="size-6" />
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <p className="text-center text-gray-900 mb-8">{t("description")}</p>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
