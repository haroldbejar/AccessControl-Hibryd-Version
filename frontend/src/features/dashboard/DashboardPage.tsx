import { useMemo } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Package, LogIn, Clock, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVisits } from "@/features/visits/hooks/useVisits";
import {
  usePackages,
  usePendingPackages,
} from "@/features/packages/hooks/usePackages";
import { useReservations } from "@/features/reservations/hooks/useReservations";
import {
  reservationStatusLabels,
  reservationStatusColors,
} from "@/features/reservations/types/reservation.types";

// Helpers de fecha
const todayStart = format(startOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss");
const todayEnd = format(endOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss");
const todayDate = format(new Date(), "yyyy-MM-dd");

export function DashboardPage() {
  const visitsQuery = useVisits({ startDate: todayStart, endDate: todayEnd });
  const packagesQuery = usePackages({
    startDate: todayStart,
    endDate: todayEnd,
  });
  const pendingQuery = usePendingPackages();
  const reservationsQuery = useReservations({ date: todayDate });

  const visits = visitsQuery.data ?? [];
  const packages = packagesQuery.data ?? [];
  const pending = pendingQuery.data ?? [];

  const activeVisits = useMemo(
    () => visits.filter((v) => !v.isCheckedOut),
    [visits],
  );
  const recentVisits = useMemo(
    () => [...visits].sort((a, b) => b.id - a.id).slice(0, 8),
    [visits],
  );
  const recentPending = useMemo(
    () => [...pending].sort((a, b) => b.id - a.id).slice(0, 8),
    [pending],
  );
  const todayReservations = useMemo(
    () =>
      [...(reservationsQuery.data ?? [])]
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, 8),
    [reservationsQuery.data],
  );

  const today = format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const kpis = [
    {
      title: "Visitas hoy",
      value: visits.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Visitas activas",
      value: activeVisits.length,
      icon: LogIn,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Paquetes hoy",
      value: packages.length,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Paquetes pendientes",
      value: pending.length,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">{todayCapitalized}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{title}</p>
                  <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                <div className={`${bg} p-3 rounded-full`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Visitas recientes del día */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Visitas recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {visitsQuery.isLoading ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                Cargando...
              </p>
            ) : recentVisits.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                Sin visitas registradas hoy.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Visitante
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Destino
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Entrada
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-2 max-w-35 truncate">
                          {v.fullName}
                        </td>
                        <td className="px-4 py-2 max-w-30 truncate text-muted-foreground">
                          {v.destinationName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                          {format(new Date(v.checkIn), "HH:mm")}
                        </td>
                        <td className="px-4 py-2">
                          {v.isCheckedOut ? (
                            <Badge variant="secondary">Salió</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Activo
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paquetes pendientes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Paquetes pendientes de entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pendingQuery.isLoading ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                Cargando...
              </p>
            ) : recentPending.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                No hay paquetes pendientes.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Control
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Remitente
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Destino
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Recibido
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPending.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                          {p.controlNumber}
                        </td>
                        <td className="px-4 py-2 max-w-30 truncate">
                          {p.senderName}
                        </td>
                        <td className="px-4 py-2 max-w-30 truncate text-muted-foreground">
                          {p.destinationName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                          {format(new Date(p.receivedDate), "d/MM HH:mm")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reservas de hoy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Reservas de hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reservationsQuery.isLoading ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">
              Cargando...
            </p>
          ) : todayReservations.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">
              Sin reservas para hoy.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Zona
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Residente
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Horario
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {todayReservations.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-2 max-w-35 truncate">
                        {r.commonAreaName}
                      </td>
                      <td className="px-4 py-2 max-w-35 truncate text-muted-foreground">
                        {r.representativeName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                        {r.startTime} → {r.endTime}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          className={`text-xs ${reservationStatusColors[r.status]} hover:${reservationStatusColors[r.status]}`}
                        >
                          {reservationStatusLabels[r.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
