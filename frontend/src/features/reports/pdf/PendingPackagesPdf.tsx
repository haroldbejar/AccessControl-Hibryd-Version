import { View, Text } from "@react-pdf/renderer";
import { ReportLayout, baseStyles as s } from "./ReportLayout";
import type { PackageResponse } from "@/features/packages/types/package.types";

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

const COL = {
  n: "4%",
  control: "9%",
  remitente: "14%",
  empresa: "13%",
  tracking: "12%",
  destino: "14%",
  representante: "18%",
  recepcion: "16%",
};

interface Props {
  data: PackageResponse[];
  generatedAt: string;
}

export const PendingPackagesPdf = ({ data, generatedAt }: Props) => (
  <ReportLayout
    title="Informe de Paquetes Pendientes"
    subtitle={`Total pendientes: ${data.length}`}
    generatedAt={generatedAt}
  >
    <View style={s.tableHeader}>
      <Text style={[s.tableHeaderCell, { width: COL.n }]}>N°</Text>
      <Text style={[s.tableHeaderCell, { width: COL.control }]}>Control</Text>
      <Text style={[s.tableHeaderCell, { width: COL.remitente }]}>
        Remitente
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.empresa }]}>Empresa</Text>
      <Text style={[s.tableHeaderCell, { width: COL.tracking }]}>Tracking</Text>
      <Text style={[s.tableHeaderCell, { width: COL.destino }]}>
        Destinatario
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.representante }]}>
        Representante
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.recepcion }]}>
        F. Recepción
      </Text>
    </View>

    {data.map((p, i) => (
      <View
        key={p.id}
        style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
        wrap={false}
      >
        <Text style={[s.tableCell, { width: COL.n }]}>{i + 1}</Text>
        <Text style={[s.tableCell, { width: COL.control }]}>
          {p.controlNumber}
        </Text>
        <Text style={[s.tableCell, { width: COL.remitente }]}>
          {p.senderName}
        </Text>
        <Text style={[s.tableCell, { width: COL.empresa }]}>
          {p.senderCompany ?? "—"}
        </Text>
        <Text style={[s.tableCell, { width: COL.tracking }]}>
          {p.trackingNumber ?? "—"}
        </Text>
        <Text style={[s.tableCell, { width: COL.destino }]}>
          {p.destinationName}
        </Text>
        <Text style={[s.tableCell, { width: COL.representante }]}>
          {p.representativeName}
        </Text>
        <Text style={[s.tableCell, { width: COL.recepcion }]}>
          {fmt(p.receivedDate)}
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
        No hay paquetes pendientes de entrega.
      </Text>
    )}
  </ReportLayout>
);
