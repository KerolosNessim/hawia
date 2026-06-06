import { useQuery } from "@tanstack/react-query";
import { getJobsHeaderPublic } from "@/features/careers/api/jobsPublicApi";

export function useJobsHeader() {
  return useQuery({
    queryKey: ["jobs-public-header"],
    queryFn: getJobsHeaderPublic,
    retry: 1,
  });
}

