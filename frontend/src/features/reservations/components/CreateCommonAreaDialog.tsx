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
import { useCreateCommonArea } from "../hooks/useCommonAreas";

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
  })
  .refine((d) => d.openingTime < d.closingTime, {
    message: "La hora de apertura debe ser anterior a la de cierre",
    path: ["closingTime"],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateCommonAreaDialog({ open, onClose }: Props) {
  const { user } = useAuthStore();
  const createArea = useCreateCommonArea(onClose);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      capacity: null,
      location: "",
      openingTime: "08:00",
      closingTime: "20:00",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    createArea.mutate({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      capacity: data.capacity ?? null,
      location: data.location?.trim() || null,
      openingTime: data.openingTime,
      closingTime: data.closingTime,
      userCreated: user?.userId ?? 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva zona común</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="ca-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ca-name"
              {...register("name")}
              placeholder="Ej: Salón comunal"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="ca-desc">Descripción</Label>
            <textarea
              id="ca-desc"
              {...register("description")}
              placeholder="Descripción opcional..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Capacidad y Ubicación */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ca-cap">Capacidad (personas)</Label>
              <Input
                id="ca-cap"
                type="number"
                min={1}
                placeholder="Ej: 50"
                onChange={(e) =>
                  setValue(
                    "capacity",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
              {errors.capacity && (
                <p className="text-xs text-destructive">
                  {errors.capacity.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-loc">Ubicación</Label>
              <Input
                id="ca-loc"
                {...register("location")}
                placeholder="Ej: Piso 1"
              />
            </div>
          </div>

          {/* Horario */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ca-open">
                Hora apertura <span className="text-destructive">*</span>
              </Label>
              <Input id="ca-open" type="time" {...register("openingTime")} />
              {errors.openingTime && (
                <p className="text-xs text-destructive">
                  {errors.openingTime.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-close">
                Hora cierre <span className="text-destructive">*</span>
              </Label>
              <Input id="ca-close" type="time" {...register("closingTime")} />
              {errors.closingTime && (
                <p className="text-xs text-destructive">
                  {errors.closingTime.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createArea.isPending}>
              {createArea.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
