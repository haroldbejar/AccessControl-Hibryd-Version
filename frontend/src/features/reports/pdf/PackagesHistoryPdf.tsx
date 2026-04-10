import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
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

const toDataUri = (b64?: string): string | null => {
  if (!b64) return null;
  if (b64.startsWith("/9j/")) return `data:image/jpeg;base64,${b64}`;
  if (b64.startsWith("iVBOR")) return `data:image/png;base64,${b64}`;
  return `data:image/jpeg;base64,${b64}`;
};

const local = StyleSheet.create({
  badgePending: { ...s.badgeYellow, fontSize: 7 },
  badgeDelivered: { ...s.badgeGreen, fontSize: 7 },
  photoCell: { width: "7%", justifyContent: "center", alignItems: "center" },
  photo: { width: 38, height: 48, borderRadius: 2, objectFit: "cover" },
  photoPlaceholder: {
    width: 38,
    height: 48,
    backgroundColor: "#EEF2FB",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: { fontSize: 6, color: "#6B7280" },
  rowWithPhoto: { minHeight: 56 },
});

const COL = {
  foto: "7%",
  n: "3%",
  control: "8%",
  remitente: "12%",
  estado: "8%",
  destino: "12%",
  recepcion: "13%",
  entrega: "13%",
  recibidoPor: "24%",
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
      <Text style={[s.tableHeaderCell, { width: COL.foto }]}>Foto</Text>
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
        F. Recepcín
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.entrega }]}>
        F. Entrega
      </Text>
      <Text style={[s.tableHeaderCell, { width: COL.recibidoPor }]}>
        Recibido por
      </Text>
    </View>

    {data.map((p, i) => {
      const photoUri = toDataUri(p.photo);
      return (
        <View
          key={p.id}
          style={[
            s.tableRow,
            i % 2 === 1 ? s.tableRowAlt : {},
            local.rowWithPhoto,
          ]}
          wrap={false}
        >
          <View style={local.photoCell}>
            {photoUri ? (
              <Image src={photoUri} style={local.photo} />
            ) : (
              <View style={local.photoPlaceholder}>
                <Text style={local.photoPlaceholderText}>Sin foto</Text>
              </View>
            )}
          </View>
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
      );
    })}

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
