import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reservationService } from "../api/reservationService";
import type {
  CreateReservationRequest,
  CancelReservationRequest,
  ReservationFilters,
} from "../types/reservation.types";

export const reservationKeys = {
  all: ["reservations"] as const,
  list: (filters?: ReservationFilters) =>
    ["reservations", "list", filters] as const,
  availability: (commonAreaId: number, date: string) =>
    ["reservations", "availability", commonAreaId, date] as const,
};

export function useReservations(filters?: ReservationFilters) {
  return useQuery({
    queryKey: reservationKeys.list(filters),
    queryFn: () => reservationService.getAll(filters),
    staleTime: 1000 * 30,
  });
}

export function useAvailability(
  commonAreaId: number | null,
  date: string | null,
) {
  return useQuery({
    queryKey: reservationKeys.availability(commonAreaId ?? 0, date ?? ""),
    queryFn: () => reservationService.getAvailability(commonAreaId!, date!),
    enabled: !!commonAreaId && !!date,
    staleTime: 1000 * 30,
  });
}

export function useCreateReservation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReservationRequest) =>
      reservationService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all });
      toast.success("Reserva creada correctamente");
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : "Error al crear la reserva";
      toast.error(msg);
    },
  });
}

export function useCancelReservation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: CancelReservationRequest;
    }) => reservationService.cancel(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all });
      toast.success("Reserva cancelada");
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : "Error al cancelar la reserva";
      toast.error(msg);
    },
  });
}

export function useConfirmReservation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reservationService.confirm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all });
      toast.success("Reserva confirmada");
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Error al confirmar la reserva";
      toast.error(msg);
    },
  });
}

export function useCompleteReservation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reservationService.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all });
      toast.success("Reserva completada");
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Error al completar la reserva";
      toast.error(msg);
    },
  });
}
