import { useQuery } from "@tanstack/react-query";
import { searchAction } from "../services/search-service";
import { useDebounce } from "@/hooks/use-debounce";

export const useSearch = (query: string) => {
  const debouncedQuery = useDebounce(query, 500);

  return useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchAction(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
