import api from "@/shared/services/api";
import type {
  RepresentativeResponse,
  CreateRepresentativeRequest,
  UpdateRepresentativeRequest,
} from "../types/representative.types";

export const representativeService = {
  getByDestination: async (
    destinationId: number,
  ): Promise<RepresentativeResponse[]> => {
    const response = await api.get<RepresentativeResponse[]>(
      "/representatives",
      { params: { destinationId } },
    );
    return response.data ?? [];
  },

  create: async (
    data: CreateRepresentativeRequest,
  ): Promise<RepresentativeResponse> => {
    const response = await api.post<RepresentativeResponse>(
      "/representatives",
      data,
    );
    return response.data;
  },

  update: async (
    data: UpdateRepresentativeRequest,
  ): Promise<RepresentativeResponse> => {
    const response = await api.put<RepresentativeResponse>(
      `/representatives/${data.id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/representatives/${id}`);
  },
};
