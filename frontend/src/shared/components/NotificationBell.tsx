import { Bell, BellDot, PackageOpen, Clock, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/shared/hooks/useNotifications";
import type { AppAlert, AlertType } from "@/shared/types/notification.types";

const alertIcon: Record<AlertType, React.ElementType> = {
  "package-overdue": PackageOpen,
  "reservation-upcoming": Clock,
  "reservation-unconfirmed": CalendarX,
};

const alertIconColor: Record<AlertType, string> = {
  "package-overdue": "text-orange-500",
  "reservation-upcoming": "text-blue-500",
  "reservation-unconfirmed": "text-yellow-500",
};

import { useState, useMemo } from "react";
import DeliverPackageFromAlertDialog from "@/features/packages/components/DeliverPackageFromAlertDialog";
import type { PackageResponse } from "@/features/packages/types/package.types";

function AlertItem({
  alert,
  onDeliver,
  delivering,
}: {
  alert: AppAlert;
  onDeliver?: () => void;
  delivering?: boolean;
}) {
  const Icon = alertIcon[alert.type];
  return (
    <div className="flex items-start gap-3 px-3 py-2 hover:bg-muted/50 rounded-sm">
      <Icon
        className={`h-4 w-4 mt-0.5 shrink-0 ${alertIconColor[alert.type]}`}
      />
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-sm font-medium leading-tight">{alert.title}</span>
        <span className="text-xs text-muted-foreground leading-tight truncate">
          {alert.description}
        </span>
      </div>
      {/* Solo para paquetes vencidos */}
      {alert.type === "package-overdue" && onDeliver && (
        <Button
          size="sm"
          variant="outline"
          className="ml-2"
          onClick={onDeliver}
          disabled={!!delivering}
        >
          {delivering ? (
            <span className="animate-spin mr-1 w-3 h-3 border-2 border-primary border-t-transparent rounded-full inline-block" />
          ) : null}
          Entregar
        </Button>
      )}
    </div>
  );
}

export default function NotificationBell() {
  const { alerts, totalCount } = useNotifications();
  // Estado: id del paquete cuyo dialog está abierto
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Buscar el paquete y días pendiente según el id de alerta
  const dialogData = useMemo(() => {
    if (!openDialogId) return null;
    const alert = alerts.find(
      (a) => a.id === openDialogId && a.type === "package-overdue",
    );
    if (!alert) return null;
    // El id es "pkg-<id>"
    const pkgId = Number(alert.id.replace("pkg-", ""));
    // Buscar el paquete en el propio alert (si se añade en el futuro) o pedirlo por prop
    // Por ahora, el alert no trae el paquete completo, así que no se puede abrir el dialog real
    // Fase 2: solo UI, se puede pasar datos dummy
    return {
      pkg: {
        id: pkgId,
        controlNumber: "?",
        senderName: "?",
        destinationName: "?",
      } as PackageResponse,
      daysOverdue: alert.daysOverdue ?? 0,
    };
  }, [openDialogId, alerts]);

  // Handler para click en "Entregar"
  const handleDeliver = (alertId: string) => {
    setOpenDialogId(alertId);
  };

  // Handler para confirmar entrega (dummy)
  const handleDialogDeliver = async (_deliveredTo: string) => {
    setLoadingId(openDialogId);
    // Simulación de entrega
    await new Promise((res) => setTimeout(res, 1200));
    setLoadingId(null);
    setOpenDialogId(null);
  };

  const handleDialogClose = () => {
    setOpenDialogId(null);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Notificaciones"
        >
          {totalCount > 0 ? (
            <BellDot className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-bold">
              {totalCount > 9 ? "9+" : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {totalCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalCount}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin notificaciones pendientes
          </p>
        ) : (
          <div className="py-1">
            {alerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onDeliver={
                  alert.type === "package-overdue"
                    ? () => handleDeliver(alert.id)
                    : undefined
                }
                delivering={loadingId === alert.id}
              />
            ))}
          </div>
        )}
        {/* Dialogo de entrega (solo uno a la vez) */}
        {dialogData && (
          <DeliverPackageFromAlertDialog
            open={!!openDialogId}
            onClose={handleDialogClose}
            pkg={dialogData.pkg}
            daysOverdue={dialogData.daysOverdue}
            onDeliver={handleDialogDeliver}
            loading={loadingId === openDialogId}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
