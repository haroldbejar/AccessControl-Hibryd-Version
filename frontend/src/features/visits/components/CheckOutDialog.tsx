import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useVisitByDocument, useCheckOut } from "../hooks/useVisits";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CheckOutDialog({ open, onClose }: Props) {
  const [document, setDocument] = useState("");
  const [searching, setSearching] = useState(false);
  const userId = useAuthStore((s) => s.user?.userId ?? 0);

  const {
    data: visit,
    isFetching,
    isError,
  } = useVisitByDocument(document, searching);
  const checkOut = useCheckOut(() => {
    setDocument("");
    setSearching(false);
    onClose();
  });

  const handleSearch = () => {
    if (document.trim().length > 2) setSearching(true);
  };

  const handleClose = () => {
    setDocument("");
    setSearching(false);
    onClose();
  };

  const handleConfirm = () => {
    if (visit) {
      checkOut.mutate({
        documentNumber: visit.documentNumber,
        userModified: userId,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Registrar Salida
          </DialogTitle>
          <DialogDescription>
            Ingresa el documento del visitante para registrar su salida.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="doc">Número de documento</Label>
              <Input
                id="doc"
                value={document}
                onChange={(e) => {
                  setDocument(e.target.value);
                  setSearching(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar por documento..."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={handleSearch}
              disabled={isFetching || document.length < 3}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          {/* Resultado */}
          {searching && isError && (
            <p className="text-sm text-destructive">
              No se encontró visita activa con ese documento.
            </p>
          )}

          {visit && !visit.isCheckedOut && (
            <div className="rounded-md border p-3 space-y-1 bg-muted/40 text-sm">
              <p className="font-medium">{visit.fullName}</p>
              <p className="text-muted-foreground">
                Doc: {visit.documentNumber}
              </p>
              <p className="text-muted-foreground">
                Destino: {visit.destinationName}
              </p>
              <p className="text-muted-foreground">
                Ingreso:{" "}
                {format(new Date(visit.checkIn), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
          )}

          {visit?.isCheckedOut && (
            <p className="text-sm text-destructive">
              Este visitante ya registró su salida.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!visit || visit.isCheckedOut || checkOut.isPending}
          >
            {checkOut.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirmar salida
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
