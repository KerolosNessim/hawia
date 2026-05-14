"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import BookingForm from "./booking-form";

export default function BookingDialog({ trigger }: { trigger: ReactNode }) {
  const t = useTranslations("booking");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] p-6 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-bold text-center text-gray-900">
            {t("dialogTitle")}
          </DialogTitle>
        </DialogHeader>
        <BookingForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
