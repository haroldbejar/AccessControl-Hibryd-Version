import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  visitService,
  destinationService,
  representativeService,
} from "../api/visitService";
import type {
  CreateVisitRequest,
  GetAllVisitsParams,
} from "../types/visit.types";

export const visitKeys = {
  all: ["visits"] as const,
  list: (params: GetAllVisitsParams) => ["visits", "list", params] as const,
  byDocument: (doc: string) => ["visits", "document", doc] as const,
};

export function useVisits(params: GetAllVisitsParams) {
  return useQuery({
    queryKey: visitKeys.list(params),
    queryFn: () => visitService.getAll(params),
  });
}

export function useVisitByDocument(documentNumber: string, enabled: boolean) {
  return useQuery({
    queryKey: visitKeys.byDocument(documentNumber),
    queryFn: () => visitService.getByDocument(documentNumber),
    enabled: enabled && documentNumber.length > 2,
    retry: false,
  });
}

export function useCreateVisit(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVisitRequest) => visitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
      toast.success("Visita registrada correctamente");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Error al registrar la visita");
    },
  });
}

export function useCheckOut(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentNumber: string) =>
      visitService.checkOut(documentNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
      toast.success("Checkout registrado correctamente");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Error al registrar el checkout");
    },
  });
}

export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: destinationService.getAll,
    staleTime: 1000 * 60 * 30,
  });
}

export function useRepresentativesByDestination(destinationId: number | null) {
  return useQuery({
    queryKey: ["representatives", destinationId],
    queryFn: () => representativeService.getByDestination(destinationId!),
    enabled: destinationId !== null && destinationId > 0,
    staleTime: 1000 * 60 * 10,
  });
}
