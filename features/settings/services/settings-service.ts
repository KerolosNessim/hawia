import { apiClient } from "@/lib/api";
import { ScriptsResponse, SettingsResponse } from "../types";

export const getSettings = async (): Promise<SettingsResponse> => {
  return await apiClient.get<SettingsResponse>("/v1/settings");
};

export const getScripts = async (): Promise<ScriptsResponse> => {
  return await apiClient.get<ScriptsResponse>("/v1/admin/settings/scripts");
};
