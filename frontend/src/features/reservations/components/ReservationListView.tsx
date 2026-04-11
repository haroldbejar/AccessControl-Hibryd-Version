import { X } from "lucide-react";
import type { ReservationResponse } from "../types/reservation.types";
import {
  reservationStatusLabels,
  reservationStatusColors,
  ReservationStatusEnum,
} from "../types/reservation.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  reservations: ReservationResponse[];
  isLoading: boolean;
  isAdmin: boolean;
  onCancelClick: (id: number) => void;
  onConfirm: (id: number) => void;
  onComplete: (id: number) => void;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function ReservationListView({
  reservations,
  isLoading,
  isAdmin,
  onCancelClick,
  onConfirm,
  onComplete,
}: Props) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Cargando reservas…
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No hay reservas para los filtros seleccionados.
      </div>
    );
  }

  const canCancel = (status: number) =>
    status === ReservationStatusEnum.Pending ||
    status === ReservationStatusEnum.Confirmed;

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-muted-foreground text-xs uppercase">
            <th className="py-3 px-4 text-left font-medium w-10">#</th>
            <th className="py-3 px-4 text-left font-medium">Zona</th>
            <th className="py-3 px-4 text-left font-medium hidden sm:table-cell">
              Destinatario
            </th>
            <th className="py-3 px-4 text-left font-medium hidden md:table-cell">
              Representante
            </th>
            <th className="py-3 px-4 text-left font-medium hidden md:table-cell">
              Fecha
            </th>
            <th className="py-3 px-4 text-left font-medium">Horario</th>
            <th className="py-3 px-4 text-left font-medium">Estado</th>
            <th className="py-3 px-4 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r, idx) => (
            <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="py-3 px-4 text-muted-foreground">{idx + 1}</td>
              <td className="py-3 px-4 font-medium">{r.commonAreaName}</td>
              <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">
                {r.destinationName}
              </td>
              <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                {r.representativeName}
              </td>
              <td className="py-3 px-4 hidden md:table-cell text-muted-foreground font-mono text-xs">
                {formatDate(r.reservationDate)}
              </td>
              <td className="py-3 px-4 font-mono text-xs">
                {r.startTime} – {r.endTime}
              </td>
              <td className="py-3 px-4">
                <Badge className={reservationStatusColors[r.status]}>
                  {reservationStatusLabels[r.status]}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  {canCancel(r.status) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onCancelClick(r.id)}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancelar
                    </Button>
                  )}
                  {isAdmin && r.status === ReservationStatusEnum.Pending && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-green-700 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onConfirm(r.id)}
                    >
                      Confirmar
                    </Button>
                  )}
                  {isAdmin && r.status === ReservationStatusEnum.Confirmed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-blue-700 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onComplete(r.id)}
                    >
                      Completar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
