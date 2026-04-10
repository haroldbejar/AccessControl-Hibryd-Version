import type { VisitResponse } from "@/features/visits/types/visit.types";
import type { PackageResponse } from "@/features/packages/types/package.types";

// Re-exportamos los tipos que los PDFs necesitan, para no duplicar
export type { VisitResponse, PackageResponse };

// DTO del endpoint nuevo GET /api/reports/summary
export interface ActivitySummaryResponse {
  totalVisits: number;
  activeVisits: number;
  visitsWithVehicle: number;
  totalPackages: number;
  pendingPackages: number;
  deliveredPackages: number;
  periodStart: string;
  periodEnd: string;
}

// Parámetros comunes de filtro por fecha
export interface ReportDateParams {
  startDate: string; // "yyyy-MM-dd"
  endDate: string; // "yyyy-MM-dd"
}
