import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getServiceAis } from "../services/get-service-ais";

export const useGetServiceAis = () => {
  const locale = useLocale();
  const { data, isLoading, error } = useQuery({
    queryKey: ["service_ais", locale],
    queryFn: () => getServiceAis(locale),
  });

  return { data, isLoading, error };
};

