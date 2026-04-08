import api from "@/shared/services/api";
import type {
  VisitResponse,
  DestinationResponse,
  RepresentativeResponse,
  GetAllVisitsParams,
  CreateVisitRequest,
} from "../types/visit.types";

export const visitService = {
  getAll: async (params: GetAllVisitsParams): Promise<VisitResponse[]> => {
    const response = await api.get<VisitResponse[]>("/visits", { params });
    return response.data;
  },

  getByDocument: async (documentNumber: string): Promise<VisitResponse> => {
    const response = await api.get<VisitResponse>(
      `/visits/document/${documentNumber}`,
    );
    return response.data;
  },

  create: async (data: CreateVisitRequest): Promise<VisitResponse> => {
    const response = await api.post<VisitResponse>("/visits", data);
    return response.data;
  },

  checkOut: async (
    documentNumber: string,
    userModified: number,
  ): Promise<void> => {
    await api.post("/visits/checkout", { documentNumber, userModified });
  },
};

export const destinationService = {
  getAll: async (): Promise<DestinationResponse[]> => {
    const response = await api.get<DestinationResponse[]>("/destinations");
    return response.data;
  },
};

export const representativeService = {
  getByDestination: async (
    destinationId: number,
  ): Promise<RepresentativeResponse[]> => {
    const response = await api.get<RepresentativeResponse[]>(
      "/representatives",
      {
        params: { destinationId },
      },
    );
    return response.data;
  },
};
