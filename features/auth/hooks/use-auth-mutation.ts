import { useMutation } from "@tanstack/react-query";
import { login, register, logout } from "../services/auth-service";
import { useAuthStore } from "../store/auth-store";
import { setAuthToken, removeAuthToken } from "@/lib/cookies";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const t = useTranslations("auth.toast");

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      const { user, accessToken, accessExpiresIn } = response.data;
      setAuth(user, accessToken);
      setAuthToken(accessToken, accessExpiresIn);
      
      toast.success(t("submittedTitle"), {
        description: t("submittedDescription"),
      });
      
      router.replace("/");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Login failed");
    },
  });
};

export const useRegisterMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const t = useTranslations("auth.toast");

  return useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      const { user, accessToken, accessExpiresIn } = response.data;
      setAuth(user, accessToken);
      setAuthToken(accessToken, accessExpiresIn);
      
      toast.success(t("submittedTitle"), {
        description: response.message || t("submittedDescription"),
      });
      
      router.replace("/");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Registration failed");
    },
  });
};

export const useLogoutMutation = () => {
  const clearAuth = useAuthStore((state) => state.logout);
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      removeAuthToken();
      router.replace("/login");
    },
  });
};
