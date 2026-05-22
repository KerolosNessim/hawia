import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../services/settings-service";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    select: (response) => response.data,
  });
};
