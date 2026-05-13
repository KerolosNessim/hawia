import { apiClient } from "@/lib/api";
import type { LegalResponse } from "../types";

export const getLegalPage = async (type: "privacy-policy" | "terms-of-use" | "refund-policy") => {
  return apiClient.get<LegalResponse>(`/v1/${type}`);
};
