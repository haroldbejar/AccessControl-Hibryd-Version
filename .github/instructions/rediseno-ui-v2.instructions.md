---
name: "Rediseño UI v2 — Paleta Moderna + Cards con Profundidad"
description: "Plan de implementación para el rediseño visual completo: paleta #3B82F6/#6366F1, cards con box-shadow real, sidebar con gradiente en dark, KPIs per-categoría, hover animado en tablas."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de rediseño visual v2. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Elevar la calidad visual de la SPA con:

- Paleta moderna: primario `#3B82F6` (blue-500), acento `#6366F1` (indigo-500)
- Cards con profundidad real (box-shadow) en lugar de borde superior azul
- Sidebar con gradiente oscuro en dark mode
- KPI cards con icono de color por categoría
- Hover suave en filas de tablas
- Border-radius consistente 12px (via `--radius: 0.75rem`)
- Azul **solo** para estados activos/hover/focus — no como borde decorativo en todos lados

---

## Decisiones de arquitectura confirmadas

| Decisión           | Valor                                                                   |
| ------------------ | ----------------------------------------------------------------------- |
| Primario           | `#3B82F6` (blue-500) — más saturado que el `#5B8DEF` anterior           |
| Acento/Secundario  | `#6366F1` (indigo-500) — reemplaza `#A78BFA` purple                     |
| Fondo light        | `#F6F8FB` — levemente más frío que `#F4F7FC` anterior                   |
| Fondo dark         | `#0B1220` — más profundo que `#0F172A` anterior                         |
| Cards dark         | `#111827` — más oscuro que `#1E293B` anterior                           |
| Border-radius      | `--radius: 0.75rem` (12px) — más generoso que `0.625rem` (10px)         |
| Card shadow light  | `0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)`               |
| Card shadow dark   | `0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.07)`          |
| Selector CSS cards | `[data-slot="card"]` — el Card de ShadCN Radix Nova lo usa              |
| Sidebar dark       | `bg-gradient-to-b from-[#0F172A] to-[#020617]`                          |
| Nav activo         | `bg-primary/10 text-primary font-semibold` (no sólido)                  |
| Nav hover          | `hover:bg-primary/5 dark:hover:bg-white/5`                              |
| KPI colores        | Visitas: blue · Activas: emerald · Paquetes: violet · Pendientes: amber |
| Archivos nuevos    | Ninguno                                                                 |
| Archivos editados  | 3: `index.css`, `MainLayout.tsx`, `DashboardPage.tsx`                   |

---

## Estado de implementación

- [x] **Fase A** — Tokens CSS: `:root` y `.dark` actualizados, card shadow global añadido ✅
- [x] **Fase B** — Sidebar con gradiente dark, nav activo/hover refinado, bordes adaptativos ✅
- [x] **Fase C** — Dashboard: KPIs per-categoría, sin bordes azules en cards, tabla hover suave ✅

---

## Paleta completa — Light Mode

| Variable CSS                  | Valor anterior | Valor nuevo            |
| ----------------------------- | -------------- | ---------------------- |
| `--background`                | `#f4f7fc`      | `#f6f8fb`              |
| `--foreground`                | `#1f2937`      | `#0f172a`              |
| `--card`                      | `#ffffff`      | `#ffffff` (sin cambio) |
| `--card-foreground`           | `#1f2937`      | `#0f172a`              |
| `--primary`                   | `#5b8def`      | `#3b82f6`              |
| `--secondary`                 | `#eef2fb`      | `#f1f5f9`              |
| `--muted`                     | `#eef2fb`      | `#f1f5f9`              |
| `--muted-foreground`          | `#6b7280`      | `#64748b`              |
| `--accent`                    | `#a78bfa`      | `#6366f1`              |
| `--border`                    | `#d9e4f5`      | `#e2e8f0`              |
| `--input`                     | `#d9e4f5`      | `#e2e8f0`              |
| `--ring`                      | `#5b8def`      | `#3b82f6`              |
| `--radius`                    | `0.625rem`     | `0.75rem`              |
| `--sidebar-primary`           | `#5b8def`      | `#3b82f6`              |
| `--sidebar-accent`            | `#eef2fb`      | `#f1f5f9`              |
| `--sidebar-accent-foreground` | `#5b8def`      | `#3b82f6`              |
| `--sidebar-border`            | `#d9e4f5`      | `#e2e8f0`              |
| `--sidebar-ring`              | `#5b8def`      | `#3b82f6`              |

## Paleta completa — Dark Mode

| Variable CSS             | Valor anterior | Valor nuevo |
| ------------------------ | -------------- | ----------- |
| `--background`           | `#0f172a`      | `#0b1220`   |
| `--foreground`           | `#f1f5f9`      | `#e5e7eb`   |
| `--card`                 | `#1e293b`      | `#111827`   |
| `--card-foreground`      | `#f1f5f9`      | `#e5e7eb`   |
| `--popover`              | `#1e293b`      | `#111827`   |
| `--popover-foreground`   | `#f1f5f9`      | `#e5e7eb`   |
| `--secondary`            | `#1e3a5f`      | `#1f2937`   |
| `--secondary-foreground` | `#f1f5f9`      | `#e5e7eb`   |
| `--muted`                | `#1e293b`      | `#1f2937`   |
| `--accent`               | `#a78bfa`      | `#6366f1`   |
| `--border`               | `#334155`      | `#1f2937`   |
| `--input`                | `#334155`      | `#1f2937`   |
| `--sidebar`              | `#1e293b`      | `#111827`   |
| `--sidebar-foreground`   | `#f1f5f9`      | `#e5e7eb`   |
| `--sidebar-accent`       | `#1e3a5f`      | `#1a2a40`   |
| `--sidebar-border`       | `#334155`      | `#1f2937`   |
| `--radius`               | `0.625rem`     | `0.75rem`   |

---

## Fase A — Tokens CSS (`frontend/src/index.css`)

### A.1 — Reemplazar bloque `:root` completo

```css
:root {
    --background: #f6f8fb;
    --foreground: #0f172a;
    --card: #ffffff;
    --card-foreground: #0f172a;
    --popover: #ffffff;
    --popover-foreground: #0f172a;
    --primary: #3b82f6;
    --primary-foreground: #ffffff;
    --secondary: #f1f5f9;
    --secondary-foreground: #0f172a;
    --muted: #f1f5f9;
    --muted-foreground: #64748b;
    --accent: #6366f1;
    --accent-foreground: #ffffff;
    --destructive: #ef4444;
    --border: #e2e8f0;
    --input: #e2e8f0;
    --ring: #3b82f6;
    --chart-1: #3b82f6;
    --chart-2: #6366f1;
    --chart-3: #10b981;
    --chart-4: #f59e0b;
    --chart-5: #ef4444;
    --radius: 0.75rem;
    --sidebar: #ffffff;
    --sidebar-foreground: #0f172a;
    --sidebar-primary: #3b82f6;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #f1f5f9;
    --sidebar-accent-foreground: #3b82f6;
    --sidebar-border: #e2e8f0;
    --sidebar-ring: #3b82f6;
}
```

### A.2 — Reemplazar bloque `.dark` completo

```css
.dark {
    --background: #0b1220;
    --foreground: #e5e7eb;
    --card: #111827;
    --card-foreground: #e5e7eb;
    --popover: #111827;
    --popover-foreground: #e5e7eb;
    --primary: #3b82f6;
    --primary-foreground: #ffffff;
    --secondary: #1f2937;
    --secondary-foreground: #e5e7eb;
    --muted: #1f2937;
    --muted-foreground: #94a3b8;
    --accent: #6366f1;
    --accent-foreground: #ffffff;
    --destructive: #f87171;
    --border: #1f2937;
    --input: #1f2937;
    --ring: #3b82f6;
    --chart-1: #3b82f6;
    --chart-2: #6366f1;
    --chart-3: #10b981;
    --chart-4: #f59e0b;
    --chart-5: #fcd34d;
    --radius: 0.75rem;
    --sidebar: #111827;
    --sidebar-foreground: #e5e7eb;
    --sidebar-primary: #3b82f6;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #1a2a40;
    --sidebar-accent-foreground: #93c5fd;
    --sidebar-border: #1f2937;
    --sidebar-ring: #3b82f6;
}
```

### A.3 — Añadir card shadow en `@layer base`

```css
@layer base {
    * {
        @apply border-border outline-ring/50;
    }
    body {
        @apply bg-background text-foreground;
    }
    html {
        @apply font-sans;
    }
    /* Card depth global — usa data-slot del ShadCN Radix Nova */
    [data-slot="card"] {
        box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.03),
            0 4px 16px rgba(0, 0, 0, 0.06);
        transition:
            box-shadow 0.2s ease,
            transform 0.15s ease;
    }
    .dark [data-slot="card"] {
        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(59, 130, 246, 0.07);
    }
}
```

### Verificación Fase A

```
npm run build → 0 errores
```

---

## Fase B — Sidebar + Topbar (`frontend/src/layouts/MainLayout.tsx`)

### B.1 — Aside sidebar

```diff
- <aside className="w-64 border-r bg-card flex flex-col shrink-0">
+ <aside className="w-64 border-r border-sidebar-border bg-sidebar dark:bg-gradient-to-b dark:from-[#0F172A] dark:to-[#020617] flex flex-col shrink-0">
```

### B.2 — Logo area border

```diff
- <div className="flex items-center gap-2 px-6 py-5 border-b">
+ <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
```

### B.3 — Nav item active/hover

```diff
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
-       ? "bg-primary text-primary-foreground"
-       : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
+       ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-blue-400 font-semibold"
+       : "text-muted-foreground hover:bg-primary/5 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
    }`
  }
```

### B.4 — User info border

```diff
- <div className="px-4 py-4 border-t">
+ <div className="px-4 py-4 border-t border-sidebar-border">
```

### Verificación Fase B

```
npm run build → 0 errores
```

---

## Fase C — Dashboard (`frontend/src/features/dashboard/DashboardPage.tsx`)

### C.1 — Array kpis con colores per-categoría

```ts
const kpis = [
    {
        title: "Visitas hoy",
        value: visits.length,
        icon: Users,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        numColor: "text-blue-600 dark:text-blue-400",
    },
    {
        title: "Visitas activas",
        value: activeVisits.length,
        icon: LogIn,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        numColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
        title: "Paquetes hoy",
        value: packages.length,
        icon: Package,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        numColor: "text-violet-600 dark:text-violet-400",
    },
    {
        title: "Paquetes pendientes",
        value: pending.length,
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        numColor: "text-amber-600 dark:text-amber-400",
    },
];
```

### C.2 — KPI Card sin borde azul

```tsx
// ANTES
<Card className="border-t-2 border-[#2563EB] dark:border-blue-500 shadow-[...] hover:shadow-[...] hover:-translate-y-0.5 transition-all duration-200">
  <CardContent className="pt-6">
    <p className="text-sm text-[#6B7280] dark:text-slate-400">{title}</p>
    <p className="text-4xl font-bold mt-1 text-[#2563EB] dark:text-blue-400">{value}</p>
    <div className={`${bg} p-3 rounded-full`}>

// DESPUÉS
<Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
  <CardContent className="pt-6">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className={`text-4xl font-bold mt-1 ${numColor}`}>{value}</p>
    <div className={`${bg} p-3 rounded-xl`}>
```

### C.3 — Cards de tabla sin borde azul ni header coloreado

```tsx
// ANTES
<Card className="border-t-2 border-[#2563EB] dark:border-blue-500 shadow-[...] hover:shadow-[...] hover:-translate-y-0.5 transition-all duration-200">
  <CardHeader className="rounded-t-xl px-4 pb-3 bg-[#DBEAFE] dark:bg-blue-900/40 border-b border-[#E5E7EB] dark:border-slate-700">
    <CardTitle className="text-base font-semibold text-[#2563EB] dark:text-blue-400">

// DESPUÉS
<Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
  <CardHeader className="px-4 pb-3 border-b">
    <CardTitle className="text-base font-semibold">
```

### C.4 — Table row hover suave

```diff
- className="border-b last:border-0 hover:bg-muted/30 transition-colors"
+ className="border-b last:border-0 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
```

### C.5 — Card Reservas de hoy

```tsx
// ANTES
<Card className="border-t-2 border-[#2563EB] dark:border-blue-500 ...">
  <CardHeader className="rounded-t-xl px-4 pb-3 bg-[#DBEAFE] ...">
    <CardTitle className="... text-[#2563EB] dark:text-blue-400">
      <CalendarDays className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />

// DESPUÉS
<Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
  <CardHeader className="px-4 pb-3 border-b">
    <CardTitle className="text-base font-semibold flex items-center gap-2">
      <CalendarDays className="h-4 w-4 text-primary" />
```

### Verificación Fase C

```
npm run build → 0 errores
```

---

## Archivos modificados — resumen

```
frontend/src/
  index.css                                           ← EDITAR (paleta, radius, card shadow)
  layouts/MainLayout.tsx                              ← EDITAR (sidebar gradient, nav active/hover)
  features/dashboard/DashboardPage.tsx                ← EDITAR (KPI colors, sin bordes azules, hover tablas)
```

Sin archivos nuevos. Sin cambios de lógica.

---

## Verificación final end-to-end

- [ ] `npm run build` → 0 errores
- [ ] Light mode: fondo `#F6F8FB`, cards blancas con sombra sutil, primario `#3B82F6`
- [ ] Dark mode: fondo `#0B1220`, cards `#111827`, sidebar con gradiente
- [ ] Dashboard: 4 KPI cards con colores distintos (blue/emerald/violet/amber)
- [ ] Cards de tabla: sin borde azul superior, header limpio, sombra del global
- [ ] Nav activo: fondo azul translúcido + texto azul (no sólido)
- [ ] Nav hover: fondo muy sutil (5% primary en light, 5% blanco en dark)
- [ ] Filas de tabla: hover con `bg-primary/5` visible pero sutil
- [ ] Toggle dark/light: transición correcta en ambas direcciones
- [ ] Resto de páginas (Visitas, Paquetes, etc.): heredan correctamente via variables CSS
