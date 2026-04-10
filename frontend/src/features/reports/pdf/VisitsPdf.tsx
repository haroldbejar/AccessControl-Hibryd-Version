import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ReportLayout, baseStyles as s } from "./ReportLayout";
import type { VisitResponse } from "@/features/visits/types/visit.types";

// Convierte base64 puro a data URI detectando el formato
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
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Anchos de columnas (landscape A4 ≈ 782px útil)
const COL = {
  foto: "7%",
  n: "3%",
  fecha: "10%",
  doc: "9%",
  nombre: "16%",
  destino: "14%",
  representante: "16%",
  entrada: "12%",
  salida: "13%",
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
      <Text style={[s.tableHeaderCell, { width: COL.foto }]}>Foto</Text>
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
          {/* Foto del visitante */}
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
      );
    })}

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
