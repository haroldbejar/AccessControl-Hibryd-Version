---
name: "Entrega directa de paquetes desde campana de notificaciones"
description: "Plan de implementación para permitir entregar paquetes pendientes directamente desde el dropdown de alertas de la campana, sin navegar al módulo de paquetes."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de implementación para la entrega directa de paquetes desde la campana de notificaciones. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Permitir que el usuario entregue (marque como entregado) un paquete pendiente directamente desde el panel de alertas de la campana (NotificationBell), sin tener que navegar al módulo de paquetes. Mejora el flujo de trabajo y reduce clics para el portero.

---

## Decisiones de arquitectura confirmadas

| Decisión              | Valor                                                                   |
| --------------------- | ----------------------------------------------------------------------- |
| Fuente de datos       | `useNotifications` (ya filtra paquetes vencidos)                        |
| Backend entrega       | PATCH `/api/packages/{id}/deliver` (ya existe, requiere nombre)         |
| UI trigger            | Botón "Entregar" en cada alerta de paquete vencido                      |
| Modal de confirmación | Dialog ShadCN: campo nombre receptor (obligatorio), preview del paquete |
| Feedback              | Toast éxito/error, loading state por paquete individual                 |
| Estado/queries        | Invalida `usePendingPackages`, `useNotifications`, y lista de paquetes  |
| UX                    | Botón deshabilitado mientras loading, feedback inmediato                |
| Archivos nuevos       | 1 Dialog (`DeliverPackageFromAlertDialog.tsx`)                          |
| Archivos editados     | 3 (`NotificationBell.tsx`, `useNotifications.ts`, `MainLayout.tsx`)     |

---

## Fases de implementación

### Fase 1 — UI: botón "Entregar" en alerta de paquete

- Archivo: `frontend/src/shared/components/NotificationBell.tsx`
- En cada alerta de tipo `package-overdue`, añadir botón `Entregar` (ShadCN Button, tamaño sm)
- Al hacer click, abre el dialogo de entrega con los datos del paquete
- El botón muestra spinner si está en loading

### Fase 2 — Dialog de entrega

- Archivo nuevo: `frontend/src/features/packages/components/DeliverPackageFromAlertDialog.tsx`
- Props: `{ open, onClose, package }`
- Formulario: campo nombre receptor (obligatorio, autofocus), botón Confirmar
- Preview: controlNumber, remitente, destinatario, días pendiente
- Al confirmar: llama hook de entrega, muestra loading, cierra y muestra toast
- Validación: nombre requerido, mínimo 3 caracteres

### Fase 3 — Hook de entrega y estado

- Archivo: `frontend/src/features/packages/hooks/usePackages.ts`
- Hook `useDeliverPackageFromAlert` (wrapper de `useDeliverPackage`)
- Invalida queries: `usePendingPackages`, `useNotifications`, y lista de paquetes
- Maneja loading por id de paquete

### Fase 4 — Integración y feedback

- `NotificationBell.tsx`: gestiona estado `openDialog` por id de paquete
- Al entregar: muestra toast de éxito/error, cierra dialog, botón deshabilitado mientras loading
- UX: botón "Entregar" solo visible si el paquete sigue pendiente

### Fase 5 — Validación y pruebas

- `npm run build` → 0 errores
- Flujo: campana → alerta paquete → Entregar → dialog → confirmar → feedback → alerta desaparece
- Pruebas: entregar varios paquetes seguidos, error de red, validación de nombre

---

## Archivos a crear / editar — resumen

```
frontend/src/
  shared/components/NotificationBell.tsx                      ← EDITAR (botón + dialog)
  features/packages/components/DeliverPackageFromAlertDialog.tsx  ← NUEVO
  features/packages/hooks/usePackages.ts                      ← EDITAR (nuevo hook)
  shared/hooks/useNotifications.ts                            ← EDITAR (invalida tras entrega)
  layouts/MainLayout.tsx                                      ← EDITAR (si requiere feedback global)
```

---

## Notas técnicas

- El endpoint PATCH `/api/packages/{id}/deliver` ya existe y requiere `{ deliveredTo: string }` en el body.
- El dialog reutiliza validación y UX de `DeliverPackageDialog` del módulo de paquetes, pero es independiente.
- El botón "Entregar" solo aparece si el paquete sigue pendiente (no entregado en background).
- El estado loading es por paquete individual, no global.
- El toast de éxito/error usa el sistema global (Sonner o similar).
- El dialog puede cerrarse con ESC o click fuera.
- El badge de la campana y el sidebar se actualizan automáticamente tras la entrega.

---

## Verificación final end-to-end

- [ ] `npm run build` → 0 errores
- [ ] Campana muestra alertas de paquetes vencidos con botón "Entregar"
- [ ] Click "Entregar" → dialog con datos del paquete y campo nombre
- [ ] Confirmar entrega → loading, feedback, alerta desaparece
- [ ] Error de validación o red → toast de error, no cierra dialog
- [ ] Badge de campana y sidebar se actualizan
- [ ] UX: flujo rápido, sin navegación al módulo de paquetes
