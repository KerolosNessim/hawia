import { apiClient } from "@/lib/api";
import { SearchResponse } from "../types/search";

export const searchAction = async (query: string): Promise<SearchResponse> => {
  return await apiClient.get<SearchResponse>(`/v1/search?query=${query}`);
};
