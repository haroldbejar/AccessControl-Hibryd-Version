import api from "@/shared/services/api";
import type {
  UserResponse,
  RoleResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/user.types";

export const userService = {
  getAll: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>("/users");
    return response.data ?? [];
  },

  getById: async (id: number): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/users", data);
    return response.data;
  },

  update: async (data: UpdateUserRequest): Promise<void> => {
    await api.put(`/users/${data.id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  changePassword: async (
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await api.patch(`/users/${id}/change-password`, {
      currentPassword,
      newPassword,
    });
  },
};

export const roleService = {
  getAll: async (): Promise<RoleResponse[]> => {
    const response = await api.get<RoleResponse[]>("/roles");
    return response.data ?? [];
  },
};
