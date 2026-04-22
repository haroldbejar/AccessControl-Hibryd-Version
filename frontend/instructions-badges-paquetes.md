# Plan de solución — Actualización de badges de paquetes y campana de notificaciones

## Objetivo

Asegurar que el badge numérico en el menú de "Paquetes" y la campana de notificaciones en el header reflejen en tiempo real el número correcto de paquetes pendientes, alineados con el dashboard.

---

## Fase 1 — Diagnóstico y alineación de hooks

- Revisar el hook `useNotifications` y su dependencia de datos de paquetes pendientes.
- Verificar si usa el mismo queryKey y lógica de cache/refetch que el dashboard (`usePendingPackages`).
- Identificar si hay diferencias de configuración (`staleTime`, `refetchInterval`, invalidación tras mutaciones).

## Fase 2 — Unificación de fuente de datos

- Asegurar que tanto el badge del menú como la campana usen el mismo hook/base de datos (`usePendingPackages` o queryKey global).
- Eliminar duplicidad de fetch o estados locales que puedan quedar desincronizados.

## Fase 3 — Configuración de cache y polling

- Ajustar `staleTime` y/o `refetchInterval` para que los datos de paquetes pendientes se actualicen automáticamente cada 1-2 minutos.
- Forzar invalidación/refetch tras operaciones de crear/entregar paquete.

## Fase 4 — Refactor de renderizado de badges

- Modificar el renderizado del badge en el menú y la campana para que dependan directamente del resultado del hook unificado.
- Validar que el conteo se actualiza correctamente al crear/entregar paquetes, sin necesidad de recargar la página.

## Fase 5 — Pruebas manuales y validación visual

- Crear y entregar paquetes, observando la actualización en tiempo real de los badges y la campana.
- Validar que el dashboard, el menú y la campana siempre muestran el mismo número de paquetes pendientes.

---

## Notas técnicas

- Si se usa TanStack Query, preferir un único queryKey para los paquetes pendientes en toda la app.
- Si se requiere polling, usar `refetchInterval` en el hook de paquetes pendientes.
- Si hay hooks personalizados, asegurar que no mantengan estados locales desincronizados.
- Validar que las mutaciones (crear/entregar) invaliden correctamente la query global.

---

## Resultado esperado

- El badge de paquetes y la campana de notificaciones muestran el número real de paquetes pendientes, alineados con el dashboard, y se actualizan automáticamente tras cualquier cambio relevante.
