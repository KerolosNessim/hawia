import { useQuery } from "@tanstack/react-query";
import { getJobOpeningsBilingual } from "@/features/careers/api/jobsPublicApi";

export function useJobOpeningsBilingual() {
  return useQuery({
    queryKey: ["jobs-public-openings-bilingual"],
    queryFn: getJobOpeningsBilingual,
    staleTime: 5 * 60 * 1000,
  });
}
