---
name: "Dashboard — Rediseño Visual de Cards"
description: "Plan de implementación para diferenciar las cards del dashboard con paleta neutral + azul primario y sistema de elevación."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de rediseño visual del Dashboard. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Diferenciar visualmente cada card del Dashboard para romper la monotonía visual. El diseño adoptado es **paleta neutral + azul primario uniforme** con header coloreado, borde superior, y sistema de elevación con sombra y hover lift.

---

## Decisiones de diseño confirmadas ✅ IMPLEMENTADO

| Decisión         | Valor                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| Estilo general   | Header `#DBEAFE` + borde superior `#2563EB` 2px — coherente, profesional |
| KPI cards        | Número `text-4xl` en `#2563EB` + burbuja ícono en `#DBEAFE`              |
| Paleta           | Neutral + azul primario únicamente (sin multi-color por categoría)       |
| Elevación Nv1    | `box-shadow: 0 4px 12px rgba(0,0,0,0.05)` — todas las cards              |
| Elevación Nv2    | `hover: shadow 0 10px 25px rgba(0,0,0,0.08)` + `translateY(-2px)`        |
| Transición       | `transition-all duration-200`                                            |
| Archivo editado  | Solo `DashboardPage.tsx` — cero archivos nuevos, cero cambios de lógica  |
| Modo oscuro      | No modificado — deuda preexistente pendiente                             |
| Badges de estado | No modificados                                                           |

---

## Paleta final aprobada

| Uso                    | Color          | Hex       |
| ---------------------- | -------------- | --------- |
| Background             | Gris muy claro | `#F8FAFC` |
| Card                   | Blanco         | `#FFFFFF` |
| Bordes separadores     | Gris suave     | `#E5E7EB` |
| Borde superior         | Azul           | `#2563EB` |
| Header fondo           | Azul suave     | `#DBEAFE` |
| Primary (texto/iconos) | Azul           | `#2563EB` |
| Texto secundario       | Gris medio     | `#6B7280` |

---

## Estado de implementación

- [x] **Fase 1** — KPI Cards: número `text-4xl` en `#2563EB`, burbuja ícono `#DBEAFE`, borde superior + elevación
- [x] **Fase 2** — Table Cards: header `bg-[#DBEAFE]` + título `text-[#2563EB]` + elevación hover
- [x] **Fase 3** — Card Reservas de hoy: mismo tratamiento + ícono `CalendarDays` en `#2563EB`

---

## Fase 1 — KPI Cards

### Archivo

`frontend/src/features/dashboard/DashboardPage.tsx`

### Cambio 1.1 — Agregar campo `colorHex` al array `kpis`

El array de KPIs tiene actualmente 4 objetos. Cada uno tiene `{ title, value, icon, color, bg }`.
Añadir un campo `colorHex` con el hex puro de cada color (sin clase Tailwind), para usarlo en el número como inline style.

```ts
// ANTES (ejemplo de un kpi)
{
  title: "Visitas hoy",
  value: visits.length,
  icon: Users,
  color: "text-blue-600",
  bg: "bg-blue-50",
}

// DESPUÉS
{
  title: "Visitas hoy",
  value: visits.length,
  icon: Users,
  color: "text-[#5b8def]",
  bg: "bg-[#5b8def]/10",
  colorHex: "#5b8def",
},
{
  title: "Visitas activas",
  value: activeVisits.length,
  icon: LogIn,
  color: "text-[#34d399]",
  bg: "bg-[#34d399]/10",
  colorHex: "#34d399",
},
{
  title: "Paquetes hoy",
  value: packages.length,
  icon: Package,
  color: "text-[#a78bfa]",
  bg: "bg-[#a78bfa]/10",
  colorHex: "#a78bfa",
},
{
  title: "Paquetes pendientes",
  value: pending.length,
  icon: Clock,
  color: "text-[#f59e0b]",
  bg: "bg-[#f59e0b]/10",
  colorHex: "#f59e0b",
},
```

### Cambio 1.2 — Número grande con color inline

En el JSX donde se renderiza el número del KPI, cambiar:

- `text-2xl font-bold` (o similar) → `text-4xl font-bold`
- Agregar `style={{ color: kpi.colorHex }}`

```tsx
// ANTES
<p className="text-2xl font-bold text-foreground">{kpi.value}</p>

// DESPUÉS
<p className="text-4xl font-bold" style={{ color: kpi.colorHex }}>
  {kpi.value}
</p>
```

> La burbuja del ícono hereda automáticamente el cambio de `kpi.color` y `kpi.bg` — no requiere cambios extra.

### Verificación Fase 1

- [ ] 4 KPI cards muestran el número grande en el color de su categoría
- [ ] Burbuja del ícono usa el tono Neo Gradient correcto (no azul/verde/púrpura/naranja genérico)
- [ ] `npm run build` → 0 errores

---

## Fase 2 — Table Cards: Visitas y Paquetes

### Archivo

`frontend/src/features/dashboard/DashboardPage.tsx`

### Cambio 2.1 — CardHeader "Visitas recientes" → color primary (#5b8def)

```tsx
// ANTES
<CardHeader className="rounded-t-xl px-4 pb-3">
  <CardTitle className="text-base font-semibold">Visitas recientes</CardTitle>
</CardHeader>

// DESPUÉS
<CardHeader className="rounded-t-xl px-4 pb-3 bg-[#5b8def]/10 border-b border-[#5b8def]/20">
  <CardTitle className="text-base font-semibold text-[#5b8def]">
    Visitas recientes
  </CardTitle>
</CardHeader>
```

### Cambio 2.2 — CardHeader "Paquetes pendientes de entrega" → color accent (#a78bfa)

```tsx
// ANTES
<CardHeader className="rounded-t-xl px-4 pb-3">
  <CardTitle className="text-base font-semibold">Paquetes pendientes de entrega</CardTitle>
</CardHeader>

// DESPUÉS
<CardHeader className="rounded-t-xl px-4 pb-3 bg-[#a78bfa]/10 border-b border-[#a78bfa]/20">
  <CardTitle className="text-base font-semibold text-[#a78bfa]">
    Paquetes pendientes de entrega
  </CardTitle>
</CardHeader>
```

### Verificación Fase 2

- [ ] Card "Visitas recientes" tiene header azul (#5b8def) diferenciable
- [ ] Card "Paquetes pendientes" tiene header púrpura (#a78bfa) diferenciable
- [ ] `npm run build` → 0 errores

---

## Fase 3 — Card Reservas de hoy

### Archivo

`frontend/src/features/dashboard/DashboardPage.tsx`

### Cambio 3.1 — CardHeader "Reservas de hoy" → color chart-4 (#34d399)

Esta card ya tiene un ícono `CalendarDays` en el título. Se actualiza el header completo:

```tsx
// ANTES
<CardHeader className="rounded-t-xl px-4 pb-3">
  <CardTitle className="text-base font-semibold flex items-center gap-2">
    <CalendarDays className="h-4 w-4 text-primary" />
    Reservas de hoy
  </CardTitle>
</CardHeader>

// DESPUÉS
<CardHeader className="rounded-t-xl px-4 pb-3 bg-[#34d399]/10 border-b border-[#34d399]/20">
  <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#34d399]">
    <CalendarDays className="h-4 w-4 text-[#34d399]" />
    Reservas de hoy
  </CardTitle>
</CardHeader>
```

### Verificación Fase 3

- [ ] Card "Reservas de hoy" tiene header verde (#34d399) diferenciable
- [ ] El ícono CalendarDays usa el mismo tono verde
- [ ] `npm run build` → 0 errores

---

## Verificación final end-to-end

- [ ] `npm run build` → 0 errores
- [ ] Dashboard cargado en browser: 7 cards con colores distintos visibles
- [ ] KPIs muestran número grande coloreado por categoría
- [ ] Headers de tablas: azul (Visitas) | púrpura (Paquetes) | verde (Reservas)
- [ ] En móvil (viewport ~400px): grid 2x2 de KPIs luce correcto
- [ ] Los badges de estado dentro de tablas no cambiaron

---

## Archivos a modificar — resumen

```
frontend/src/features/dashboard/DashboardPage.tsx    ← EDITAR (único archivo)
```

Sin archivos nuevos. Sin cambios de lógica. Sin cambios de tipos.
