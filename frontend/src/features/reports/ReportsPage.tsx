import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { FileBarChart2, Download, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore";
import { ReportFilters } from "./components/ReportFilters";
import {
  useVisitsReport,
  useVehicleVisitsReport,
  usePendingPackagesReport,
  usePackagesHistoryReport,
  useActivitySummary,
} from "./hooks/useReports";
import { VisitsPdf } from "./pdf/VisitsPdf";
import { VehicleVisitsPdf } from "./pdf/VehicleVisitsPdf";
import { PendingPackagesPdf } from "./pdf/PendingPackagesPdf";
import { PackagesHistoryPdf } from "./pdf/PackagesHistoryPdf";
import { ActivitySummaryPdf } from "./pdf/ActivitySummaryPdf";

// Fecha de hoy en formato yyyy-MM-dd
const today = () => new Date().toISOString().split("T")[0];
// Primer día del mes actual
const firstOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
};
// Generado en formato legible Colombia
const nowLabel = () =>
  new Date().toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

type TabId = "r1" | "r2" | "r3" | "r4" | "r5";

const TABS_WITH_DATES: TabId[] = ["r1", "r2", "r4", "r5"];

export function ReportsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roleName?.toLowerCase().includes("admin") ?? false;

  const [activeTab, setActiveTab] = useState<TabId>("r1");
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [downloading, setDownloading] = useState(false);

  const dateParams = { startDate, endDate };
  const needsDates = TABS_WITH_DATES.includes(activeTab);

  // Cada hook se activa solo cuando su tab está activo y los parámetros son válidos
  const r1 = useVisitsReport(
    dateParams,
    activeTab === "r1" && !!startDate && !!endDate,
  );
  const r2 = useVehicleVisitsReport(
    dateParams,
    activeTab === "r2" && !!startDate && !!endDate,
  );
  const r3 = usePendingPackagesReport(activeTab === "r3");
  const r4 = usePackagesHistoryReport(
    dateParams,
    activeTab === "r4" && !!startDate && !!endDate,
  );
  const r5 = useActivitySummary(
    dateParams,
    activeTab === "r5" && !!startDate && !!endDate,
  );

  const isLoading =
    r1.isFetching ||
    r2.isFetching ||
    r3.isFetching ||
    r4.isFetching ||
    r5.isFetching;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const gen = nowLabel();
      let blob: Blob | null = null;
      let filename = "reporte.pdf";

      if (activeTab === "r1" && r1.data) {
        blob = await pdf(
          <VisitsPdf
            data={r1.data}
            startDate={startDate}
            endDate={endDate}
            generatedAt={gen}
          />,
        ).toBlob();
        filename = `visitas_${startDate}_${endDate}.pdf`;
      } else if (activeTab === "r2" && r2.data) {
        blob = await pdf(
          <VehicleVisitsPdf
            data={r2.data}
            startDate={startDate}
            endDate={endDate}
            generatedAt={gen}
          />,
        ).toBlob();
        filename = `visitas_vehiculo_${startDate}_${endDate}.pdf`;
      } else if (activeTab === "r3" && r3.data) {
        blob = await pdf(
          <PendingPackagesPdf data={r3.data} generatedAt={gen} />,
        ).toBlob();
        filename = `paquetes_pendientes_${today()}.pdf`;
      } else if (activeTab === "r4" && r4.data) {
        blob = await pdf(
          <PackagesHistoryPdf
            data={r4.data}
            startDate={startDate}
            endDate={endDate}
            generatedAt={gen}
          />,
        ).toBlob();
        filename = `historial_paquetes_${startDate}_${endDate}.pdf`;
      } else if (activeTab === "r5" && r5.data) {
        blob = await pdf(
          <ActivitySummaryPdf data={r5.data} generatedAt={gen} />,
        ).toBlob();
        filename = `resumen_ejecutivo_${startDate}_${endDate}.pdf`;
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setDownloading(false);
    }
  };

  const currentData =
    activeTab === "r1"
      ? r1.data
      : activeTab === "r2"
        ? r2.data
        : activeTab === "r3"
          ? r3.data
          : activeTab === "r4"
            ? r4.data
            : r5.data;

  const canDownload = !!currentData && !isLoading;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <FileBarChart2 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Genera y descarga informes en PDF
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        {/* Selector de informe */}
        <TabsList className="mb-2">
          <TabsTrigger value="r1">Visitas por período</TabsTrigger>
          <TabsTrigger value="r2">Visitas con vehículo</TabsTrigger>
          <TabsTrigger value="r3">Paquetes pendientes</TabsTrigger>
          <TabsTrigger value="r4">Historial paquetes</TabsTrigger>
          {isAdmin && <TabsTrigger value="r5">Resumen ejecutivo</TabsTrigger>}
        </TabsList>

        {/* Panel de filtros + descarga */}
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border bg-card p-4">
          <ReportFilters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            showDates={needsDates}
          />

          {!needsDates && (
            <p className="text-sm text-muted-foreground">
              Este informe no requiere filtro de fechas.
            </p>
          )}

          <Button
            onClick={handleDownload}
            disabled={!canDownload || downloading}
            className="gap-2 shrink-0"
          >
            {downloading || isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading
              ? "Generando..."
              : isLoading
                ? "Cargando datos..."
                : "Descargar PDF"}
          </Button>
        </div>

        {/* Previews por tab (resumen de datos cargados) */}
        <TabsContent value="r1">
          <DataSummary
            count={r1.data?.length}
            label="visitas encontradas"
            error={r1.error}
          />
        </TabsContent>
        <TabsContent value="r2">
          <DataSummary
            count={r2.data?.length}
            label="visitas con vehículo"
            error={r2.error}
          />
        </TabsContent>
        <TabsContent value="r3">
          <DataSummary
            count={r3.data?.length}
            label="paquetes pendientes"
            error={r3.error}
          />
        </TabsContent>
        <TabsContent value="r4">
          <DataSummary
            count={r4.data?.length}
            label="paquetes en el período"
            error={r4.error}
          />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="r5">
            {r5.data ? (
              <div className="grid grid-cols-3 gap-3 mt-2">
                <KpiPreview label="Total visitas" value={r5.data.totalVisits} />
                <KpiPreview
                  label="Visitas activas"
                  value={r5.data.activeVisits}
                />
                <KpiPreview
                  label="Con vehículo"
                  value={r5.data.visitsWithVehicle}
                />
                <KpiPreview
                  label="Total paquetes"
                  value={r5.data.totalPackages}
                />
                <KpiPreview
                  label="Pendientes"
                  value={r5.data.pendingPackages}
                />
                <KpiPreview
                  label="Entregados"
                  value={r5.data.deliveredPackages}
                />
              </div>
            ) : (
              <DataSummary count={undefined} label="resumen" error={r5.error} />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Componente pequeño de resumen de datos
function DataSummary({
  count,
  label,
  error,
}: {
  count: number | undefined;
  label: string;
  error: Error | null;
}) {
  if (error) {
    return (
      <p className="mt-3 text-sm text-destructive">
        Error al cargar los datos. Verifica la conexión con el servidor.
      </p>
    );
  }
  if (count === undefined) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Selecciona el rango de fechas y pulsa &quot;Descargar PDF&quot;.
      </p>
    );
  }
  return (
    <p className="mt-3 text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{count}</span> {label}{" "}
      listos para exportar.
    </p>
  );
}

// Tarjeta KPI para previsualización del R5
function KpiPreview({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-secondary p-4 text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
