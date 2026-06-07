import { getBlogs } from "@/features/blogs/services/get-blogs";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

export const useGetBlogs = () => {
  const locale = useLocale();
  const { data, isLoading, error } = useQuery({
    queryKey: ["blogs", locale],
    queryFn: () => getBlogs(locale),
  });

  return {
    data,
    isLoading,
    error,
  };
};
