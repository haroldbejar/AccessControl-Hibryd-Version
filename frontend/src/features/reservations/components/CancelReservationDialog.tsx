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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCancelReservation } from "../hooks/useReservations";

const schema = z.object({
  cancellationReason: z
    .string()
    .min(5, "Mínimo 5 caracteres")
    .max(500, "Máximo 500 caracteres"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  reservationId: number;
  open: boolean;
  onClose: () => void;
}

export function CancelReservationDialog({
  reservationId,
  open,
  onClose,
}: Props) {
  const cancelReservation = useCancelReservation(onClose);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cancellationReason: "" },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    cancelReservation.mutate({
      id: reservationId,
      body: { cancellationReason: data.cancellationReason.trim() },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancelar reserva</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason">
              Motivo de cancelación <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="cancel-reason"
              {...register("cancellationReason")}
              rows={3}
              placeholder="Indique el motivo de la cancelación..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
            {errors.cancellationReason && (
              <p className="text-xs text-destructive">
                {errors.cancellationReason.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Volver
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={cancelReservation.isPending}
            >
              {cancelReservation.isPending
                ? "Cancelando..."
                : "Confirmar cancelación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
