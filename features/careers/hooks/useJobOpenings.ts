import { useQuery } from "@tanstack/react-query";
import { getJobOpeningsPublic } from "@/features/careers/api/jobsPublicApi";

export function useJobOpenings() {
  return useQuery({
    queryKey: ["jobs-public-openings"],
    queryFn: getJobOpeningsPublic,
    retry: 1,
  });
}

