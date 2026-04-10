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
import {
  VehicleTypeEnum,
  vehicleTypeLabels,
} from "@/features/visits/types/visit.types";
import type { DestinationResponse } from "@/features/destinations/types/destination.types";
import { useCreateRepresentative } from "../hooks/useRepresentatives";

const schema = z
  .object({
    name: z
      .string()
      .min(2, "Mínimo 2 caracteres")
      .max(100, "Máximo 100 caracteres"),
    phone: z.string().max(20).optional().or(z.literal("")),
    cellPhone: z.string().max(20).optional().or(z.literal("")),
    destinationId: z.number().min(1, "Seleccione un destinatario"),
    hasVehicle: z.boolean(),
    vehicleTypeId: z.number(),
    brand: z.string().max(50).optional().or(z.literal("")),
    model: z.string().max(50).optional().or(z.literal("")),
    color: z.string().max(30).optional().or(z.literal("")),
    plate: z.string().max(20).optional().or(z.literal("")),
  })
  .refine(
    (d) =>
      !d.hasVehicle ||
      (d.vehicleTypeId !== undefined && d.vehicleTypeId !== VehicleTypeEnum.NA),
    {
      message: "Seleccione el tipo de vehículo",
      path: ["vehicleTypeId"],
    },
  );

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  defaultDestinationId: number;
  destinations: DestinationResponse[];
}

export function CreateRepresentativeDialog({
  open,
  onClose,
  defaultDestinationId,
  destinations,
}: Props) {
  const createRepresentative = useCreateRepresentative(onClose);

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
      name: "",
      phone: "",
      cellPhone: "",
      destinationId: defaultDestinationId,
      hasVehicle: false,
      vehicleTypeId: VehicleTypeEnum.NA,
      brand: "",
      model: "",
      color: "",
      plate: "",
    },
  });

  const hasVehicle = watch("hasVehicle");
  const destinationId = watch("destinationId");
  const vehicleTypeId = watch("vehicleTypeId");

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    createRepresentative.mutate({
      name: data.name,
      phone: data.phone || undefined,
      cellPhone: data.cellPhone || undefined,
      destinationId: data.destinationId,
      hasVehicle: data.hasVehicle,
      vehicleTypeId: data.hasVehicle
        ? (data.vehicleTypeId as VehicleTypeEnum)
        : VehicleTypeEnum.NA,
      brand: data.hasVehicle ? data.brand || undefined : undefined,
      model: data.hasVehicle ? data.model || undefined : undefined,
      color: data.hasVehicle ? data.color || undefined : undefined,
      plate: data.hasVehicle ? data.plate || undefined : undefined,
    });
  };

  const vehicleOptions = [
    VehicleTypeEnum.Car,
    VehicleTypeEnum.Motorcycle,
    VehicleTypeEnum.Bicycle,
  ] as const;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo representante</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="rep-name">Nombre completo *</Label>
            <Input
              id="rep-name"
              {...register("name")}
              placeholder="Ej: Carlos Rodríguez"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Destinatario */}
          <div className="space-y-1.5">
            <Label>Destinatario *</Label>
            <Select
              value={destinationId?.toString() ?? ""}
              onValueChange={(v) => setValue("destinationId", Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
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

          {/* Teléfono / Celular */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rep-phone">Teléfono</Label>
              <Input
                id="rep-phone"
                {...register("phone")}
                placeholder="Ej: 6012345678"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rep-cell">Celular</Label>
              <Input
                id="rep-cell"
                {...register("cellPhone")}
                placeholder="Ej: 3001234567"
              />
            </div>
          </div>

          {/* ¿Tiene vehículo? */}
          <div className="flex items-center gap-2">
            <input
              id="rep-has-vehicle"
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={hasVehicle}
              onChange={(e) => {
                setValue("hasVehicle", e.target.checked);
                if (!e.target.checked) {
                  setValue("vehicleTypeId", VehicleTypeEnum.NA);
                  setValue("brand", "");
                  setValue("model", "");
                  setValue("color", "");
                  setValue("plate", "");
                }
              }}
            />
            <Label htmlFor="rep-has-vehicle" className="cursor-pointer">
              Tiene vehículo registrado
            </Label>
          </div>

          {/* Datos del vehículo (condicional) */}
          {hasVehicle && (
            <div className="space-y-3 p-3 rounded-md border bg-muted/30">
              <div className="space-y-1.5">
                <Label>Tipo de vehículo *</Label>
                <Select
                  value={
                    vehicleTypeId !== VehicleTypeEnum.NA
                      ? vehicleTypeId.toString()
                      : ""
                  }
                  onValueChange={(v) =>
                    setValue("vehicleTypeId", Number(v) as VehicleTypeEnum)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleOptions.map((vt) => (
                      <SelectItem key={vt} value={vt.toString()}>
                        {vehicleTypeLabels[vt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleTypeId && (
                  <p className="text-xs text-destructive">
                    {errors.vehicleTypeId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rep-brand">Marca</Label>
                  <Input
                    id="rep-brand"
                    {...register("brand")}
                    placeholder="Ej: Chevrolet"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rep-model">Modelo</Label>
                  <Input
                    id="rep-model"
                    {...register("model")}
                    placeholder="Ej: Spark"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rep-color">Color</Label>
                  <Input
                    id="rep-color"
                    {...register("color")}
                    placeholder="Ej: Blanco"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rep-plate">Placa</Label>
                  <Input
                    id="rep-plate"
                    {...register("plate")}
                    placeholder="Ej: ABC123"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRepresentative.isPending}>
              {createRepresentative.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
