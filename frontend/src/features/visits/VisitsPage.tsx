import { useState } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, LogOut, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVisits } from "./hooks/useVisits";
import { CreateVisitDialog } from "./components/CreateVisitDialog";
import { CheckOutDialog } from "./components/CheckOutDialog";
import type { GetAllVisitsParams } from "./types/visit.types";

function todayStart() {
  return format(startOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss");
}
function todayEnd() {
  return format(endOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss");
}

export function VisitsPage() {
  const [filters, setFilters] = useState<GetAllVisitsParams>({
    startDate: todayStart(),
    endDate: todayEnd(),
    documentFilter: undefined,
    nameFilter: undefined,
  });

  const [docInput, setDocInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const { data: visits = [], isFetching, refetch } = useVisits(filters);

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      documentFilter: docInput.trim() || undefined,
      nameFilter: nameInput.trim() || undefined,
    }));
  };

  const clearFilters = () => {
    setDocInput("");
    setNameInput("");
    setFilters({ startDate: todayStart(), endDate: todayEnd() });
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visitas</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isFetching ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCheckOutOpen(true)}
          >
            <LogOut className="h-4 w-4 mr-1" />
            Checkout
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva Visita
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Filtrar por documento..."
          value={docInput}
          onChange={(e) => setDocInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="w-52"
        />
        <Input
          placeholder="Filtrar por nombre..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="w-52"
        />
        <Button variant="secondary" size="sm" onClick={applyFilters}>
          Buscar
        </Button>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Limpiar
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Visitante</th>
              <th className="px-4 py-3 font-medium">Documento</th>
              <th className="px-4 py-3 font-medium">Destino</th>
              <th className="px-4 py-3 font-medium">Representante</th>
              <th className="px-4 py-3 font-medium">Ingreso</th>
              <th className="px-4 py-3 font-medium">Salida</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isFetching && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  Cargando...
                </td>
              </tr>
            )}
            {!isFetching && visits.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  No hay visitas para el período seleccionado
                </td>
              </tr>
            )}
            {!isFetching &&
              visits.map((visit) => (
                <tr
                  key={visit.id}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{visit.fullName}</td>
                  <td className="px-4 py-3">{visit.documentNumber}</td>
                  <td className="px-4 py-3">{visit.destinationName}</td>
                  <td className="px-4 py-3">{visit.representativeName}</td>
                  <td className="px-4 py-3">
                    {format(new Date(visit.checkIn), "HH:mm", { locale: es })}
                  </td>
                  <td className="px-4 py-3">
                    {visit.checkOut
                      ? format(new Date(visit.checkOut), "HH:mm", {
                          locale: es,
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {visit.isCheckedOut ? (
                      <Badge variant="secondary">Salida</Badge>
                    ) : (
                      <Badge variant="default">Activo</Badge>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      {visits.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {visits.length} visita{visits.length !== 1 ? "s" : ""} •{" "}
          {visits.filter((v) => !v.isCheckedOut).length} activa
          {visits.filter((v) => !v.isCheckedOut).length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Modales */}
      <CreateVisitDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <CheckOutDialog
        open={checkOutOpen}
        onClose={() => setCheckOutOpen(false)}
      />
    </div>
  );
}
