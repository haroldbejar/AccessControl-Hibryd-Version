import { useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllDestinations } from "@/features/destinations/hooks/useDestinations";
import {
  useRepresentativesByDestination,
  useDeleteRepresentative,
} from "./hooks/useRepresentatives";
import { CreateRepresentativeDialog } from "./components/CreateRepresentativeDialog";
import { EditRepresentativeDialog } from "./components/EditRepresentativeDialog";
import type { RepresentativeResponse } from "./types/representative.types";
import {
  VehicleTypeEnum,
  vehicleTypeLabels,
} from "@/features/visits/types/visit.types";

export function RepresentativesPage() {
  const [selectedDestinationId, setSelectedDestinationId] = useState<
    number | null
  >(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RepresentativeResponse | null>(
    null,
  );

  const { data: destinations = [] } = useAllDestinations();
  const { data: representatives = [], isLoading } =
    useRepresentativesByDestination(selectedDestinationId);
  const deleteRepresentative = useDeleteRepresentative();

  const handleDelete = (id: number) => {
    if (
      !window.confirm(
        "¿Eliminar este representante? Esta acción no se puede deshacer.",
      )
    )
      return;
    deleteRepresentative.mutate(id);
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Representantes</h1>
            <p className="text-sm text-muted-foreground">
              Personas autorizadas por destinatario
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          disabled={!selectedDestinationId}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuevo representante
        </Button>
      </div>

      {/* Filtro por destinatario */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Destinatario:
        </span>
        <Select
          value={selectedDestinationId?.toString() ?? ""}
          onValueChange={(v) => setSelectedDestinationId(Number(v))}
        >
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Seleccionar destinatario..." />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 font-medium">Teléfono</th>
              <th className="text-left px-4 py-3 font-medium">Celular</th>
              <th className="text-left px-4 py-3 font-medium">Vehículo</th>
              <th className="text-right px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!selectedDestinationId ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Selecciona un destinatario para ver sus representantes
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Cargando...
                </td>
              </tr>
            ) : representatives.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Sin representantes para este destinatario
                </td>
              </tr>
            ) : (
              representatives.map((r) => (
                <tr
                  key={r.id}
                  className="border-t hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.cellPhone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.hasVehicle ? (
                      <Badge variant="secondary">
                        {vehicleTypeLabels[r.vehicleTypeId] ??
                          vehicleTypeLabels[VehicleTypeEnum.NA]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        Sin vehículo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditTarget(r)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(r.id)}
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

      <CreateRepresentativeDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultDestinationId={selectedDestinationId ?? 0}
        destinations={destinations}
      />

      {editTarget && (
        <EditRepresentativeDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          representative={editTarget}
          destinations={destinations}
        />
      )}
    </div>
  );
}
