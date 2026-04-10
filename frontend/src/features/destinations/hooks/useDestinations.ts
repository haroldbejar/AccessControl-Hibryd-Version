import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { destinationService } from "../api/destinationService";
import type { CreateDestinationRequest } from "../types/destination.types";

export const destinationKeys = {
  all: ["destinations"] as const,
  list: () => ["destinations", "list"] as const,
};

export function useAllDestinations() {
  return useQuery({
    queryKey: destinationKeys.list(),
    queryFn: destinationService.getAll,
  });
}

export function useCreateDestination(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDestinationRequest) =>
      destinationService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: destinationKeys.all });
      toast.success("Destinatario creado correctamente");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Error al crear el destinatario");
    },
  });
}

export function useDeleteDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => destinationService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: destinationKeys.all });
      toast.success("Destinatario eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar el destinatario");
    },
  });
}
