import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commonAreaService } from "../api/commonAreaService";
import type {
  CreateCommonAreaRequest,
  UpdateCommonAreaRequest,
} from "../types/reservation.types";

export const commonAreaKeys = {
  all: ["common-areas"] as const,
  list: () => ["common-areas", "list"] as const,
  detail: (id: number) => ["common-areas", id] as const,
};

export function useCommonAreas() {
  return useQuery({
    queryKey: commonAreaKeys.list(),
    queryFn: commonAreaService.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCommonArea(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommonAreaRequest) =>
      commonAreaService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commonAreaKeys.all });
      toast.success("Zona común creada correctamente");
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : "Error al crear la zona común";
      toast.error(msg);
    },
  });
}

export function useUpdateCommonArea(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCommonAreaRequest) =>
      commonAreaService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commonAreaKeys.all });
      toast.success("Zona común actualizada correctamente");
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Error al actualizar la zona común";
      toast.error(msg);
    },
  });
}

export function useDeleteCommonArea(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => commonAreaService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commonAreaKeys.all });
      toast.success("Zona común eliminada correctamente");
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Error al eliminar la zona común";
      toast.error(msg);
    },
  });
}
