import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ReportLayout, baseStyles as s } from "./ReportLayout";
import type { ActivitySummaryResponse } from "../types/report.types";

const local = StyleSheet.create({
  kpiGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#EEF2FB",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  kpiValue: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#5B8DEF",
  },
  kpiLabel: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 3,
    textAlign: "center",
  },
  distributionHeader: {
    flexDirection: "row",
    backgroundColor: "#EEF2FB",
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  distributionRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#D9E4F5",
    alignItems: "center",
  },
  distributionRowAlt: {
    backgroundColor: "#F4F7FC",
  },
  colCategory: { width: "35%", fontSize: 8, color: "#1F2937" },
  colValue: { width: "20%", fontSize: 8, color: "#1F2937", textAlign: "right" },
  colLabel: { fontFamily: "Helvetica-Bold", fontSize: 8, color: "#5B8DEF" },
  accentBadge: {
    backgroundColor: "#A78BFA",
    color: "#FFFFFF",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    fontSize: 7,
  },
});

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

interface Props {
  data: ActivitySummaryResponse;
  generatedAt: string;
}

export const ActivitySummaryPdf = ({ data, generatedAt }: Props) => (
  <ReportLayout
    title="Resumen Ejecutivo de Actividad"
    subtitle={`Período: ${fmtDate(data.periodStart)} — ${fmtDate(data.periodEnd)}`}
    generatedAt={generatedAt}
  >
    {/* KPI Cards */}
    <Text style={s.sectionTitle}>Indicadores del período</Text>
    <View style={local.kpiGrid}>
      <View style={local.kpiCard}>
        <Text style={local.kpiValue}>{data.totalVisits}</Text>
        <Text style={local.kpiLabel}>Total visitas</Text>
      </View>
      <View style={local.kpiCard}>
        <Text style={local.kpiValue}>{data.activeVisits}</Text>
        <Text style={local.kpiLabel}>Visitas activas</Text>
      </View>
      <View style={local.kpiCard}>
        <Text style={local.kpiValue}>{data.visitsWithVehicle}</Text>
        <Text style={local.kpiLabel}>Con vehículo</Text>
      </View>
      <View style={local.kpiCard}>
        <Text style={local.kpiValue}>{data.totalPackages}</Text>
        <Text style={local.kpiLabel}>Total paquetes</Text>
      </View>
      <View style={local.kpiCard}>
        <Text style={local.kpiValue}>{data.pendingPackages}</Text>
        <Text style={local.kpiLabel}>Paquetes pendientes</Text>
      </View>
      <View style={local.kpiCard}>
        <Text style={local.kpiValue}>{data.deliveredPackages}</Text>
        <Text style={local.kpiLabel}>Paquetes entregados</Text>
      </View>
    </View>

    {/* Tabla de distribución */}
    <Text style={s.sectionTitle}>Distribución de actividad</Text>

    {/* Header */}
    <View style={local.distributionHeader}>
      <Text style={[local.colLabel, { width: "35%" }]}>Categoría</Text>
      <Text style={[local.colLabel, { width: "20%", textAlign: "right" }]}>
        Valor
      </Text>
      <Text style={[local.colLabel, { width: "45%", paddingLeft: 8 }]}>
        Detalle
      </Text>
    </View>

    {/* Filas visitas */}
    <View style={local.distributionRow}>
      <Text style={local.colCategory}>Visitas totales del período</Text>
      <Text style={local.colValue}>{data.totalVisits}</Text>
      <View style={{ width: "45%", paddingLeft: 8 }}>
        <Text style={s.tableCell}>—</Text>
      </View>
    </View>
    <View style={[local.distributionRow, local.distributionRowAlt]}>
      <Text style={local.colCategory}>Visitas activas (sin salida)</Text>
      <Text style={local.colValue}>{data.activeVisits}</Text>
      <View style={{ width: "45%", paddingLeft: 8 }}>
        <Text style={s.tableCell}>
          {data.totalVisits > 0
            ? `${((data.activeVisits / data.totalVisits) * 100).toFixed(1)}% del total`
            : "—"}
        </Text>
      </View>
    </View>
    <View style={local.distributionRow}>
      <Text style={local.colCategory}>Visitas con vehículo</Text>
      <Text style={local.colValue}>{data.visitsWithVehicle}</Text>
      <View style={{ width: "45%", paddingLeft: 8 }}>
        <Text style={s.tableCell}>
          {data.totalVisits > 0
            ? `${((data.visitsWithVehicle / data.totalVisits) * 100).toFixed(1)}% del total`
            : "—"}
        </Text>
      </View>
    </View>

    {/* Filas paquetes */}
    <View style={[local.distributionRow, local.distributionRowAlt]}>
      <Text style={local.colCategory}>Paquetes totales del período</Text>
      <Text style={local.colValue}>{data.totalPackages}</Text>
      <View style={{ width: "45%", paddingLeft: 8 }}>
        <Text style={s.tableCell}>—</Text>
      </View>
    </View>
    <View style={local.distributionRow}>
      <Text style={local.colCategory}>Paquetes entregados</Text>
      <Text style={local.colValue}>{data.deliveredPackages}</Text>
      <View style={{ width: "45%", paddingLeft: 8 }}>
        <Text style={s.tableCell}>
          {data.totalPackages > 0
            ? `${((data.deliveredPackages / data.totalPackages) * 100).toFixed(1)}% entregados`
            : "—"}
        </Text>
      </View>
    </View>
    <View style={[local.distributionRow, local.distributionRowAlt]}>
      <Text style={local.colCategory}>Paquetes pendientes de entrega</Text>
      <Text style={local.colValue}>{data.pendingPackages}</Text>
      <View style={{ width: "45%", paddingLeft: 8 }}>
        <View style={data.pendingPackages > 0 ? local.accentBadge : {}}>
          <Text
            style={{
              fontSize: 7,
              color: data.pendingPackages > 0 ? "#FFFFFF" : "#6B7280",
            }}
          >
            {data.pendingPackages > 0 ? "Requieren atención" : "Sin pendientes"}
          </Text>
        </View>
      </View>
    </View>
  </ReportLayout>
);
