import api from "@/shared/services/api";
import type { LoginRequest, LoginResponse } from "@/shared/types/auth.types";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },
};
