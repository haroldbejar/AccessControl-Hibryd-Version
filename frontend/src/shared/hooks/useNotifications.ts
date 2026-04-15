import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, parseISO, format } from "date-fns";
import { packageService } from "@/features/packages/api/packageService";
import { reservationService } from "@/features/reservations/api/reservationService";
import { ReservationStatusEnum } from "@/features/reservations/types/reservation.types";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { AppAlert, AlertType } from "@/shared/types/notification.types";

const PACKAGE_OVERDUE_DAYS = 3;
const RESERVATION_UPCOMING_HOURS = 2;
const POLL_INTERVAL = 2 * 60 * 1000; // 2 minutos

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roleName?.toLowerCase().includes("admin") ?? false;
  const todayDate = format(new Date(), "yyyy-MM-dd");

  const packagesQuery = useQuery({
    queryKey: ["notifications", "pending-packages"],
    queryFn: () => packageService.getPending(),
    refetchInterval: POLL_INTERVAL,
  });

  const reservationsQuery = useQuery({
    queryKey: ["notifications", "reservations", todayDate],
    queryFn: () => reservationService.getAll({ date: todayDate }),
    refetchInterval: POLL_INTERVAL,
  });

  const alerts = useMemo<AppAlert[]>(() => {
    const result: AppAlert[] = [];
    const now = new Date();

    // Paquetes sin entregar hace más de N días
    for (const pkg of packagesQuery.data ?? []) {
      const received = parseISO(pkg.receivedDate);
      const days = differenceInDays(now, received);
      if (days >= PACKAGE_OVERDUE_DAYS) {
        result.push({
          id: `pkg-${pkg.id}`,
          type: "package-overdue",
          title: "Paquete sin entregar",
          description: `Control #${pkg.controlNumber} — ${days} día${days !== 1 ? "s" : ""} pendiente`,
          daysOverdue: days,
        });
      }
    }

    // Reservas del día
    for (const res of reservationsQuery.data ?? []) {
      // Confirmadas próximas — todos los roles
      if (res.status === ReservationStatusEnum.Confirmed) {
        const [h, m] = res.startTime.split(":").map(Number);
        const start = new Date(now);
        start.setHours(h, m, 0, 0);
        const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= RESERVATION_UPCOMING_HOURS) {
          result.push({
            id: `res-${res.id}`,
            type: "reservation-upcoming",
            title: "Reserva próxima",
            description: `${res.commonAreaName} a las ${res.startTime} — ${res.representativeName}`,
            startTime: res.startTime,
          });
        }
      }

      // Pendientes sin confirmar — solo admin
      if (isAdmin && res.status === ReservationStatusEnum.Pending) {
        result.push({
          id: `res-unconf-${res.id}`,
          type: "reservation-unconfirmed",
          title: "Reserva sin confirmar",
          description: `${res.commonAreaName} ${res.startTime}–${res.endTime} — ${res.representativeName}`,
        });
      }
    }

    const order: Record<AlertType, number> = {
      "package-overdue": 0,
      "reservation-upcoming": 1,
      "reservation-unconfirmed": 2,
    };
    return result.sort((a, b) => order[a.type] - order[b.type]);
  }, [packagesQuery.data, reservationsQuery.data, isAdmin]);

  return {
    alerts,
    totalCount: alerts.length,
    packageAlerts: alerts.filter((a) => a.type === "package-overdue").length,
    isLoading: packagesQuery.isLoading || reservationsQuery.isLoading,
  };
}
