---
name: "Plan de Visualización Inmediata de Foto Capturada"
description: "Plan detallado para mostrar el preview de la imagen capturada desde el celular o PC en los formularios de visitas y paquetes."
applyTo: "frontend/src/shared/components/PhotoCapture.tsx, frontend/src/features/visits/components/CreateVisitDialog.tsx, frontend/src/features/packages/components/RegisterPackageDialog.tsx"
---

## Contexto

Actualmente, la funcionalidad de captura remota de fotos vía celular (SignalR + QR) funciona y la imagen se envía correctamente al backend. Sin embargo, tras capturar la foto desde el móvil, **la imagen no se visualiza en el formulario** (ni en visitas ni en paquetes). El flujo solo muestra el mensaje "✓ Foto recibida" pero no un preview de la imagen.

---

## Objetivo

Mostrar inmediatamente el preview de la foto capturada (sea desde PC o móvil) en el formulario correspondiente, permitiendo al usuario ver la imagen antes de guardar el registro.

---

## Plan de implementación

### Fase 1 — UX/UI: Mostrar preview de la foto recibida
1. Modificar `PhotoCapture.tsx` para almacenar el último base64 recibido (PC o móvil) en un estado local (`capturedPhoto`).
2. Al recibir una foto (vía `onCapture`), actualizar `capturedPhoto` y mostrar un preview (`<img>`) en ambos tabs.
3. En el tab "Usar celular", tras recibir la foto, mostrar el preview debajo del mensaje "✓ Foto recibida".
4. Añadir opción de "Retomar foto" (limpiar el estado y permitir nueva captura) si aplica.

### Fase 2 — Integración en formularios
5. Validar que el estado `capturedPhoto` se propaga correctamente al formulario padre (visitas/paquetes) y se envía al backend.
6. Probar ambos flujos: captura desde PC y desde móvil, asegurando que el preview siempre se muestre tras la captura.

### Fase 3 — QA y verificación
7. Probar en ambos módulos (visitas y paquetes) y en ambos dispositivos (PC y móvil).
8. Validar que la imagen preview corresponde a la última foto capturada y que se puede retomar si es necesario.

---

## Archivos relevantes
- `frontend/src/shared/components/PhotoCapture.tsx` — lógica y UI de la captura y preview.
- `frontend/src/shared/hooks/useCameraSession.ts` — recepción de la foto vía SignalR.
- Formularios de visitas y paquetes que usan `PhotoCapture`.

---

## Verificación
- Capturar foto desde el móvil → preview visible en el formulario inmediatamente.
- Capturar foto desde la cámara del PC → preview visible igual.
- El formulario recibe y envía correctamente el base64 al backend.
- Opción de retomar/cambiar foto funcional.

---

¿Deseas que inicie la implementación de este plan o necesitas algún ajuste antes de continuar?