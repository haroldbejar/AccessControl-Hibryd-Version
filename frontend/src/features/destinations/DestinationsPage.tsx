import { useState } from "react";
import { Plus, Building2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAllDestinations,
  useDeleteDestination,
} from "./hooks/useDestinations";
import { CreateDestinationDialog } from "./components/CreateDestinationDialog";

export function DestinationsPage() {
  const { data: destinations = [], isLoading } = useAllDestinations();
  const deleteDestination = useDeleteDestination();
  const [createOpen, setCreateOpen] = useState(false);

  const handleDelete = (id: number) => {
    if (
      !window.confirm(
        "¿Eliminar este destinatario? Esta acción no se puede deshacer.",
      )
    )
      return;
    deleteDestination.mutate(id);
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Destinatarios</h1>
            <p className="text-sm text-muted-foreground">
              Empresas o áreas que reciben visitas
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo destinatario
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-md border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-right px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-10 text-muted-foreground"
                >
                  Cargando...
                </td>
              </tr>
            ) : destinations.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-10 text-muted-foreground"
                >
                  Sin destinatarios registrados
                </td>
              </tr>
            ) : (
              destinations.map((d, i) => (
                <tr
                  key={d.id}
                  className="border-t hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(d.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateDestinationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
