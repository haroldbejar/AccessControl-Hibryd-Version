---
name: "Exportar a Excel (SheetJS)"
description: "Plan de implementación para agregar descarga en formato .xlsx a los 5 informes del módulo de Reportes usando la librería xlsx (SheetJS CE)."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de implementación de Exportar a Excel. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Agregar un botón **"Descargar Excel"** junto al botón "Descargar PDF" existente en `ReportsPage.tsx`, permitiendo exportar los mismos 5 informes (R1–R5) al formato `.xlsx`. La generación ocurre 100% en el cliente sin endpoints nuevos.

---

## Decisiones de arquitectura confirmadas

| Decisión             | Valor                                                                           |
| -------------------- | ------------------------------------------------------------------------------- |
| Librería             | `xlsx` (SheetJS Community Edition) — liviana, sin dependencias, compatible Vite |
| Generación           | 100% cliente — mismo patrón que PDFs (`blob → URL.createObjectURL → click`)     |
| Endpoints nuevos     | Ninguno — reutiliza los datos ya cargados por los hooks de `useReports`         |
| Estilos en celdas    | No incluidos — datos tabulares planos (fuera de scope)                          |
| Fotos en Excel       | Excluidas — inviable con base64 de MySQL                                        |
| Archivos nuevos      | 1 (`exportExcel.ts`) + 1 instalación de paquete                                 |
| Archivos editados    | 1 (`ReportsPage.tsx`) — solo añadir botón y handler                             |
| R5 en Excel          | Solo admin (misma lógica condicional que el tab PDF)                            |
| Instalación          | `npm install xlsx --legacy-peer-deps`                                           |

---

## Estado de implementación

- [ ] **Fase A** — Instalación de `xlsx` y creación de `exportExcel.ts`
- [ ] **Fase B** — Integrar botón "Descargar Excel" en `ReportsPage.tsx`

---

## Columnas por informe

### R1 — Visitas por período

| Columna       | Campo fuente         |
| ------------- | -------------------- |
| N°            | índice + 1           |
| Fecha         | `checkIn` (dd/MM/yyyy HH:mm) |
| Documento     | `documentNumber`     |
| Nombre        | `visitorName`        |
| Destino       | `destinationName`    |
| Representante | `representativeName` |
| Entrada       | `checkIn` (HH:mm)   |
| Salida        | `checkOut` (HH:mm) o "Activa" |

### R2 — Visitas con vehículo

| Columna       | Campo fuente        |
| ------------- | ------------------- |
| N°            | índice + 1          |
| Fecha         | `checkIn` (dd/MM/yyyy) |
| Nombre        | `visitorName`       |
| Tipo vehículo | `vehicleType`       |
| Marca         | `vehicleBrand`      |
| Modelo        | `vehicleModel`      |
| Color         | `vehicleColor`      |
| Placa         | `vehiclePlate`      |

### R3 — Paquetes pendientes

| Columna       | Campo fuente           |
| ------------- | ---------------------- |
| N°            | índice + 1             |
| Control       | `controlNumber`        |
| Remitente     | `senderName`           |
| Empresa       | `senderCompany`        |
| Tracking      | `trackingNumber`       |
| Destinatario  | `destinationName`      |
| Representante | `representativeName`   |
| F. Recepción  | `receivedDate` (dd/MM/yyyy HH:mm) |

### R4 — Historial de paquetes

| Columna      | Campo fuente           |
| ------------ | ---------------------- |
| N°           | índice + 1             |
| Control      | `controlNumber`        |
| Remitente    | `senderName`           |
| Estado       | `statusDescription`    |
| Destinatario | `destinationName`      |
| F. Recepción | `receivedDate` (dd/MM/yyyy) |
| F. Entrega   | `deliveryDate` (dd/MM/yyyy) o "-" |
| Recibido por | `deliveredTo` o "-"    |

### R5 — Resumen ejecutivo (solo admin)

Hoja 1 — **KPIs:**

| Indicador          | Valor                  |
| ------------------ | ---------------------- |
| Total Visitas      | `totalVisits`          |
| Visitas Activas    | `activeVisits`         |
| Visitas con Vehículo | `visitsWithVehicle`  |
| Total Paquetes     | `totalPackages`        |
| Paquetes Pendientes | `pendingPackages`     |
| Paquetes Entregados | `deliveredPackages`   |
| Período Inicio     | `periodStart`          |
| Período Fin        | `periodEnd`            |

---

## Fase A — Instalación y `exportExcel.ts`

### Instalación

```bash
npm install xlsx --legacy-peer-deps
```

### A.1 `frontend/src/features/reports/utils/exportExcel.ts` (NUEVO)

```ts
import * as XLSX from "xlsx";
import { format, parseISO } from "date-fns";
import type { VisitResponse, PackageResponse } from "../types/report.types";
import type { ActivitySummaryResponse } from "../types/report.types";

function fmt(dateStr: string | undefined | null, pattern = "dd/MM/yyyy HH:mm"): string {
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
    Nombre: v.visitorName,
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
      Nombre: v.visitorName,
      "Tipo Vehículo": v.vehicleType ?? "-",
      Marca: v.vehicleBrand ?? "-",
      Modelo: v.vehicleModel ?? "-",
      Color: v.vehicleColor ?? "-",
      Placa: v.vehiclePlate ?? "-",
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
  const today = format(new Date(), "yyyy-MM-dd");
  download(wb, `paquetes_pendientes_${today}.xlsx`);
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
```

### Verificación Fase A

```
npm run build → 0 errores
```

---

## Fase B — Botón "Descargar Excel" en `ReportsPage.tsx`

### Archivo

`frontend/src/features/reports/ReportsPage.tsx` (EDITAR)

### B.1 — Nuevos imports

```ts
import { FileSpreadsheet } from "lucide-react";
import {
  exportVisitsToExcel,
  exportVehicleVisitsToExcel,
  exportPendingPackagesToExcel,
  exportPackagesHistoryToExcel,
  exportActivitySummaryToExcel,
} from "./utils/exportExcel";
```

### B.2 — Nuevo estado y handler

Añadir junto a `const [downloading, setDownloading] = useState(false)`:

```ts
const [downloadingExcel, setDownloadingExcel] = useState(false);
```

Añadir handler `handleDownloadExcel` (síncrono — SheetJS no requiere async):

```ts
const handleDownloadExcel = () => {
  setDownloadingExcel(true);
  try {
    if (activeTab === "r1" && r1.data)
      exportVisitsToExcel(r1.data, startDate, endDate);
    else if (activeTab === "r2" && r2.data)
      exportVehicleVisitsToExcel(r2.data, startDate, endDate);
    else if (activeTab === "r3" && r3.data)
      exportPendingPackagesToExcel(r3.data);
    else if (activeTab === "r4" && r4.data)
      exportPackagesHistoryToExcel(r4.data, startDate, endDate);
    else if (activeTab === "r5" && r5.data)
      exportActivitySummaryToExcel(r5.data, startDate, endDate);
  } finally {
    setDownloadingExcel(false);
  }
};
```

### B.3 — Botón Excel en el panel de acciones

Añadir **antes** del botón "Descargar PDF" existente, dentro del `<div className="flex gap-2 shrink-0">`:

```tsx
<Button
  variant="outline"
  onClick={handleDownloadExcel}
  disabled={!canDownload || downloadingExcel}
  className="gap-2"
>
  {downloadingExcel ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <FileSpreadsheet className="h-4 w-4" />
  )}
  {downloadingExcel ? "Generando..." : "Descargar Excel"}
</Button>
```

### Verificación Fase B

```
npm run build → 0 errores
```

**Flujo a probar:**
1. Abrir `/reports` → tab "Visitas por período" → elegir fechas → "Descargar Excel"
2. Se descarga `visitas_2026-01-01_2026-04-15.xlsx`
3. Abrirlo en Excel/LibreOffice → columnas correctas, datos alineados
4. Repetir para los 5 informes
5. R5 solo visible y descargable para admin

---

## Archivos a crear / editar — resumen

### Frontend (1 nuevo + 1 editado)

```
frontend/src/features/reports/
  utils/exportExcel.ts              ← NUEVO
  ReportsPage.tsx                   ← EDITAR (import + estado + handler + botón)
```

### Backend

Sin cambios.

---

## Notas técnicas

- **`XLSX.writeFile()`** genera y descarga el archivo directamente — no necesita `URL.createObjectURL`.
- **`date-fns`** ya es dependencia del proyecto — no requiere instalación adicional.
- **`VisitResponse`** tiene campos opcionales de vehículo (`vehicleBrand`, `vehicleModel`, etc.) → usar `?? "-"` para celdas vacías.
- **Filtro `hasVehicle`** en R2 — el hook `useVehicleVisitsReport` ya filtra en cliente; la función de Excel aplica el mismo filtro como segunda capa defensiva.
- **R5 síncrono** — `ActivitySummaryResponse` es un objeto plano (no array), se convierte a array de pares `{ Indicador, Valor }`.
- **`--legacy-peer-deps`** requerido porque `xlsx` puede tener conflictos de peer con React 19.

---

## Verificación final end-to-end

- [ ] `npm install xlsx --legacy-peer-deps` → sin errores
- [ ] `npm run build` → 0 errores
- [ ] R1 Excel: columnas correctas, filas por visita, salida "Activa" si no tiene checkout
- [ ] R2 Excel: solo visitas con vehículo, datos de vehículo presentes
- [ ] R3 Excel: paquetes pendientes actuales, sin fecha de entrega
- [ ] R4 Excel: historial completo con estado y fechas
- [ ] R5 Excel: tabla de KPIs, solo visible para admin
- [ ] Botón PDF sigue funcionando (sin regresión)
- [ ] Botón "Descargar Excel" deshabilitado mientras los datos cargan
