import { View, Text } from "@react-pdf/renderer";
import { ReportLayout, baseStyles as s } from "./ReportLayout";
import type { VisitResponse } from "@/features/visits/types/visit.types";

const fmt = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Anchos de columnas (landscape A4 ≈ 782px útil)
const COL = {
  n: "4%",
  fecha: "11%",
  doc: "10%",
  nombre: "18%",
  destino: "15%",
  representante: "18%",
  entrada: "12%",
  salida: "12%",
};

interface Props {
  data: VisitResponse[];
  startDate: string;
  endDate: string;
  generatedAt: string;
}

export const VisitsPdf = ({ data, startDate, endDate, generatedAt }: Props) => (
  <ReportLayout
    title="Informe de Visitas por Período"
    subtitle={`Período: ${startDate} — ${endDate}`}
    generatedAt={generatedAt}
  >
    {/* Encabezado tabla */}
    <View style={s.tableHeader}>
      <Text style={[s.tableHeaderCell, { width: COL.n }]}>N°</Text>
      <Text style={[s.tableHeaderCell, { width: COL.fecha }]}>Fecha</Text>
      <Text style={[s.tableHeaderCell, { width: COL.doc }]}>Documento</Text>
      <Text style={[s.tableHeaderCell, { width: COL.nombre }]}>Nombre</Text>
      <Text style={[s.tableHeaderCell, { width: COL.destino }]}>Destino</Text>
      <Text style={[s.tableHeaderCell, { width: COL.representante }]}>
        Representante
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.entrada }]}>Entrada</Text>
      <Text style={[s.tableHeaderCell, { width: COL.salida }]}>Salida</Text>
    </View>

    {/* Filas */}
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
        <Text style={[s.tableCell, { width: COL.doc }]}>
          {v.documentNumber}
        </Text>
        <Text style={[s.tableCell, { width: COL.nombre }]}>{v.fullName}</Text>
        <Text style={[s.tableCell, { width: COL.destino }]}>
          {v.destinationName}
        </Text>
        <Text style={[s.tableCell, { width: COL.representante }]}>
          {v.representativeName}
        </Text>
        <Text style={[s.tableCell, { width: COL.entrada }]}>
          {fmt(v.checkIn)}
        </Text>
        <Text style={[s.tableCell, { width: COL.salida }]}>
          {v.checkOut ? fmt(v.checkOut) : "Activa"}
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
        No hay registros para el período seleccionado.
      </Text>
    )}
  </ReportLayout>
);
