import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getJobOpeningsPublicByLocale } from "@/features/careers/api/jobsPublicApi";

export function useJobOpenings() {
  const locale = useLocale();
  const lang = locale.startsWith("ar") ? "ar" : "en";

  return useQuery({
    queryKey: ["jobs-public-openings", lang],
    queryFn: () => getJobOpeningsPublicByLocale(lang),
    retry: 1,
  });
}

