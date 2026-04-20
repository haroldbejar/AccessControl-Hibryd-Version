import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/features/auth/store/authStore";
import { VehicleTypeEnum } from "../types/visit.types";
import {
  useCreateVisit,
  useDestinations,
  useRepresentativesByDestination,
} from "../hooks/useVisits";
import { PhotoCapture } from "@/shared/components/PhotoCapture";

const schema = z
  .object({
    documentNumber: z.string().min(1, "Requerido"),
    firstName: z.string().min(1, "Requerido"),
    secondName: z.string().optional(),
    lastName: z.string().min(1, "Requerido"),
    secondLastName: z.string().optional(),
    destinationId: z.number().min(1, "Selecciona un destino"),
    representativeId: z.number().min(1, "Selecciona un representante"),
    hasVehicle: z.boolean(),
    vehicleTypeId: z.number(),
    brand: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
    plate: z.string().optional(),
    photo: z.string().min(1, "La foto del visitante es requerida"),
    photo2: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasVehicle && data.vehicleTypeId === VehicleTypeEnum.NA) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicleTypeId"],
        message: "Selecciona tipo de vehículo",
      });
    }
  });

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateVisitDialog({ open, onClose }: Props) {
  const userId = useAuthStore((s) => s.user?.userId ?? 0);
  const [selectedDestinationId, setSelectedDestinationId] = useState<
    number | null
  >(null);

  const { data: destinations = [] } = useDestinations();
  const { data: representatives = [] } = useRepresentativesByDestination(
    selectedDestinationId,
  );
  const createVisit = useCreateVisit(onClose);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      hasVehicle: false,
      vehicleTypeId: VehicleTypeEnum.NA,
      photo: "",
      photo2: "",
    },
  });

  const hasVehicle = watch("hasVehicle");

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedDestinationId(null);
    }
  }, [open, reset]);

  const onSubmit = (data: FormData) => {
    createVisit.mutate({
      documentNumber: data.documentNumber,
      firstName: data.firstName,
      secondName: data.secondName || undefined,
      lastName: data.lastName,
      secondLastName: data.secondLastName || undefined,
      representativeId: data.representativeId,
      hasVehicle: data.hasVehicle,
      vehicleTypeId: data.vehicleTypeId as VehicleTypeEnum,
      brand: data.brand || undefined,
      model: data.model || undefined,
      color: data.color || undefined,
      plate: data.plate || undefined,
      photo: data.photo || undefined,
      photo2: data.photo2 || undefined,
      userCreated: userId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Visita</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Documento */}
          <div className="space-y-1">
            <Label htmlFor="documentNumber">Documento *</Label>
            <Input
              id="documentNumber"
              {...register("documentNumber")}
              placeholder="Número de documento"
            />
            {errors.documentNumber && (
              <p className="text-xs text-destructive">
                {errors.documentNumber.message}
              </p>
            )}
          </div>

          {/* Nombres */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">Primer nombre *</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="secondName">Segundo nombre</Label>
              <Input id="secondName" {...register("secondName")} />
            </div>
          </div>

          {/* Apellidos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="lastName">Primer apellido *</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-xs text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="secondLastName">Segundo apellido</Label>
              <Input id="secondLastName" {...register("secondLastName")} />
            </div>
          </div>

          {/* Destino */}
          <div className="space-y-1">
            <Label>Destino *</Label>
            <Controller
              control={control}
              name="destinationId"
              render={({ field }) => (
                <Select
                  value={field.value?.toString() ?? ""}
                  onValueChange={(v) => {
                    const id = Number(v);
                    field.onChange(id);
                    setSelectedDestinationId(id);
                    setValue("representativeId", 0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.destinationId && (
              <p className="text-xs text-destructive">
                {errors.destinationId.message}
              </p>
            )}
          </div>

          {/* Representante */}
          <div className="space-y-1">
            <Label>Representante *</Label>
            <Controller
              control={control}
              name="representativeId"
              render={({ field }) => (
                <Select
                  value={field.value?.toString() ?? ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                  disabled={!selectedDestinationId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedDestinationId
                          ? "Selecciona representante"
                          : "Primero elige destino"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {representatives.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.representativeId && (
              <p className="text-xs text-destructive">
                {errors.representativeId.message}
              </p>
            )}
          </div>

          {/* Vehículo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasVehicle"
              className="h-4 w-4 rounded border-input"
              {...register("hasVehicle")}
            />
            <Label htmlFor="hasVehicle">¿Ingresa con vehículo?</Label>
          </div>

          {hasVehicle && (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              {/* Tipo */}
              <div className="space-y-1">
                <Label>Tipo de vehículo *</Label>
                <Controller
                  control={control}
                  name="vehicleTypeId"
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={VehicleTypeEnum.Car.toString()}>
                          Automóvil
                        </SelectItem>
                        <SelectItem
                          value={VehicleTypeEnum.Motorcycle.toString()}
                        >
                          Moto
                        </SelectItem>
                        <SelectItem value={VehicleTypeEnum.Bicycle.toString()}>
                          Bicicleta
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vehicleTypeId && (
                  <p className="text-xs text-destructive">
                    {errors.vehicleTypeId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" {...register("brand")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="model">Modelo</Label>
                  <Input id="model" {...register("model")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" {...register("color")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="plate">Placa</Label>
                  <Input id="plate" {...register("plate")} />
                </div>
              </div>
            </div>
          )}

          {/* Fotografías */}
          <div className="space-y-3 border-t border-border pt-3">
            <p className="text-sm font-medium">Fotografías</p>
            <PhotoCapture
              key={`photo1-${open}`}
              label="Foto del visitante"
              onCapture={(b64) =>
                setValue("photo", b64 ?? "", { shouldValidate: true })
              }
            />
            {errors.photo && (
              <p className="text-xs text-destructive">{errors.photo.message}</p>
            )}
            <PhotoCapture
              key={`photo2-${open}`}
              label="Foto adicional (opcional)"
              onCapture={(b64) => setValue("photo2", b64 ?? "")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createVisit.isPending}>
              {createVisit.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
