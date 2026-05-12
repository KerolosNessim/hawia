import { apiClient } from "@/lib/api";
import { SettingsResponse } from "../types";

export const getSettings = async (): Promise<SettingsResponse> => {
  return await apiClient.get<SettingsResponse>("/v1/settings");
};
