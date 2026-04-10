import api from "@/shared/services/api";
import type {
  DestinationResponse,
  CreateDestinationRequest,
} from "../types/destination.types";

export const destinationService = {
  getAll: async (): Promise<DestinationResponse[]> => {
    const response = await api.get<DestinationResponse[]>("/destinations");
    return response.data ?? [];
  },

  create: async (
    data: CreateDestinationRequest,
  ): Promise<DestinationResponse> => {
    const response = await api.post<DestinationResponse>("/destinations", data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/destinations/${id}`);
  },
};
