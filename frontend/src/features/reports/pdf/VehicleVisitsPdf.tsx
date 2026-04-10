import { View, Text } from "@react-pdf/renderer";
import { ReportLayout, baseStyles as s } from "./ReportLayout";
import { vehicleTypeLabels } from "@/features/visits/types/visit.types";
import type { VisitResponse } from "@/features/visits/types/visit.types";

const fmt = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const COL = {
  n: "4%",
  fecha: "9%",
  nombre: "20%",
  tipo: "11%",
  marca: "11%",
  modelo: "11%",
  color: "11%",
  placa: "11%",
  destino: "12%",
};

interface Props {
  data: VisitResponse[];
  startDate: string;
  endDate: string;
  generatedAt: string;
}

export const VehicleVisitsPdf = ({
  data,
  startDate,
  endDate,
  generatedAt,
}: Props) => (
  <ReportLayout
    title="Informe de Visitas con Vehículo"
    subtitle={`Período: ${startDate} — ${endDate} | Total: ${data.length} registros`}
    generatedAt={generatedAt}
  >
    <View style={s.tableHeader}>
      <Text style={[s.tableHeaderCell, { width: COL.n }]}>N°</Text>
      <Text style={[s.tableHeaderCell, { width: COL.fecha }]}>Fecha</Text>
      <Text style={[s.tableHeaderCell, { width: COL.nombre }]}>Nombre</Text>
      <Text style={[s.tableHeaderCell, { width: COL.tipo }]}>Tipo</Text>
      <Text style={[s.tableHeaderCell, { width: COL.marca }]}>Marca</Text>
      <Text style={[s.tableHeaderCell, { width: COL.modelo }]}>Modelo</Text>
      <Text style={[s.tableHeaderCell, { width: COL.color }]}>Color</Text>
      <Text style={[s.tableHeaderCell, { width: COL.placa }]}>Placa</Text>
      <Text style={[s.tableHeaderCell, { width: COL.destino }]}>Destino</Text>
    </View>

    {data.map((v, i) => (
      <View
        key={v.id}
        style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
        wrap={false}
      >
        <Text style={[s.tableCell, { width: COL.n }]}>{i + 1}</Text>
        <Text style={[s.tableCell, { width: COL.fecha }]}>
          {fmt(v.createdDate)}
        </Text>
        <Text style={[s.tableCell, { width: COL.nombre }]}>{v.fullName}</Text>
        <Text style={[s.tableCell, { width: COL.tipo }]}>
          {vehicleTypeLabels[v.vehicleTypeId]}
        </Text>
        <Text style={[s.tableCell, { width: COL.marca }]}>
          {v.brand ?? "—"}
        </Text>
        <Text style={[s.tableCell, { width: COL.modelo }]}>
          {v.model ?? "—"}
        </Text>
        <Text style={[s.tableCell, { width: COL.color }]}>
          {v.color ?? "—"}
        </Text>
        <Text style={[s.tableCell, { width: COL.placa }]}>
          {v.plate ?? "—"}
        </Text>
        <Text style={[s.tableCell, { width: COL.destino }]}>
          {v.destinationName}
        </Text>
      </View>
    ))}

    {data.length === 0 && (
      <Text
        style={[
          s.tableCell,
          { marginTop: 12, textAlign: "center", color: "#6B7280" },
        ]}
      >
        No hay visitas con vehículo en el período seleccionado.
      </Text>
    )}
  </ReportLayout>
);
