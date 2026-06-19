# Plan por Fases - Rediseño Visual de Modales (Visitas y Paquetería)

## Objetivo general

Mejorar la experiencia de diligenciamiento en los modales de creación de Visitas y Paquetería, reduciendo o eliminando el scroll vertical en escritorio mediante mayor ancho horizontal y redistribución visual de campos.

## Restricciones (obligatorias)

1. No eliminar ningún campo existente.
2. No modificar validaciones de formularios (Zod/RHF).
3. No modificar nombres de propiedades ni estructura de payloads enviados al backend.
4. No modificar reglas de negocio ni lógica condicional (ejemplo: bloque de vehículo en visitas).
5. Cambios limitados a layout, clases visuales y orden visual de secciones.

## Archivos a intervenir

- frontend/src/features/visits/components/CreateVisitDialog.tsx
- frontend/src/features/packages/components/RegisterPackageDialog.tsx

---

## Fase 0 - Preparación y baseline

### Objetivo

Asegurar un punto de partida limpio y medible antes del rediseño.

### Actividades

1. Confirmar estado actual de ambos modales en desktop (1280px y 1440px).
2. Registrar capturas de referencia del layout actual.
3. Verificar que los formularios funcionan correctamente antes del cambio.

### Criterios de salida

- Baseline visual y funcional conocido para comparar después.

---

## Fase 1 - Inventario completo de campos (sin omisiones)

### Objetivo

Listar y proteger todos los campos que deben permanecer en cada modal.

### 1.1 Modal de Visitas - campos obligatorios a conservar

1. documentNumber
2. firstName
3. secondName
4. lastName
5. secondLastName
6. destinationId
7. representativeId
8. Chip informativo de arrendatario (cuando aplique)
9. hasVehicle
10. vehicleTypeId (condicional)
11. brand (condicional)
12. model (condicional)
13. color (condicional)
14. plate (condicional)
15. photo (PhotoCapture)
16. photo2 (PhotoCapture)
17. Footer: botón Cancelar
18. Footer: botón Registrar Visita

### 1.2 Modal de Paquetería - campos obligatorios a conservar

1. controlNumber
2. senderName
3. senderCompany
4. trackingNumber
5. description
6. receivedBy
7. destinationId
8. representativeId
9. notes
10. photo (PhotoCapture)
11. receiverSignature (SignatureCapture)
12. Footer: botón Cancelar
13. Footer: botón Registrar paquete

### Criterios de salida

- Inventario validado y usado como checklist de no-regresión.

---

## Fase 2 - Rediseño visual del modal de Visitas

### Objetivo

Pasar de layout predominantemente vertical a layout en dos columnas para escritorio.

### Cambios visuales propuestos

1. Aumentar ancho de DialogContent (ejemplo: max-w-3xl o max-w-4xl según pruebas).
2. Estructurar el cuerpo del formulario en 2 columnas:
    - Columna izquierda: datos de visitante + destino + representante + bloque vehículo.
    - Columna derecha: sección de fotografías (photo y photo2).
3. Mantener subgrids internos existentes:
    - Nombres en 2 columnas.
    - Apellidos en 2 columnas.
    - Datos de vehículo en 2 columnas cuando hasVehicle sea true.
4. Mantener footer intacto al final del formulario.

### Responsividad

- Desktop: layout en 2 columnas.
- Tablet/móvil: fallback a 1 columna para evitar compresión excesiva.

### Criterios de salida

- Todos los campos visibles y funcionales.
- Reducción significativa del scroll vertical en escritorio.

---

## Fase 3 - Rediseño visual del modal de Paquetería

### Objetivo

Optimizar distribución para evitar longitud excesiva vertical conservando toda la captura de evidencia.

### Cambios visuales propuestos

1. Aumentar ancho de DialogContent (ejemplo: max-w-4xl o max-w-5xl según pruebas).
2. Reorganizar en 2 columnas principales:
    - Columna izquierda: todos los campos de texto/select (manteniendo sus grids internos actuales).
    - Columna derecha: Evidencia fotográfica + Firma de recepción apiladas.
3. Conservar refs y handlers de captura sin cambios:
    - photoRef
    - signatureRef

### Responsividad

- Desktop: dos columnas.
- Tablet/móvil: una columna.

### Criterios de salida

- Todos los campos se mantienen.
- Foto y firma visibles sin desplazar el formulario principal hacia abajo.

---

## Fase 4 - Ajuste fino de UX y consistencia visual

### Objetivo

Alinear espaciados, jerarquía visual y legibilidad entre ambos modales.

### Actividades

1. Unificar spacing vertical/horizontal entre grupos de campos.
2. Revisar tamaños de labels e inputs para lectura cómoda.
3. Mantener consistencia en encabezados de secciones (ejemplo: evidencia/firma).
4. Verificar que mensajes de error no rompan la grilla visual.

### Criterios de salida

- Ambos modales se perciben coherentes y más ágiles de diligenciar.

---

## Fase 5 - Validación funcional y no-regresión

### Objetivo

Garantizar que el cambio visual no afecte la funcionalidad.

### Pruebas mínimas

1. Build:
    - Ejecutar npm run build y confirmar 0 errores.
2. Visitas:
    - Envío con datos mínimos válidos.
    - Envío con vehículo activado.
    - Validación de errores cuando faltan campos requeridos.
    - Captura de photo y photo2.
3. Paquetería:
    - Envío con datos mínimos válidos.
    - Envío con/sin photo y con/sin receiverSignature.
    - Validación de errores de campos requeridos.
4. Responsividad:
    - Desktop (1280/1440): sin scroll o scroll mínimo.
    - Tablet/móvil: layout fallback correcto sin superposición.

### Criterios de salida

- Sin cambios funcionales.
- Formularios completos y operativos.
- UX visual mejorada en escritorio.

---

## Fase 6 - Cierre e implementación final

### Objetivo

Cerrar la tarea con evidencia clara y lista para revisión.

### Entregables

1. Dos archivos actualizados con layout visual mejorado.
2. Build exitoso.
3. Checklist de no-regresión completado.

### Definición de terminado (DoD)

- Ningún campo eliminado.
- Ninguna validación alterada.
- Ningún payload alterado.
- Mejora de experiencia visible en ambos modales.

---

## Riesgos y mitigación

1. Riesgo: forzar demasiado ancho y romper tablet.
    - Mitigación: breakpoints responsivos con fallback de 1 columna.
2. Riesgo: mensajes de error desalineen grilla.
    - Mitigación: mantener contenedores con spacing consistente.
3. Riesgo: percepción de mejora parcial en pantallas pequeñas.
    - Mitigación: optimizar principalmente desktop, mantener legibilidad móvil.

---

## Nota final

Este plan está diseñado para intervenir exclusivamente presentación y distribución visual, manteniendo intacta toda la lógica de negocio y comportamiento actual de los formularios.
