"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetServices } from "@/features/services/hooks/useGetServices";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function BookingForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useTranslations("booking");
  
  const bookingSchema = z.object({
    name: z.string().min(2, { message: t("form.nameError") }),
    phone: z.string().min(10, { message: t("form.phoneError") }),
    email: z.string().email({ message: t("form.emailError") }),
    service_id: z.string().min(1, { message: t("form.serviceError") }),
    message: z.string().min(10, { message: t("form.messageError") }),
  });

  type BookingSchema = z.infer<typeof bookingSchema>;

  const common = useTranslations("auth.errors");

  const { data: servicesData, isLoading: isLoadingServices } = useGetServices();
  const services = Array.isArray(servicesData?.data) ? servicesData?.data : [];

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BookingSchema) => apiClient.post("/v1/service-bookings", data),
    onSuccess: () => {

      toast.success(t("successTitle") || "Success", {
        description: t("successDescription") || "Your booking has been received.",
      });
      reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookingSchema>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = (data: BookingSchema) => {
    mutate(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1 text-start">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {t("form.name")} <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("name")}
          placeholder={t("form.name")}
          className="rounded-2xl h-12 focus-visible:ring-brand"
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1 text-start">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {t("form.phone")} <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("phone")}
          placeholder={t("form.phone")}
          className="rounded-2xl h-12 focus-visible:ring-brand"
        />
        {errors.phone && (
          <p className="text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1 text-start">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {t("form.email")} <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("email")}
          type="email"
          placeholder={t("form.email")}
          className="rounded-2xl h-12 focus-visible:ring-brand"
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1 text-start">
        <label className="text-sm font-medium text-gray-700">
          {t("form.selectService")}
        </label>
        <Select onValueChange={(value) => setValue("service_id", value)}>
          <SelectTrigger className="rounded-2xl h-12! w-full focus:ring-brand">
            <SelectValue placeholder={t("form.selectServicePlaceholder")} />
          </SelectTrigger>
          <SelectContent position="popper">
            {services?.map((service) => (
              <SelectItem key={service.id} value={service.id.toString()}>
                {service.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service_id && (
          <p className="text-xs text-red-500">{errors.service_id.message}</p>
        )}
      </div>

      <div className="space-y-1 text-start">
        <label className="text-sm font-medium text-gray-700">
          {t("form.message")}
        </label>
        <Textarea
          {...register("message")}
          placeholder={t("form.message")}
          className="rounded-2xl min-h-[100px] resize-none focus-visible:ring-brand"
        />
        {errors.message && (
          <p className="text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-full bg-brand hover:bg-brand/90 text-white font-bold text-lg transition-all shadow-md"
      >
        {isPending ? <Loader2 className="animate-spin" /> : t("form.submit")}
      </Button>
    </form>
  );
}
