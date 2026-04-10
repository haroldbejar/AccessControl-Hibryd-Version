import api from "@/shared/services/api";
import type {
  ActivitySummaryResponse,
  ReportDateParams,
} from "../types/report.types";
import type { VisitResponse } from "@/features/visits/types/visit.types";
import type { PackageResponse } from "@/features/packages/types/package.types";

// Patrón Result (visits/packages)
type ApiResult<T> = { isSuccess: boolean; value: T; error: string | null };

export const reportService = {
  // R1 – Visitas por período
  getVisits: async (params: ReportDateParams): Promise<VisitResponse[]> => {
    const response = await api.get<ApiResult<VisitResponse[]>>("/visits", {
      params: { startDate: params.startDate, endDate: params.endDate },
    });
    return response.data.value ?? [];
  },

  // R2 – Visitas con vehículo (mismo endpoint, filtrado en cliente)
  getVehicleVisits: async (
    params: ReportDateParams,
  ): Promise<VisitResponse[]> => {
    const response = await api.get<ApiResult<VisitResponse[]>>("/visits", {
      params: { startDate: params.startDate, endDate: params.endDate },
    });
    return (response.data.value ?? []).filter((v) => v.hasVehicle);
  },

  // R3 – Paquetes pendientes (sin fechas)
  getPendingPackages: async (): Promise<PackageResponse[]> => {
    const response =
      await api.get<ApiResult<PackageResponse[]>>("/packages/pending");
    return response.data.value ?? [];
  },

  // R4 – Historial de paquetes por período
  getPackages: async (params: ReportDateParams): Promise<PackageResponse[]> => {
    const response = await api.get<ApiResult<PackageResponse[]>>("/packages", {
      params: { startDate: params.startDate, endDate: params.endDate },
    });
    return response.data.value ?? [];
  },

  // R5 – Resumen ejecutivo (solo admin) — endpoint nuevo
  // ReportsController devuelve dato crudo (Ok(result.Value))
  getActivitySummary: async (
    params: ReportDateParams,
  ): Promise<ActivitySummaryResponse> => {
    const response = await api.get<ActivitySummaryResponse>(
      "/reports/summary",
      {
        params: { startDate: params.startDate, endDate: params.endDate },
      },
    );
    return response.data;
  },
};
