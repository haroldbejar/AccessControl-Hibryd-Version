import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { userService, roleService } from "../api/userService";
import type { CreateUserRequest, UpdateUserRequest } from "../types/user.types";

export const userKeys = {
  all: ["users"] as const,
  list: () => ["users", "list"] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: userService.getAll,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: roleService.getAll,
    staleTime: 1000 * 60 * 30,
  });
}

export function useCreateUser(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Usuario creado correctamente");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Error al crear el usuario");
    },
  });
}

export function useUpdateUser(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Usuario actualizado correctamente");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Error al actualizar el usuario");
    },
  });
}

export function useDeleteUser(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Usuario eliminado correctamente");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Error al eliminar el usuario");
    },
  });
}

export function useChangePassword(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      id,
      currentPassword,
      newPassword,
    }: {
      id: number;
      currentPassword: string;
      newPassword: string;
    }) => userService.changePassword(id, currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente.");
      onSuccess?.();
    },
    onError: (error: AxiosError<string>) => {
      toast.error(error.response?.data ?? "Error al cambiar la contraseña.");
    },
  });
}
