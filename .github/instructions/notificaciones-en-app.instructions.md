---
name: "Notificaciones en-app"
description: "Plan de implementación de badge en sidebar + panel de alertas para paquetes pendientes y reservas próximas."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de implementación de Notificaciones en-app. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Mostrar alertas visuales dentro de la app (sin push notifications ni email) para situaciones que requieren atención: paquetes sin entregar hace N días y reservas próximas o sin confirmar. No requiere endpoints nuevos ni cambios de backend.

---

## Decisiones de arquitectura confirmadas

| Decisión                      | Valor                                                                |
| ----------------------------- | -------------------------------------------------------------------- |
| Fuente de datos               | Reutiliza `usePendingPackages()` + `useReservations({ date: hoy })`  |
| Polling                       | `refetchInterval: 2 * 60 * 1000` (cada 2 minutos) en el hook         |
| Endpoints nuevos              | Ninguno                                                              |
| Archivos backend nuevos       | Ninguno                                                              |
| Umbral paquetes               | > 3 días sin entregar (constante exportada, fácil de cambiar)        |
| Umbral reservas próx.         | Confirmadas que empiezan dentro de las próximas 2 horas              |
| Tipos de alerta               | `package-overdue`, `reservation-upcoming`, `reservation-unconfirmed` |
| Campana topbar                | Ícono `Bell` con badge rojo numérico → dropdown con lista de alertas |
| Badge sidebar                 | Número sobre ícono "Paquetes" si hay paquetes urgentes               |
| Rol `reservation-unconfirmed` | Solo admin (reservas Pending con fecha = hoy)                        |
| Archivos nuevos               | 2 frontend                                                           |
| Archivos editados             | 1 frontend (`MainLayout.tsx`)                                        |

---

## Estado de implementación

- [x] **Fase A** — `useNotifications.ts`: hook compartido con lógica de alertas y polling
- [x] **Fase B** — `NotificationBell.tsx`: campana con badge + panel dropdown
- [x] **Fase C** — Integrar en `MainLayout.tsx`: campana en topbar + badge en sidebar

---

## Tipos de alerta

```ts
export type AlertType =
    | "package-overdue" // Paquete sin entregar hace más de 3 días
    | "reservation-upcoming" // Reserva confirmada en las próximas 2 horas
    | "reservation-unconfirmed"; // Reserva pendiente de confirmar con fecha hoy (solo admin)

export interface AppAlert {
    id: string; // identificador único (ej: "pkg-42", "res-7")
    type: AlertType;
    title: string; // ej: "Paquete sin entregar"
    description: string; // ej: "Control #102 — 5 días pendiente"
    daysOverdue?: number; // solo package-overdue
    startTime?: string; // solo reservation-upcoming ("HH:mm")
}
```

---

## Fase A — `useNotifications.ts`

### Archivo

`frontend/src/shared/hooks/useNotifications.ts` (NUEVO)

### Lógica

```ts
import { useMemo } from "react";
import { differenceInDays, isToday, parseISO, addHours } from "date-fns";
import { usePendingPackages } from "@/features/packages/hooks/usePackages";
import { useReservations } from "@/features/reservations/hooks/useReservations";
import { ReservationStatusEnum } from "@/features/reservations/types/reservation.types";
import { format } from "date-fns";
import type { AppAlert } from "@/shared/types/notification.types";
import { useAuthStore } from "@/features/auth/store/authStore";

const PACKAGE_OVERDUE_DAYS = 3;
const RESERVATION_UPCOMING_HOURS = 2;

export function useNotifications() {
    const { user } = useAuthStore();
    const isAdmin = user?.roleName?.toLowerCase().includes("admin") ?? false;
    const todayDate = format(new Date(), "yyyy-MM-dd");

    // Polling cada 2 minutos
    const packagesQuery = usePendingPackages();
    const reservationsQuery = useReservations({ date: todayDate });

    const alerts = useMemo<AppAlert[]>(() => {
        const result: AppAlert[] = [];
        const now = new Date();

        // Paquetes vencidos
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

        // Reservas de hoy
        for (const res of reservationsQuery.data ?? []) {
            // Confirmadas próximas (todos los roles)
            if (res.status === ReservationStatusEnum.Confirmed) {
                const [h, m] = res.startTime.split(":").map(Number);
                const start = new Date(now);
                start.setHours(h, m, 0, 0);
                const diffMs = start.getTime() - now.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);
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

            // Pendientes sin confirmar (solo admin)
            if (isAdmin && res.status === ReservationStatusEnum.Pending) {
                result.push({
                    id: `res-unconf-${res.id}`,
                    type: "reservation-unconfirmed",
                    title: "Reserva sin confirmar",
                    description: `${res.commonAreaName} ${res.startTime}–${res.endTime} — ${res.representativeName}`,
                });
            }
        }

        // Ordenar: primero package-overdue, luego reservation-upcoming, luego unconfirmed
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
        packageAlerts: alerts.filter((a) => a.type === "package-overdue")
            .length,
        isLoading: packagesQuery.isLoading || reservationsQuery.isLoading,
    };
}
```

### Archivo de tipos

`frontend/src/shared/types/notification.types.ts` (NUEVO)

```ts
export type AlertType =
    | "package-overdue"
    | "reservation-upcoming"
    | "reservation-unconfirmed";

export interface AppAlert {
    id: string;
    type: AlertType;
    title: string;
    description: string;
    daysOverdue?: number;
    startTime?: string;
}
```

> **Nota:** `usePendingPackages` ya existe en `usePackages.ts`. `useReservations` ya acepta `{ date: string }` como filtro y tiene `enabled` opcional. No se modifican estos hooks — solo se consumen.

> **Nota sobre polling:** `usePendingPackages` y `useReservations` tienen su propio `staleTime` en el QueryClient global (5 min). Para polling más frecuente en las notificaciones, se pasan opciones `refetchInterval` directamente al llamar desde `useNotifications`. Esto requiere ajuste en los hooks existentes o usar `useQuery` directamente en el hook de notificaciones.

> **Decisión final de polling:** Para no modificar los hooks existentes, `useNotifications` llama directamente a `packageService.getPending()` y `reservationService.getAll({ date })` con sus propias instancias de `useQuery` con `refetchInterval`.

### Verificación Fase A

```
npm run build → 0 errores
```

---

## Fase B — `NotificationBell.tsx`

### Archivo

`frontend/src/shared/components/NotificationBell.tsx` (NUEVO)

### Comportamiento

- Ícono `Bell` de lucide (o `BellDot` si hay alertas)
- Badge rojo sobre el ícono con el total de alertas (`totalCount`)
- Al hacer click: `DropdownMenu` con lista de alertas agrupadas
- Sin alertas: mensaje "Sin notificaciones pendientes"
- Cada alerta muestra: ícono de tipo + título en negrita + descripción en texto secundario

### Íconos por tipo de alerta

| Tipo                      | Ícono lucide  | Color badge     |
| ------------------------- | ------------- | --------------- |
| `package-overdue`         | `PackageOpen` | `bg-orange-500` |
| `reservation-upcoming`    | `Clock`       | `bg-blue-500`   |
| `reservation-unconfirmed` | `CalendarX`   | `bg-yellow-500` |

### Estructura JSX

```tsx
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
            {totalCount > 0 ? (
                <BellDot className="h-4 w-4" />
            ) : (
                <Bell className="h-4 w-4" />
            )}
            {totalCount > 0 && (
                <span
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive
                         text-[10px] text-white flex items-center justify-center font-bold"
                >
                    {totalCount > 9 ? "9+" : totalCount}
                </span>
            )}
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
            Notificaciones
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
            alerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
        )}
    </DropdownMenuContent>
</DropdownMenu>
```

### Verificación Fase B

```
npm run build → 0 errores
```

---

## Fase C — Integrar en `MainLayout.tsx`

### Archivo

`frontend/src/layouts/MainLayout.tsx` (EDITAR)

### Cambios

1. Importar `NotificationBell` + `useNotifications`
2. En el topbar, agregar `<NotificationBell />` entre el toggle Moon/Sun y el DropdownMenu del usuario:

```tsx
{
    /* Topbar — orden de derecha a izquierda (flex-row): usuario | notificaciones | tema */
}
<div className="flex items-center gap-1">
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
        ...
    </Button>
    <NotificationBell /> {/* ← NUEVO */}
    <DropdownMenu>...usuario...</DropdownMenu>
</div>;
```

3. En el sidebar, añadir badge numérico sobre el ícono de "Paquetes" si `packageAlerts > 0`:

```tsx
// Dentro del map de navItems, caso especial para "/packages":
<NavLink key={to} to={to} className={...}>
  <span className="relative">
    <Icon className="h-4 w-4 shrink-0" />
    {to === "/packages" && packageAlerts > 0 && (
      <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-destructive
                       text-[10px] text-white flex items-center justify-center font-bold">
        {packageAlerts > 9 ? "9+" : packageAlerts}
      </span>
    )}
  </span>
  {label}
</NavLink>
```

### Verificación Fase C

```
npm run build → 0 errores
```

---

## Archivos a crear / editar — resumen

### Frontend (3 nuevos + 1 editado)

```
frontend/src/
  shared/types/notification.types.ts            ← NUEVO
  shared/hooks/useNotifications.ts              ← NUEVO
  shared/components/NotificationBell.tsx        ← NUEVO
  layouts/MainLayout.tsx                        ← EDITAR (campana + badge sidebar)
```

### Backend

Sin cambios.

---

## Notas técnicas

- **Sin modificar hooks existentes:** `useNotifications` crea sus propias instancias de `useQuery` con `refetchInterval: 2 * 60 * 1000` para no afectar el comportamiento del resto de la app.
- **`packageService.getPending()`** devuelve `response.data.value` (patrón `ApiResult<T>`).
- **`reservationService.getAll()`** devuelve `response.data` directo (patrón `Ok(result.Value)`).
- **Badge `> 9`:** se muestra "9+" para no romper el layout con números grandes.
- **DropdownMenu ya instalado:** se usa el mismo componente instalado en la Fase D de cambio de contraseña.
- **`BellDot`** vs **`Bell`:** lucide incluye `BellDot` (campana con punto) — usar para el estado con alertas.
- **`date-fns`** ya es dependencia del proyecto (usada en DashboardPage).

---

## Verificación final end-to-end

- [x] `npm run build` → 0 errores
- [ ] Sin alertas: campana `Bell` sin badge
- [ ] Con paquetes vencidos: campana `BellDot` + badge rojo numérico + badge en sidebar "Paquetes"
- [ ] Con reservas próximas: alerta aparece en el panel (sin badge en sidebar)
- [ ] Alertas `reservation-unconfirmed` solo visibles para admin
- [ ] Panel vacío muestra "Sin notificaciones pendientes"
- [ ] Polling: cada 2 minutos los datos se actualizan (verificable con Network tab)
