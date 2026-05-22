"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import { useRegisterMutation } from "../hooks/use-auth-mutation";
import { Loader2 } from "lucide-react";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const { mutate, isPending } = useRegisterMutation();
  const inputStyle =
    "h-12! focus-visible:ring-brand focus-visible:ring-offset-0";

  const formSchema = z
    .object({
      name: z.string().min(3, t("errors.fullName")),
      phone: z.string().min(8, t("errors.username")), // Using username key as a fallback for phone error
      email: z.string().email(t("errors.email")),
      password: z.string().min(6, t("errors.password")),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("errors.confirmPassword"),
      path: ["password_confirmation"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutate(data);
  }


  return (
    <div className="flex items-center justify-center   px-4">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-brand">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
              {/* Full Name */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("fullName")}</FieldLabel>
                    <Input {...field} className={inputStyle} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Phone */}
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("username")}</FieldLabel> {/* Using username key as fallback for Phone label if not exists */}
                    <Input {...field} className={inputStyle} type="tel" />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("email")}</FieldLabel>
                    <Input className={inputStyle} type="email" {...field} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("password")}</FieldLabel>
                    <Input className={inputStyle} type="password" {...field} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Confirm Password */}
              <Controller
                name="password_confirmation"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("confirmPassword")}</FieldLabel>
                    <Input className={inputStyle} type="password" {...field} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>



            <div className="flex items-center   gap-2 w-full ">
              <Button type="submit" disabled={isPending} className="h-12!  bg-gray-900 hover:bg-brand">
                {isPending ? <Loader2 className="animate-spin" /> : t("submit")}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-12!   bg-brand text-white hover:bg-primary hover:text-white"
                onClick={() => form.reset()}
              >
                <Link href={"/login"}>{t("login")}</Link>
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
