import api from "@/shared/services/api";
import type {
  CommonAreaResponse,
  CreateCommonAreaRequest,
  UpdateCommonAreaRequest,
} from "../types/reservation.types";

export const commonAreaService = {
  getAll: async (): Promise<CommonAreaResponse[]> => {
    const response = await api.get<CommonAreaResponse[]>("/common-areas");
    return response.data ?? [];
  },

  getById: async (id: number): Promise<CommonAreaResponse> => {
    const response = await api.get<CommonAreaResponse>(`/common-areas/${id}`);
    return response.data;
  },

  create: async (
    data: CreateCommonAreaRequest,
  ): Promise<CommonAreaResponse> => {
    const response = await api.post<CommonAreaResponse>("/common-areas", data);
    return response.data;
  },

  update: async (
    data: UpdateCommonAreaRequest,
  ): Promise<CommonAreaResponse> => {
    const response = await api.put<CommonAreaResponse>(
      `/common-areas/${data.id}`,
      data,
    );
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/common-areas/${id}`);
  },
};
