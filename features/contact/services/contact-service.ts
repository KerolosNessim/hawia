import { apiClient } from "@/lib/api";
import { ContactFormData, ContactResponse } from "../types";

export const submitContactForm = async (data: ContactFormData): Promise<ContactResponse> => {
  return await apiClient.post<ContactResponse>("/v1/contact/submit", data);
};
