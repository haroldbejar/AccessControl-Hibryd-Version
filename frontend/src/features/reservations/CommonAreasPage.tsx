import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommonAreas, useDeleteCommonArea } from "./hooks/useCommonAreas";
import { CreateCommonAreaDialog } from "./components/CreateCommonAreaDialog";
import { EditCommonAreaDialog } from "./components/EditCommonAreaDialog";
import type { CommonAreaResponse } from "./types/reservation.types";

export function CommonAreasPage() {
  const { data: areas = [], isLoading } = useCommonAreas();
  const deleteArea = useDeleteCommonArea();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CommonAreaResponse | null>(null);

  const handleDelete = (area: CommonAreaResponse) => {
    if (
      !window.confirm(
        `¿Eliminar la zona "${area.name}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    deleteArea.mutate(area.id);
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Zonas comunes</h1>
            <p className="text-sm text-muted-foreground">
              Gestión de espacios disponibles para reserva
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva zona
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-md border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                Descripción
              </th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                Capacidad
              </th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                Ubicación
              </th>
              <th className="text-left px-4 py-3 font-medium">Horario</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-right px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-muted-foreground"
                >
                  Cargando...
                </td>
              </tr>
            ) : areas.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-muted-foreground"
                >
                  No hay zonas comunes registradas
                </td>
              </tr>
            ) : (
              areas.map((area, i) => (
                <tr
                  key={area.id}
                  className="border-t hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{area.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-48 truncate">
                    {area.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {area.capacity ? `${area.capacity} personas` : "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {area.location ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {area.openingTime} – {area.closingTime}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        area.visible
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {area.visible ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditTarget(area)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(area)}
                        title="Eliminar"
                        disabled={deleteArea.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <CreateCommonAreaDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      {editTarget && (
        <EditCommonAreaDialog
          area={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
