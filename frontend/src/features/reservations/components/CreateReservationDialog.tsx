import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAllDestinations } from "@/features/destinations/hooks/useDestinations";
import { useRepresentativesByDestination } from "@/features/representatives/hooks/useRepresentatives";
import { useCommonAreas } from "../hooks/useCommonAreas";
import { useCreateReservation } from "../hooks/useReservations";

const schema = z
  .object({
    commonAreaId: z.number().min(1, "Seleccione una zona"),
    destinationId: z.number().min(1, "Seleccione un destinatario"),
    representativeId: z.number().min(1, "Seleccione un representante"),
    reservationDate: z.string().min(1, "Seleccione una fecha"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
    notes: z.string().max(500, "Máximo 500 caracteres").optional(),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: "La hora de inicio debe ser anterior a la hora de fin",
    path: ["endTime"],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Preselecciones cuando se hace clic desde la grilla */
  preselected?: {
    commonAreaId?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
  };
}

const today = new Date().toISOString().split("T")[0];

export function CreateReservationDialog({ open, onClose, preselected }: Props) {
  const { user } = useAuthStore();
  const { data: areas = [] } = useCommonAreas();
  const { data: destinations = [] } = useAllDestinations();
  const createReservation = useCreateReservation(onClose);

  const [selectedDestinationId, setSelectedDestinationId] = useState<
    number | null
  >(null);
  const { data: representatives = [] } = useRepresentativesByDestination(
    selectedDestinationId,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      commonAreaId: preselected?.commonAreaId ?? 0,
      destinationId: 0,
      representativeId: 0,
      reservationDate: preselected?.date ?? today,
      startTime: preselected?.startTime ?? "08:00",
      endTime: preselected?.endTime ?? "09:00",
      notes: "",
    },
  });

  // Actualizar valores cuando cambian las preselecciones
  useEffect(() => {
    if (open) {
      setValue("commonAreaId", preselected?.commonAreaId ?? 0);
      setValue("reservationDate", preselected?.date ?? today);
      setValue("startTime", preselected?.startTime ?? "08:00");
      setValue("endTime", preselected?.endTime ?? "09:00");
    }
  }, [open, preselected, setValue]);

  const commonAreaId = watch("commonAreaId");
  const destinationId = watch("destinationId");

  const handleClose = () => {
    reset();
    setSelectedDestinationId(null);
    onClose();
  };

  const onSubmit = (data: FormData) => {
    createReservation.mutate({
      commonAreaId: data.commonAreaId,
      destinationId: data.destinationId,
      representativeId: data.representativeId,
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes?.trim() || null,
      userCreated: user?.userId ?? 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva reserva</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Zona común */}
          <div className="space-y-1.5">
            <Label>
              Zona común <span className="text-destructive">*</span>
            </Label>
            <Select
              value={commonAreaId > 0 ? String(commonAreaId) : ""}
              onValueChange={(v) =>
                setValue("commonAreaId", Number(v), { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una zona" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name} ({a.openingTime}–{a.closingTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.commonAreaId && (
              <p className="text-xs text-destructive">
                {errors.commonAreaId.message}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <Label htmlFor="res-date">
              Fecha <span className="text-destructive">*</span>
            </Label>
            <Input
              id="res-date"
              type="date"
              min={today}
              {...register("reservationDate")}
            />
            {errors.reservationDate && (
              <p className="text-xs text-destructive">
                {errors.reservationDate.message}
              </p>
            )}
          </div>

          {/* Horario */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="res-start">
                Hora inicio <span className="text-destructive">*</span>
              </Label>
              <Input id="res-start" type="time" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-xs text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-end">
                Hora fin <span className="text-destructive">*</span>
              </Label>
              <Input id="res-end" type="time" {...register("endTime")} />
              {errors.endTime && (
                <p className="text-xs text-destructive">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Destinatario */}
          <div className="space-y-1.5">
            <Label>
              Destinatario <span className="text-destructive">*</span>
            </Label>
            <Select
              value={destinationId > 0 ? String(destinationId) : ""}
              onValueChange={(v) => {
                const id = Number(v);
                setValue("destinationId", id, { shouldValidate: true });
                setValue("representativeId", 0);
                setSelectedDestinationId(id);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un destinatario" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destinationId && (
              <p className="text-xs text-destructive">
                {errors.destinationId.message}
              </p>
            )}
          </div>

          {/* Representante */}
          <div className="space-y-1.5">
            <Label>
              Representante <span className="text-destructive">*</span>
            </Label>
            <Select
              value={
                watch("representativeId") > 0
                  ? String(watch("representativeId"))
                  : ""
              }
              onValueChange={(v) =>
                setValue("representativeId", Number(v), {
                  shouldValidate: true,
                })
              }
              disabled={!selectedDestinationId || representatives.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedDestinationId
                      ? "Primero seleccione un destinatario"
                      : "Seleccione un representante"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {representatives.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.representativeId && (
              <p className="text-xs text-destructive">
                {errors.representativeId.message}
              </p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <Label htmlFor="res-notes">Notas</Label>
            <textarea
              id="res-notes"
              {...register("notes")}
              rows={2}
              placeholder="Observaciones opcionales..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createReservation.isPending}>
              {createReservation.isPending ? "Guardando..." : "Reservar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
