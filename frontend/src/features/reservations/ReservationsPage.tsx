import { useState } from "react";
import { Plus, List, Grid } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useReservations,
  useAvailability,
  useConfirmReservation,
  useCompleteReservation,
} from "./hooks/useReservations";
import { useCommonAreas } from "./hooks/useCommonAreas";
import type { AvailabilitySlot } from "./types/reservation.types";
import { AvailabilityGrid } from "./components/AvailabilityGrid";
import { ReservationListView } from "./components/ReservationListView";
import { CreateReservationDialog } from "./components/CreateReservationDialog";
import { CancelReservationDialog } from "./components/CancelReservationDialog";

type ViewMode = "grid" | "list";

interface Preselected {
  commonAreaId?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export function ReservationsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roleName?.toLowerCase().includes("admin") ?? false;

  /* Filtros */
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(today);
  const [commonAreaId, setCommonAreaId] = useState<number | null>(null);
  const [view, setView] = useState<ViewMode>("grid");

  /* Dialogs */
  const [createOpen, setCreateOpen] = useState(false);
  const [preselected, setPreselected] = useState<Preselected>({});
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);

  /* Queries */
  const { data: areas = [] } = useCommonAreas();
  const { data: availability, isLoading: loadingGrid } = useAvailability(
    commonAreaId,
    date,
  );
  const { data: reservations = [], isLoading: loadingList } = useReservations({
    date: date || undefined,
    commonAreaId: commonAreaId ?? undefined,
  });

  /* Mutations (gestionadas en la página) */
  const confirmMutation = useConfirmReservation();
  const completeMutation = useCompleteReservation();

  function handleFreeSlotClick(slot: AvailabilitySlot) {
    setPreselected({
      commonAreaId: commonAreaId ?? undefined,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setCreateOpen(true);
  }

  function handleNewReservation() {
    setPreselected({ commonAreaId: commonAreaId ?? undefined, date });
    setCreateOpen(true);
  }

  function handleCloseCreate() {
    setCreateOpen(false);
    setPreselected({});
  }

  function handleConfirm(id: number) {
    confirmMutation.mutate(id);
  }

  function handleComplete(id: number) {
    completeMutation.mutate(id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
        <p className="text-muted-foreground text-sm">
          Gestión de reservas de zonas comunes
        </p>
      </div>

      {/* Barra de controles */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Selector de fecha */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />

        {/* Selector de zona */}
        <Select
          value={commonAreaId !== null ? String(commonAreaId) : "all"}
          onValueChange={(v) => setCommonAreaId(v === "all" ? null : Number(v))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las zonas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las zonas</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Toggle vista grilla / lista */}
        <div className="flex items-center rounded-md border bg-muted p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium transition-colors ${
              view === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid className="h-4 w-4" />
            Horario
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" />
            Lista
          </button>
        </div>

        {/* Nueva reserva */}
        <Button className="ml-auto" onClick={handleNewReservation}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva reserva
        </Button>
      </div>

      {/* Aviso si no hay zona seleccionada en vista grilla */}
      {view === "grid" && !commonAreaId && (
        <div className="rounded-md border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
          Selecciona una zona para ver su disponibilidad por horario.
        </div>
      )}

      {/* Vista grilla */}
      {view === "grid" && commonAreaId !== null && (
        <div className="space-y-2">
          {loadingGrid ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Cargando disponibilidad…
            </div>
          ) : availability ? (
            <>
              <div className="text-xs text-muted-foreground">
                {availability.commonAreaName} · {availability.openingTime} a{" "}
                {availability.closingTime}
              </div>
              <AvailabilityGrid
                slots={availability.slots}
                onFreeSlotClick={handleFreeSlotClick}
              />
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No hay información de disponibilidad.
            </div>
          )}
        </div>
      )}

      {/* Vista lista */}
      {view === "list" && (
        <ReservationListView
          reservations={reservations}
          isLoading={loadingList}
          isAdmin={isAdmin}
          onCancelClick={(id) => setCancelTargetId(id)}
          onConfirm={handleConfirm}
          onComplete={handleComplete}
        />
      )}

      {/* Dialogs */}
      <CreateReservationDialog
        open={createOpen}
        onClose={handleCloseCreate}
        preselected={preselected}
      />

      {cancelTargetId !== null && (
        <CancelReservationDialog
          reservationId={cancelTargetId}
          open={cancelTargetId !== null}
          onClose={() => setCancelTargetId(null)}
        />
      )}
    </div>
  );
}
