import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { representativeService } from "../api/representativeService";
import type {
  CreateRepresentativeRequest,
  UpdateRepresentativeRequest,
} from "../types/representative.types";

export const representativeKeys = {
  all: ["representatives"] as const,
  byDestination: (destinationId: number) =>
    ["representatives", destinationId] as const,
};

export function useRepresentativesByDestination(destinationId: number | null) {
  return useQuery({
    queryKey: representativeKeys.byDestination(destinationId ?? 0),
    queryFn: () => representativeService.getByDestination(destinationId!),
    enabled: destinationId !== null && destinationId > 0,
  });
}

export function useCreateRepresentative(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRepresentativeRequest) =>
      representativeService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: representativeKeys.all });
      toast.success("Representante creado correctamente");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Error al crear el representante");
    },
  });
}

export function useUpdateRepresentative(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRepresentativeRequest) =>
      representativeService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: representativeKeys.all });
      toast.success("Representante actualizado correctamente");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Error al actualizar el representante");
    },
  });
}

export function useDeleteRepresentative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => representativeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: representativeKeys.all });
      toast.success("Representante eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar el representante");
    },
  });
}
