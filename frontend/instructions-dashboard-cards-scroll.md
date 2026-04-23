---
name: "Dashboard — Cards con scroll y altura fija"
description: "Plan de implementación para limitar a 5 elementos visibles las cards de Paquetes pendientes y Visitas recientes, usando scroll vertical y altura fija."
applyTo: "frontend/src/features/dashboard/DashboardPage.tsx"
---

## Propósito

Evitar que las cards de "Paquetes pendientes" y "Visitas recientes" en el Dashboard cambien de tamaño dinámicamente al agregar o quitar elementos. Se mostrará un máximo de 5 elementos visibles; si hay más, se habilitará scroll vertical dentro de la card.

---

## Fases del plan

### Fase 1 — Análisis y diseño

- Revisar la estructura de las cards en `DashboardPage.tsx`.
- Identificar el contenedor de la lista/tabla dentro de cada card.

### Fase 2 — Implementación de altura fija y scroll

- Definir una altura máxima para el contenedor de la lista/tablas (suficiente para 5 filas).
- Aplicar `overflow-y-auto` y `max-h-[valor]` (Tailwind o CSS inline) al contenedor.
- Renderizar todos los elementos, pero solo 5 serán visibles a la vez; el resto se accede con scroll.
- Verificar que header/footer de la card no se vean afectados.

### Fase 3 — Ajustes visuales y responsivos

- El scroll solo debe aparecer si hay más de 5 elementos.
- Probar en desktop y móvil para asegurar consistencia.
- Revisar en modo claro y oscuro.

### Fase 4 — Verificación y pruebas

- Agregar más de 5 paquetes/visitas y validar que la card no cambia de tamaño y aparece scroll.
- Eliminar elementos y verificar que la card mantiene su altura hasta que hay 5 o menos (scroll desaparece).
- Validar experiencia fluida y sin saltos visuales.

---

## Archivos a modificar

- `frontend/src/features/dashboard/DashboardPage.tsx` (único archivo necesario)
- (Opcional) `frontend/src/index.css` si se requiere clase utilitaria personalizada.

---

## Decisiones

- Se prioriza la experiencia visual estable sobre mostrar todos los elementos a la vez.
- El scroll solo aparece si hay más de 5 elementos.
- No se modifica la lógica de datos, solo la presentación visual.

---

## Resultado esperado

- Cards de "Paquetes pendientes" y "Visitas recientes" con altura fija y scroll vertical si hay más de 5 elementos.
- Layout del dashboard consistente y sin saltos visuales al agregar/quitar elementos.
