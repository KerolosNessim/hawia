import { useQuery } from "@tanstack/react-query";
import { getJobsSectionsPublic } from "@/features/careers/api/jobsPublicApi";

export function useJobsSections() {
  return useQuery({
    queryKey: ["jobs-public-sections"],
    queryFn: getJobsSectionsPublic,
    retry: 1,
  });
}

