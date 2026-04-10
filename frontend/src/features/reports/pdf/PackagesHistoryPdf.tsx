import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ReportLayout, baseStyles as s } from "./ReportLayout";
import type { PackageResponse } from "@/features/packages/types/package.types";
import { PackagesStatusEnum } from "@/features/packages/types/package.types";

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

const local = StyleSheet.create({
  badgePending: {
    ...s.badgeYellow,
    fontSize: 7,
  },
  badgeDelivered: {
    ...s.badgeGreen,
    fontSize: 7,
  },
});

const COL = {
  n: "4%",
  control: "9%",
  remitente: "14%",
  estado: "9%",
  destino: "13%",
  recepcion: "14%",
  entrega: "14%",
  recibidoPor: "23%",
};

interface Props {
  data: PackageResponse[];
  startDate: string;
  endDate: string;
  generatedAt: string;
}

export const PackagesHistoryPdf = ({
  data,
  startDate,
  endDate,
  generatedAt,
}: Props) => (
  <ReportLayout
    title="Historial de Paquetes"
    subtitle={`Período: ${startDate} — ${endDate} | Total: ${data.length} registros`}
    generatedAt={generatedAt}
  >
    <View style={s.tableHeader}>
      <Text style={[s.tableHeaderCell, { width: COL.n }]}>N°</Text>
      <Text style={[s.tableHeaderCell, { width: COL.control }]}>Control</Text>
      <Text style={[s.tableHeaderCell, { width: COL.remitente }]}>
        Remitente
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.estado }]}>Estado</Text>
      <Text style={[s.tableHeaderCell, { width: COL.destino }]}>
        Destinatario
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.recepcion }]}>
        F. Recepción
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.entrega }]}>
        F. Entrega
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.recibidoPor }]}>
        Recibido por
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
        <View style={{ width: COL.estado }}>
          <Text
            style={
              p.status === PackagesStatusEnum.Delivered
                ? local.badgeDelivered
                : local.badgePending
            }
          >
            {p.statusDescription}
          </Text>
        </View>
        <Text style={[s.tableCell, { width: COL.destino }]}>
          {p.destinationName}
        </Text>
        <Text style={[s.tableCell, { width: COL.recepcion }]}>
          {fmt(p.receivedDate)}
        </Text>
        <Text style={[s.tableCell, { width: COL.entrega }]}>
          {fmt(p.deliveryDate)}
        </Text>
        <Text style={[s.tableCell, { width: COL.recibidoPor }]}>
          {p.deliveredTo ?? "—"}
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
        No hay paquetes en el período seleccionado.
      </Text>
    )}
  </ReportLayout>
);
