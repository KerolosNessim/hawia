"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContactMutation } from "../hooks/use-contact-mutation";
import { ContactFormData } from "../types";
import { Loader2 } from "lucide-react";

export default function ContactForm() {
  const t = useTranslations("contactSection");
  const e = useTranslations("auth.errors");
  const { mutate, isPending } = useContactMutation();

  const contactSchema = z.object({
    name: z.string().min(2, { message: e("fullName") }),
    email: z.string().email({ message: e("email") }),
    phone: z.string().min(10, { message: t("form.phoneError") || "Phone must be at least 10 characters" }),
    message: z.string().min(10, { message: t("form.messageError") || "Message must be at least 10 characters" }),
  });

  type ContactSchema = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactSchema) => {
    mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2 text-start">
        <label className="text-sm font-medium text-gray-700 mx-1 block">
          {t("form.name")}
        </label>
        <Input
          {...register("name")}
          type="text"
          className="h-12 rounded-xl focus-visible:ring-brand/30"
          placeholder={t("form.name")}
        />
        {errors.name && (
          <p className="text-xs text-red-500 mx-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2 text-start">
        <label className="text-sm font-medium text-gray-700 mx-1 block">
          {t("form.email")}
        </label>
        <Input
          {...register("email")}
          type="email"
          className="h-12 rounded-xl focus-visible:ring-brand/30"
          placeholder={t("form.email")}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mx-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2 text-start">
        <label className="text-sm font-medium text-gray-700 mx-1 block">
          {t("form.phone")}
        </label>
        <Input
          {...register("phone")}
          type="tel"
          className="h-12 rounded-xl focus-visible:ring-brand/30"
          placeholder={t("form.phone")}
        />
        {errors.phone && (
          <p className="text-xs text-red-500 mx-1">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2 text-start">
        <label className="text-sm font-medium text-gray-700 mx-1 block">
          {t("form.message")}
        </label>
        <Textarea
          {...register("message")}
          className="min-h-40 rounded-xl focus-visible:ring-brand/30 resize-none"
          placeholder={t("form.message")}
        />
        {errors.message && (
          <p className="text-xs text-red-500 mx-1">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-xl bg-brand text-white hover:bg-brand/90 font-bold text-lg transition-all shadow-md hover:shadow-xl mt-4"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          t("form.submit")
        )}
      </Button>
    </form>
  );
}
