import { useQuery } from "@tanstack/react-query";
import { fetchContactHeaders } from "../services/get-contact-headers";

export function useContactHeaders(countryId?: number) {
  return useQuery({
    queryKey: ["contact-headers", countryId],
    queryFn: () => fetchContactHeaders(countryId),
    enabled: countryId == null || countryId > 0,
  });
}
