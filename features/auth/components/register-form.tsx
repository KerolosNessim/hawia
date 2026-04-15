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
import Link from "next/link";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const inputStyle =
    "h-12! focus-visible:ring-brand focus-visible:ring-offset-0";

  const formSchema = z
    .object({
      username: z.string().min(3, t("errors.username")),
      fullName: z.string().min(3, t("errors.fullName")),
      email: z.string().email(t("errors.email")),
      password: z.string().min(6, t("errors.password")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("errors.confirmPassword"),
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast.success("Success", {
      description: JSON.stringify(data, null, 2),
    });
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
              {/* Username */}
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("username")}</FieldLabel>
                    <Input {...field} className={inputStyle} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Full Name */}
              <Controller
                name="fullName"
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
                name="confirmPassword"
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
              <Button type="submit" className="h-12!  bg-gray-900 hover:bg-brand">
                {t("submit")}
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
