---
name: "Captura de Imagen desde PC (Webcam)"
description: "Plan de recuperacion de captura de foto desde camaras del PC para Visitas y Paquetes, sin modificar captura movil."
applyTo: "frontend/**"
---

> Importante: Este plan corrige unicamente la captura desde camara del PC. No modifica la funcionalidad de captura desde celular (QR + SignalR + MobileCapturePage).

## Proposito

Restaurar y estabilizar la captura de imagen desde webcam en los formularios de Visitas y Paquetes.

- Alcance incluido: tab "Camara PC", inicializacion de dispositivos, estados de error, integracion con dialogs.
- Alcance excluido: flujo "Usar celular", SignalR, ruta movil, backend de photo sessions.

---

## Diagnostico confirmado

### Hallazgo raiz

El componente compartido `PhotoCapture.tsx` no renderiza `CameraCapture.tsx` en el tab "Camara PC". Por eso:

- No se listan camaras.
- No aparece stream de video.
- No hay boton de captura desde PC.

### Impacto

Afecta por igual:

- Visitas (`CreateVisitDialog`)
- Paquetes (`RegisterPackageDialog`)

porque ambos usan `PhotoCapture`.

### Estado del flujo movil

El flujo movil esta funcional y no debe tocarse:

- `useCameraSession.ts`
- `MobileCapturePage.tsx`
- ruta `/capture/:sessionId`

---

## Decisiones de implementacion

| Decision                      | Valor                                                                       |
| ----------------------------- | --------------------------------------------------------------------------- |
| Reparacion principal          | Integrar `CameraCapture` dentro de la pestaña "Camara PC" en `PhotoCapture` |
| Riesgo de regresion movil     | Bajo (componentes desacoplados por tab)                                     |
| Cambios de backend            | Ninguno                                                                     |
| Cambios de contratos de datos | Ninguno                                                                     |
| Prioridad                     | Funcionalidad > cosmetica                                                   |
| UX minima requerida           | Mostrar estados claros: sin permiso, sin dispositivos, error de stream      |

---

## Estado de implementacion

- [x] Fase 1 - Congelar alcance y baseline
- [x] Fase 2 - Correccion bloqueante en tab Camara PC
- [x] Fase 3 - Robustez de webcam y estados de error
- [x] Fase 4 - Integracion estable en dialogs
- [x] Fase 5 - Verificacion de no regresion movil
- [x] Fase 6 - Validacion final de cierre (tecnica automatizada)

### Evidencia Fase 1

- Baseline comun confirmado: Visitas y Paquetes dependen de `PhotoCapture`.
- Causa raiz confirmada: tab `Camara PC` en `PhotoCapture` no renderiza `CameraCapture`.
- Flujo movil separado y fuera de alcance de cambios: `useCameraSession`, `MobileCapturePage`, ruta `/capture/:sessionId`.
- Criterio de exito de Fase 1 cerrado: recuperar stream en vivo + captura/retoma en PC sin tocar QR/SignalR.

### Evidencia Fase 2

- `PhotoCapture.tsx` ahora importa y renderiza `CameraCapture` en el tab `Camara PC` cuando no hay foto capturada.
- En `Camara PC`, cuando existe captura, se mantiene preview y boton `Retomar`.
- Se conserva el contrato `onCapture(base64 | null)` sin cambios de interfaz.
- El tab `Usar celular` no fue modificado en su logica de estados/sesion.

### Evidencia Fase 3

- `CameraCapture.tsx` incorpora estado de inicializacion explicito (`Inicializando camara...`).
- Se agrega manejo explicito para ausencia de dispositivos (`No se detectaron camaras disponibles`).
- Se agrega manejo de error de stream con mensaje visible y accion `Reintentar camara`.
- El boton `Capturar` queda deshabilitado cuando existe error de stream para evitar intentos inconsistentes.
- Se mantiene el cleanup de tracks en cambio de dispositivo, captura y unmount.

### Evidencia Fase 4

- `CreateVisitDialog.tsx`: se removieron `key` dinamicas en los dos `PhotoCapture` para evitar remount forzado al alternar apertura/cierre del dialog.
- `RegisterPackageDialog.tsx`: se removio `key` dinamica en `PhotoCapture` para estabilizar estado de captura en evidencia fotografica.
- Se mantienen sin cambios las reglas funcionales:
    - Visitas: foto principal requerida y foto adicional opcional.
    - Paquetes: foto opcional.
    - Firma de paquetes: intacta.

### Evidencia Fase 5

- `PhotoCapture.tsx` mantiene intacta la logica del tab `Usar celular` (estados `idle/connecting/waiting/received/error`, QR, cancelar, reintento).
- `useCameraSession.ts` sin cambios funcionales: creacion de sesion, URL QR, conexion SignalR, `photoReceived`, cancelacion.
- `MobileCapturePage.tsx` sin cambios funcionales: captura nativa en celular, conversion base64, upload por token.
- `AppRouter.tsx` mantiene la ruta publica `/capture/:sessionId` fuera de rutas protegidas.
- Verificacion de compilacion en los archivos moviles clave: sin errores.

### Evidencia Fase 6

- Build de frontend ejecutado con exito (`tsc -b && vite build`).
- Se corrigieron errores TS6133 preexistentes en `usePackages.ts` (parametros no usados en callbacks de `useDeliverPackage`).
- Artefactos de build y PWA generados correctamente (`dist/sw.js`, `dist/workbox-*.js`).
- Advertencia de chunks grandes en `ReportsPage` detectada por Vite, sin bloquear build.
- Pendiente para cierre funcional absoluto: pruebas manuales en navegador/dispositivo (flujo E2E).

---

## Fases del plan

### Fase 1 - Congelar alcance y baseline

Objetivo: confirmar que la falla es del componente compartido y fijar limites.

1. Verificar que Visitas y Paquetes dependen del mismo `PhotoCapture`.
2. Confirmar no intervencion sobre captura movil.
3. Definir criterio de exito para PC:
    - video en vivo,
    - selector de camaras (si hay mas de una),
    - capturar,
    - retomar,
    - persistir captura en formulario.

Resultado esperado: fase de diagnostico cerrada con alcance congelado y evidencia tecnica.

### Fase 2 - Correccion bloqueante en tab Camara PC

Objetivo: habilitar captura real desde webcam.

1. Editar `frontend/src/shared/components/PhotoCapture.tsx`.
2. Importar `CameraCapture`.
3. En `TabsContent value="pc"`:
    - cuando no hay foto: renderizar `CameraCapture`.
    - cuando hay foto: mostrar preview y accion "Retomar".
4. Mantener contrato actual de `onCapture(base64 | null)`.

Resultado esperado: el tab "Camara PC" deja de estar vacio y vuelve a capturar.

### Fase 3 - Robustez de webcam y estados de error

Objetivo: evitar pantallas vacias y mejorar soporte operativo.

1. Revisar `frontend/src/shared/components/CameraCapture.tsx` para cubrir:
    - permiso denegado,
    - sin camaras detectadas,
    - fallo al abrir stream.
2. Asegurar inicializacion valida de `selectedDeviceId`.
3. Asegurar cleanup de tracks en:
    - cambio de camara,
    - captura,
    - unmount.

Resultado esperado: siempre hay feedback visible, incluso en escenarios de error.

### Fase 4 - Integracion estable en dialogs

Objetivo: evitar reinicios inesperados de estado de camara.

1. Revisar `CreateVisitDialog.tsx` y `RegisterPackageDialog.tsx`.
2. Evaluar claves dinamicas (`key`) que fuerzan remount al abrir/cerrar dialog.
3. Mantener reglas actuales:
    - Visitas: foto principal requerida.
    - Paquetes: foto opcional.
    - Firma de paquetes: intacta.
4. Confirmar persistencia de captura segun implementacion actual (RHF/useRef).

Resultado esperado: flujo estable al abrir/cerrar modal sin perder funcionalidad.

### Fase 5 - Verificacion de no regresion movil

Objetivo: garantizar que no se rompe lo que ya funciona en celular.

1. Verificar tab "Usar celular" en `PhotoCapture`.
2. Verificar `useCameraSession.ts` (QR + estados).
3. Verificar `MobileCapturePage.tsx` y ruta publica en `AppRouter.tsx`.

Resultado esperado: flujo movil sin cambios funcionales.

### Fase 6 - Validacion final de cierre

Objetivo: aprobar release tecnico de la correccion.

1. Ejecutar build frontend (`npm run build`).
2. Pruebas manuales en desktop:
    - Visitas: foto principal y foto adicional.
    - Paquetes: evidencia fotografica + firma.
3. Pruebas de error:
    - permiso bloqueado,
    - sin camara,
    - cambio de pestañas.
4. Confirmar no regresion movil.

Resultado esperado: checklist completo aprobado.

---

## Archivos objetivo

### Cambios directos (PC)

- `frontend/src/shared/components/PhotoCapture.tsx`
- `frontend/src/shared/components/CameraCapture.tsx`
- `frontend/src/features/visits/components/CreateVisitDialog.tsx`
- `frontend/src/features/packages/components/RegisterPackageDialog.tsx`

### Solo verificacion (movil, sin cambios)

- `frontend/src/shared/hooks/useCameraSession.ts`
- `frontend/src/features/capture/MobileCapturePage.tsx`
- `frontend/src/routes/AppRouter.tsx`

---

## Riesgos y mitigacion

| Riesgo                          | Mitigacion                                                              |
| ------------------------------- | ----------------------------------------------------------------------- |
| Regresion en flujo movil        | No tocar hooks/rutas/componentes moviles; validacion dedicada en Fase 5 |
| Reinicios de estado por remount | Revisar y ajustar uso de `key` dinamicas en dialogs                     |
| Streams colgados (camera lock)  | Forzar cleanup de tracks en todos los ciclos de vida                    |
| Falta de feedback al usuario    | Mensajes explicitos para permisos/dispositivos/error                    |

---

## Checklist de aceptacion

- [ ] En Visitas, tab "Camara PC" muestra video en vivo.
- [ ] En Visitas, permite capturar y retomar en foto principal y adicional.
- [ ] En Paquetes, tab "Camara PC" permite capturar y retomar evidencia.
- [ ] Si hay mas de una camara, se puede seleccionar dispositivo.
- [ ] Si no hay permiso o no hay camara, se muestra mensaje claro.
- [x] `npm run build` termina sin errores.
- [x] Captura movil por QR sigue funcionando exactamente igual (verificacion tecnica sin regresion en archivos clave).

---

## Nota operativa

Si en ambiente productivo el navegador exige contexto seguro para camara, validar politica HTTPS del origen del frontend. Este punto es de entorno, no de logica de negocio.
