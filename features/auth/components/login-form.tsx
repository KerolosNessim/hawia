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

import { useLoginMutation } from "../hooks/use-auth-mutation";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const t = useTranslations("auth");
  const { mutate, isPending } = useLoginMutation();
  const inputStyle =
    "h-12! focus-visible:ring-brand focus-visible:ring-offset-0";

  const formSchema = z.object({
    email: z.string().email(t("errors.email")),
    password: z.string().min(6, t("errors.password")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutate(data);
  }


  return (
    <div className="flex items-center justify-center   px-4">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-brand">
            {t("login")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                   <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("email")}</FieldLabel>
                    <Input {...field} className={inputStyle} type="email" />
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


            </FieldGroup>

            <div className="flex items-center   gap-2 w-full ">
              <Button
                type="submit"
                disabled={isPending}
                className="h-12!  bg-gray-900 hover:bg-brand"
              >
                {isPending ? <Loader2 className="animate-spin" /> : t("login")}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-12!   bg-brand text-white hover:bg-primary hover:text-white"
                onClick={() => form.reset()}
              >
                <Link href={"/register"}>{t("register")}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
