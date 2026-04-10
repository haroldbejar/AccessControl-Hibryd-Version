import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ReportLayout, baseStyles as s } from "./ReportLayout";
import { vehicleTypeLabels } from "@/features/visits/types/visit.types";
import type { VisitResponse } from "@/features/visits/types/visit.types";

const toDataUri = (b64?: string): string | null => {
  if (!b64) return null;
  if (b64.startsWith("/9j/")) return `data:image/jpeg;base64,${b64}`;
  if (b64.startsWith("iVBOR")) return `data:image/png;base64,${b64}`;
  return `data:image/jpeg;base64,${b64}`;
};

const local = StyleSheet.create({
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
  foto: "7%",
  n: "3%",
  fecha: "8%",
  nombre: "16%",
  tipo: "10%",
  marca: "10%",
  modelo: "10%",
  color: "10%",
  placa: "10%",
  destino: "16%",
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
      <Text style={[s.tableHeaderCell, { width: COL.foto }]}>Foto</Text>
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

    {data.map((v, i) => {
      const photoUri = toDataUri(v.photo);
      return (
        <View
          key={v.id}
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
      );
    })}

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
