import { useState } from "react";
import type { AvailabilitySlot } from "../types/reservation.types";
import {
  reservationStatusLabels,
  ReservationStatusEnum,
} from "../types/reservation.types";

interface Props {
  slots: AvailabilitySlot[];
  onFreeSlotClick: (slot: AvailabilitySlot) => void;
}

export function AvailabilityGrid({ slots, onFreeSlotClick }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No hay slots de disponibilidad para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {slots.map((slot) => {
        const key = `${slot.startTime}-${slot.endTime}`;
        const isHovered = hoveredId === key;

        return (
          <div key={key} className="relative">
            {slot.isFree ? (
              /* Celda libre — clickeable */
              <button
                type="button"
                onClick={() => onFreeSlotClick(slot)}
                className="w-full flex items-center gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800 hover:bg-green-100 transition-colors text-left"
              >
                <span className="font-mono font-medium w-24 shrink-0">
                  {slot.startTime} – {slot.endTime}
                </span>
                <span className="text-green-600 text-xs">Disponible</span>
              </button>
            ) : (
              /* Celda ocupada — con popover de detalles */
              <div
                className="relative"
                onMouseEnter={() => setHoveredId(key)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="w-full flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm cursor-default select-none">
                  <span className="font-mono font-medium w-24 shrink-0 text-red-800">
                    {slot.startTime} – {slot.endTime}
                  </span>
                  <span className="font-medium text-red-900 truncate">
                    {slot.representativeName ?? "—"}
                  </span>
                  <span className="text-red-600 text-xs hidden sm:inline truncate">
                    {slot.destinationName ?? ""}
                  </span>
                  {slot.status !== null && (
                    <span
                      className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                        slot.status === ReservationStatusEnum.Confirmed
                          ? "bg-green-100 text-green-800 border-green-200"
                          : slot.status === ReservationStatusEnum.Completed
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {reservationStatusLabels[slot.status]}
                    </span>
                  )}
                </div>

                {/* Popover de detalle en hover */}
                {isHovered && (
                  <div className="absolute z-50 left-0 top-full mt-1 w-72 rounded-md border bg-card shadow-lg p-3 text-sm space-y-1.5">
                    <div className="font-semibold text-foreground">
                      {slot.representativeName}
                    </div>
                    {slot.destinationName && (
                      <div className="text-muted-foreground">
                        <span className="font-medium">Destinatario:</span>{" "}
                        {slot.destinationName}
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      <span className="font-medium">Horario:</span>{" "}
                      {slot.startTime} – {slot.endTime}
                    </div>
                    {slot.status !== null && (
                      <div className="text-muted-foreground">
                        <span className="font-medium">Estado:</span>{" "}
                        {reservationStatusLabels[slot.status]}
                      </div>
                    )}
                    {slot.reservationId && (
                      <div className="text-xs text-muted-foreground">
                        Reserva #{slot.reservationId}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
