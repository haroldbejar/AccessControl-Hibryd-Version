import * as XLSX from "xlsx";
import { format, parseISO } from "date-fns";
import type { VisitResponse } from "@/features/visits/types/visit.types";
import type { PackageResponse } from "@/features/packages/types/package.types";
import type { ActivitySummaryResponse } from "../types/report.types";

function fmt(
  dateStr: string | undefined | null,
  pattern = "dd/MM/yyyy HH:mm",
): string {
  if (!dateStr) return "-";
  try {
    return format(parseISO(dateStr), pattern);
  } catch {
    return dateStr;
  }
}

function download(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

// R1 — Visitas por período
export function exportVisitsToExcel(
  data: VisitResponse[],
  startDate: string,
  endDate: string,
) {
  const rows = data.map((v, i) => ({
    "N°": i + 1,
    Fecha: fmt(v.checkIn, "dd/MM/yyyy"),
    Documento: v.documentNumber,
    Nombre: v.fullName,
    Destino: v.destinationName,
    Representante: v.representativeName,
    Entrada: fmt(v.checkIn, "HH:mm"),
    Salida: v.checkOut ? fmt(v.checkOut, "HH:mm") : "Activa",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Visitas");
  download(wb, `visitas_${startDate}_${endDate}.xlsx`);
}

// R2 — Visitas con vehículo
export function exportVehicleVisitsToExcel(
  data: VisitResponse[],
  startDate: string,
  endDate: string,
) {
  const rows = data
    .filter((v) => v.hasVehicle)
    .map((v, i) => ({
      "N°": i + 1,
      Fecha: fmt(v.checkIn, "dd/MM/yyyy"),
      Nombre: v.fullName,
      "Tipo Vehículo": v.vehicleTypeName ?? "-",
      Marca: v.brand ?? "-",
      Modelo: v.model ?? "-",
      Color: v.color ?? "-",
      Placa: v.plate ?? "-",
    }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Visitas con Vehículo");
  download(wb, `visitas_vehiculo_${startDate}_${endDate}.xlsx`);
}

// R3 — Paquetes pendientes
export function exportPendingPackagesToExcel(data: PackageResponse[]) {
  const rows = data.map((p, i) => ({
    "N°": i + 1,
    Control: p.controlNumber,
    Remitente: p.senderName,
    Empresa: p.senderCompany ?? "-",
    Tracking: p.trackingNumber ?? "-",
    Destinatario: p.destinationName,
    Representante: p.representativeName,
    "F. Recepción": fmt(p.receivedDate),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Paquetes Pendientes");
  const todayStr = format(new Date(), "yyyy-MM-dd");
  download(wb, `paquetes_pendientes_${todayStr}.xlsx`);
}

// R4 — Historial de paquetes
export function exportPackagesHistoryToExcel(
  data: PackageResponse[],
  startDate: string,
  endDate: string,
) {
  const rows = data.map((p, i) => ({
    "N°": i + 1,
    Control: p.controlNumber,
    Remitente: p.senderName,
    Estado: p.statusDescription,
    Destinatario: p.destinationName,
    "F. Recepción": fmt(p.receivedDate, "dd/MM/yyyy"),
    "F. Entrega": p.deliveryDate ? fmt(p.deliveryDate, "dd/MM/yyyy") : "-",
    "Recibido por": p.deliveredTo ?? "-",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Historial Paquetes");
  download(wb, `historial_paquetes_${startDate}_${endDate}.xlsx`);
}

// R5 — Resumen ejecutivo (solo admin)
export function exportActivitySummaryToExcel(
  data: ActivitySummaryResponse,
  startDate: string,
  endDate: string,
) {
  const rows = [
    { Indicador: "Período Inicio", Valor: fmt(data.periodStart, "dd/MM/yyyy") },
    { Indicador: "Período Fin", Valor: fmt(data.periodEnd, "dd/MM/yyyy") },
    { Indicador: "Total Visitas", Valor: data.totalVisits },
    { Indicador: "Visitas Activas", Valor: data.activeVisits },
    { Indicador: "Visitas con Vehículo", Valor: data.visitsWithVehicle },
    { Indicador: "Total Paquetes", Valor: data.totalPackages },
    { Indicador: "Paquetes Pendientes", Valor: data.pendingPackages },
    { Indicador: "Paquetes Entregados", Valor: data.deliveredPackages },
  ];
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resumen Ejecutivo");
  download(wb, `resumen_ejecutivo_${startDate}_${endDate}.xlsx`);
}
