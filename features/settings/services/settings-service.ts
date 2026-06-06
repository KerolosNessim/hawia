import { apiClient } from "@/lib/api";
import type { ScriptsData, ScriptsResponse, SettingsResponse } from "../types";

export const getSettings = async (): Promise<SettingsResponse> => {
  return await apiClient.get<SettingsResponse>("/v1/settings");
};

/** Public site scripts from `GET /v1/settings` → `data.scripts` (not the admin-only route). */
export const getScripts = async (): Promise<ScriptsResponse | null> => {
  const response = await getSettings();
  const scripts = response.data.scripts;
  if (!scripts) return null;
  return {
    status: response.status,
    message: response.message,
    data: scripts,
  };
};

export function scriptsFromSettings(data: SettingsResponse["data"]): ScriptsData | null {
  return data.scripts ?? null;
}
