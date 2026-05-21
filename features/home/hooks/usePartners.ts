import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { extractPartnersFromResponse, getPartners } from "../services/partners";

export function usePartners() {
  const locale = useLocale();

  const { data, isLoading, error } = useQuery({
    queryKey: ["partners", locale],
    queryFn: getPartners,
    select: extractPartnersFromResponse,
  });

  return { partners: data ?? [], isLoading, error };
}
