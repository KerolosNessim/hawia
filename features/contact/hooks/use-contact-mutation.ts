import { useMutation } from "@tanstack/react-query";
import { submitContactForm } from "../services/contact-service";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const useContactMutation = () => {
  const t = useTranslations("auth.toast");

  return useMutation({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      toast.success(t("submittedTitle"), {
        description: t("submittedDescription"),
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });
};
