import api from "@/shared/services/api";
import type {
  ReservationResponse,
  AvailabilityResponse,
  CreateReservationRequest,
  CancelReservationRequest,
  ReservationFilters,
} from "../types/reservation.types";

export const reservationService = {
  getAll: async (
    filters?: ReservationFilters,
  ): Promise<ReservationResponse[]> => {
    const params: Record<string, string | number> = {};
    if (filters?.date) params.date = filters.date;
    if (filters?.commonAreaId) params.commonAreaId = filters.commonAreaId;
    if (filters?.status != null) params.status = filters.status;

    const response = await api.get<ReservationResponse[]>("/reservations", {
      params,
    });
    return response.data ?? [];
  },

  getAvailability: async (
    commonAreaId: number,
    date: string,
  ): Promise<AvailabilityResponse> => {
    const response = await api.get<AvailabilityResponse>(
      "/reservations/availability",
      { params: { commonAreaId, date } },
    );
    return response.data;
  },

  create: async (
    data: CreateReservationRequest,
  ): Promise<ReservationResponse> => {
    const response = await api.post<ReservationResponse>("/reservations", data);
    return response.data;
  },

  cancel: async (
    id: number,
    body: CancelReservationRequest,
  ): Promise<ReservationResponse> => {
    const response = await api.patch<ReservationResponse>(
      `/reservations/${id}/cancel`,
      body,
    );
    return response.data;
  },

  confirm: async (id: number): Promise<ReservationResponse> => {
    const response = await api.patch<ReservationResponse>(
      `/reservations/${id}/confirm`,
    );
    return response.data;
  },

  complete: async (id: number): Promise<ReservationResponse> => {
    const response = await api.patch<ReservationResponse>(
      `/reservations/${id}/complete`,
    );
    return response.data;
  },
};
