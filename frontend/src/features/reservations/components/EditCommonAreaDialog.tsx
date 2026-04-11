import { useEffect } from "react";
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
import { useAuthStore } from "@/features/auth/store/authStore";
import { useUpdateCommonArea } from "../hooks/useCommonAreas";
import type { CommonAreaResponse } from "../types/reservation.types";

const schema = z
  .object({
    name: z
      .string()
      .min(2, "Mínimo 2 caracteres")
      .max(100, "Máximo 100 caracteres"),
    description: z.string().max(500, "Máximo 500 caracteres").optional(),
    capacity: z.number().int().min(1, "Debe ser al menos 1").nullable(),
    location: z.string().max(200, "Máximo 200 caracteres").optional(),
    openingTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
    closingTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
    visible: z.boolean(),
  })
  .refine((d) => d.openingTime < d.closingTime, {
    message: "La hora de apertura debe ser anterior a la de cierre",
    path: ["closingTime"],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  area: CommonAreaResponse;
  open: boolean;
  onClose: () => void;
}

export function EditCommonAreaDialog({ area, open, onClose }: Props) {
  const { user } = useAuthStore();
  const updateArea = useUpdateCommonArea(onClose);

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
      name: area.name,
      description: area.description ?? "",
      capacity: area.capacity ?? null,
      location: area.location ?? "",
      openingTime: area.openingTime,
      closingTime: area.closingTime,
      visible: area.visible,
    },
  });

  useEffect(() => {
    reset({
      name: area.name,
      description: area.description ?? "",
      capacity: area.capacity ?? null,
      location: area.location ?? "",
      openingTime: area.openingTime,
      closingTime: area.closingTime,
      visible: area.visible,
    });
  }, [area, reset]);

  const visible = watch("visible");

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    updateArea.mutate({
      id: area.id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      capacity: data.capacity ?? null,
      location: data.location?.trim() || null,
      openingTime: data.openingTime,
      closingTime: data.closingTime,
      visible: data.visible,
      userModified: user?.userId ?? 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar zona común</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="eca-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input id="eca-name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="eca-desc">Descripción</Label>
            <textarea
              id="eca-desc"
              {...register("description")}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {/* Capacidad y Ubicación */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="eca-cap">Capacidad</Label>
              <Input
                id="eca-cap"
                type="number"
                min={1}
                defaultValue={area.capacity ?? ""}
                onChange={(e) =>
                  setValue(
                    "capacity",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eca-loc">Ubicación</Label>
              <Input id="eca-loc" {...register("location")} />
            </div>
          </div>

          {/* Horario */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="eca-open">
                Hora apertura <span className="text-destructive">*</span>
              </Label>
              <Input id="eca-open" type="time" {...register("openingTime")} />
              {errors.openingTime && (
                <p className="text-xs text-destructive">
                  {errors.openingTime.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eca-close">
                Hora cierre <span className="text-destructive">*</span>
              </Label>
              <Input id="eca-close" type="time" {...register("closingTime")} />
              {errors.closingTime && (
                <p className="text-xs text-destructive">
                  {errors.closingTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Visible */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="eca-visible"
              checked={visible}
              onChange={(e) => setValue("visible", e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <Label htmlFor="eca-visible">Zona activa</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateArea.isPending}>
              {updateArea.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
