import { apiClient } from "@/lib/api";
import { AuthResponse, LoginPayload, RegisterPayload } from "../types";

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  return await apiClient.post<AuthResponse>("/v1/auth/login", payload);
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  return await apiClient.post<AuthResponse>("/v1/auth/register", payload);
};

export const logout = async (): Promise<{ status: boolean; message: string }> => {
  return await apiClient.post("/v1/auth/logout");
};
