import api from "@/shared/services/api";
import type {
  VisitResponse,
  DestinationResponse,
  RepresentativeResponse,
  GetAllVisitsParams,
  CreateVisitRequest,
} from "../types/visit.types";

// El backend envuelve todas las respuestas en Result<T>
type ApiResult<T> = { isSuccess: boolean; value: T; error: string | null };

export const visitService = {
  getAll: async (params: GetAllVisitsParams): Promise<VisitResponse[]> => {
    const response = await api.get<ApiResult<VisitResponse[]>>("/visits", {
      params,
    });
    return response.data.value ?? [];
  },

  getByDocument: async (documentNumber: string): Promise<VisitResponse> => {
    const response = await api.get<ApiResult<VisitResponse>>(
      `/visits/document/${documentNumber}`,
    );
    return response.data.value;
  },

  create: async (data: CreateVisitRequest): Promise<VisitResponse> => {
    const response = await api.post<ApiResult<VisitResponse>>("/visits", data);
    return response.data.value;
  },

  // PATCH /visits/{documentNumber}/checkout — userModified lo extrae el backend del JWT
  checkOut: async (documentNumber: string): Promise<void> => {
    await api.patch(`/visits/${documentNumber}/checkout`);
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
