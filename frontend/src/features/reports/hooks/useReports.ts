import { useQuery } from "@tanstack/react-query";
import { reportService } from "../api/reportService";
import type { ReportDateParams } from "../types/report.types";

export const useVisitsReport = (params: ReportDateParams, enabled: boolean) =>
  useQuery({
    queryKey: ["report-visits", params.startDate, params.endDate],
    queryFn: () => reportService.getVisits(params),
    enabled,
  });

export const useVehicleVisitsReport = (
  params: ReportDateParams,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ["report-vehicle-visits", params.startDate, params.endDate],
    queryFn: () => reportService.getVehicleVisits(params),
    enabled,
  });

export const usePendingPackagesReport = (enabled: boolean) =>
  useQuery({
    queryKey: ["report-pending-packages"],
    queryFn: () => reportService.getPendingPackages(),
    enabled,
  });

export const usePackagesHistoryReport = (
  params: ReportDateParams,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ["report-packages-history", params.startDate, params.endDate],
    queryFn: () => reportService.getPackages(params),
    enabled,
  });

export const useActivitySummary = (
  params: ReportDateParams,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ["report-activity-summary", params.startDate, params.endDate],
    queryFn: () => reportService.getActivitySummary(params),
    enabled,
  });
