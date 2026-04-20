import { api } from "@/lib/api";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/api/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/api/auth/login", data),
};
