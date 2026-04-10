import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ReactNode } from "react";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 32,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
  },
  // Header
  header: {
    marginBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: "#5B8DEF",
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#5B8DEF",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#6B7280",
  },
  headerDate: {
    fontSize: 8,
    color: "#6B7280",
    textAlign: "right",
  },
  // Body
  content: {
    flex: 1,
  },
  // Tabla encabezado
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EEF2FB",
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#5B8DEF",
  },
  // Fila de tabla
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#D9E4F5",
  },
  tableRowAlt: {
    backgroundColor: "#F4F7FC",
  },
  tableCell: {
    fontSize: 8,
    color: "#1F2937",
  },
  // Badge de estado
  badgeGreen: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 7,
  },
  badgeYellow: {
    backgroundColor: "#FEF9C3",
    color: "#713F12",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 7,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    borderTopWidth: 0.5,
    borderTopColor: "#D9E4F5",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#6B7280",
  },
  // KPI card (para R5)
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  kpiCard: {
    width: "30%",
    backgroundColor: "#EEF2FB",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#5B8DEF",
  },
  kpiLabel: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },
  // Sección titulo secundario
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1F2937",
    marginBottom: 6,
    marginTop: 4,
  },
});

interface ReportLayoutProps {
  title: string;
  subtitle?: string;
  generatedAt: string;
  children: ReactNode;
}

export const ReportLayout = ({
  title,
  subtitle,
  generatedAt,
  children,
}: ReportLayoutProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Access Control</Text>
          <Text style={styles.headerSubtitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
        <Text style={styles.headerDate}>Generado: {generatedAt}</Text>
      </View>

      {/* Contenido inyectado */}
      <View style={styles.content}>{children}</View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          Access Control — Sistema de Control de Acceso
        </Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />
      </View>
    </Page>
  </Document>
);

// Exportamos los estilos para que los PDFs individuales puedan extenderlos
export { styles as baseStyles };
