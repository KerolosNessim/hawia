export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
  locale: string | null;
  timezone: string | null;
  preferences: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
  tokenType: string;
  accessExpiresIn: number;
}

export interface AuthResponse {
  status: string | boolean;
  message: string;
  data: AuthData;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}
