---
name: "Sidebar Colapsable"
description: "Plan de implementación para colapsar/expandir el menú lateral con botón hamburger, mostrando solo íconos en modo colapsado."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de implementación del sidebar colapsable. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Permitir al usuario ocultar las etiquetas de texto del sidebar y ver solo los íconos, ganando espacio horizontal en pantalla. Un botón hamburger en el topbar alterna entre el estado expandido (`w-64`) y colapsado (`w-16`). La preferencia se persiste en `localStorage`.

---

## Decisiones de arquitectura confirmadas

| Decisión            | Valor                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------- |
| Estado              | `useState<boolean>` local en `MainLayout` + `localStorage` (`access-control-sidebar`) |
| Ancho expandido     | `w-64` (256px) — igual que hoy                                                        |
| Ancho colapsado     | `w-16` (64px) — suficiente para íconos de 16px + padding                              |
| Animación           | `transition-all duration-300 ease-in-out` en el `<aside>`                             |
| Botón toggle        | Ícono `PanelLeftClose` / `PanelLeftOpen` de lucide — en el topbar izquierda           |
| Tooltips colapsado  | Atributo `title` nativo en cada `<NavLink>` — sin dependencias nuevas                 |
| Badge paquetes      | Permanece visible en modo colapsado (posicionamiento absoluto ya existente)           |
| User info colapsado | Mostrar solo iniciales del nombre en un círculo                                       |
| Logo colapsado      | Solo ícono `Shield` centrado, texto "Access Control" oculto                           |
| Archivos nuevos     | Ninguno                                                                               |
| Archivos editados   | Solo `MainLayout.tsx`                                                                 |
| Imports nuevos      | `PanelLeftClose`, `PanelLeftOpen` de lucide (ya instalado)                            |

---

## Estado de implementación

- [x] **Fase A** — Estado + ancho dinámico del `<aside>` + botón toggle en topbar ✅ Build: 0 errores
- [ ] **Fase B** — Logo colapsado (solo Shield centrado)
- [ ] **Fase C** — Nav items colapsados (solo íconos centrados + tooltips)
- [ ] **Fase D** — User info colapsado (iniciales en círculo)
- [ ] **Fase E** — Persistencia en localStorage (incluida en Fase A)

---

## Análisis del archivo actual

`MainLayout.tsx` tiene esta estructura:

```
<div className="flex h-screen bg-background">
  <aside className="w-64 border-r ... flex flex-col shrink-0">
    <div Logo />             ← px-6, Shield + texto
    <nav NavLinks />         ← map de navItems con Icon + label
    <div UserInfo />         ← nombre + rol
  </aside>
  <div flex-1 flex-col>
    <header h-14>
      <div />               ← ← ← VACÍO — aquí va el botón hamburger
      <div items-center>   ← toggleTheme + NotificationBell + DropdownMenu
    </header>
    <main>
      <Outlet />
    </main>
  </div>
</div>
```

---

## Fase A — Estado y botón toggle

### Objetivo

Añadir el estado `collapsed` + botón hamburger en el topbar + ancho dinámico del `<aside>`.

### Cambios en `MainLayout.tsx`

**1. Import nuevos íconos:**

```ts
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
```

**2. Estado local con inicialización desde localStorage:**

```ts
const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("access-control-sidebar") === "true";
});

const toggleSidebar = () => {
    setCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem("access-control-sidebar", String(next));
        return next;
    });
};
```

**3. `<aside>` con ancho dinámico:**

```tsx
// ANTES
<aside className="w-64 border-r border-sidebar-border bg-sidebar ...">

// DESPUÉS
<aside className={`${collapsed ? "w-16" : "w-64"} border-r border-sidebar-border bg-sidebar dark:bg-linear-to-b dark:from-[#0F172A] dark:to-[#020617] flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}>
```

**4. Botón hamburger en el topbar (reemplaza `<div />` vacío):**

```tsx
// ANTES
<div />

// DESPUÉS
<Button variant="ghost" size="icon" onClick={toggleSidebar} title={collapsed ? "Expandir menú" : "Colapsar menú"}>
  {collapsed
    ? <PanelLeftOpen className="h-4 w-4" />
    : <PanelLeftClose className="h-4 w-4" />
  }
</Button>
```

### Verificación Fase A

- `npm run build` → 0 errores
- Click en botón → sidebar se anima de 256px a 64px y viceversa
- Los textos del sidebar se cortan (no se ve bien aún — se corrige en fases B, C, D)

---

## Fase B — Logo colapsado

### Objetivo

Cuando colapsado: mostrar solo el ícono `Shield` centrado. Cuando expandido: layout normal.

### Cambio

```tsx
// ANTES
<div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
  <Shield className="h-6 w-6 text-primary" />
  <span className="font-semibold text-lg">Access Control</span>
</div>

// DESPUÉS
<div className={`flex items-center border-b border-sidebar-border transition-all duration-300 ${collapsed ? "justify-center px-0 py-5" : "gap-2 px-6 py-5"}`}>
  <Shield className="h-6 w-6 text-primary shrink-0" />
  {!collapsed && (
    <span className="font-semibold text-lg whitespace-nowrap overflow-hidden">
      Access Control
    </span>
  )}
</div>
```

### Verificación Fase B

- Colapsado: solo Shield centrado en el área del logo
- Expandido: Shield + "Access Control" como antes

---

## Fase C — Nav items colapsados

### Objetivo

Cuando colapsado: solo íconos centrados, sin label de texto. Tooltip nativo (`title`) para accesibilidad.

### Cambio

```tsx
// ANTES
<NavLink
  key={to}
  to={to}
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
      isActive ? "..." : "..."
    }`
  }
>
  <span className="relative">
    <Icon className="h-4 w-4 shrink-0" />
    {to === "/packages" && packageAlerts > 0 && (
      <span className="absolute -top-2 -right-2 ...">...</span>
    )}
  </span>
  {label}
</NavLink>

// DESPUÉS
<NavLink
  key={to}
  to={to}
  title={collapsed ? label : undefined}
  className={({ isActive }) =>
    `flex items-center transition-all duration-150 rounded-md text-sm font-medium ${
      collapsed ? "justify-center px-0 py-2 w-full" : "gap-3 px-3 py-2"
    } ${
      isActive
        ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-blue-400 font-semibold"
        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
    }`
  }
>
  <span className="relative">
    <Icon className="h-4 w-4 shrink-0" />
    {to === "/packages" && packageAlerts > 0 && (
      <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-bold">
        {packageAlerts > 9 ? "9+" : packageAlerts}
      </span>
    )}
  </span>
  {!collapsed && label}
</NavLink>
```

### Verificación Fase C

- Colapsado: solo íconos centrados, sin texto
- Badge de paquetes visible en modo colapsado
- Hover sobre ícono colapsado → tooltip del browser con el label
- Estado activo (color azul) funciona igual en ambos modos

---

## Fase D — User info colapsado

### Objetivo

Cuando colapsado: mostrar iniciales del usuario en un pequeño círculo. Cuando expandido: nombre y rol como hoy.

### Lógica de iniciales

```ts
const initials =
    user?.name
        ?.split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() ?? "?";
```

### Cambio

```tsx
// ANTES
<div className="px-4 py-4 border-t border-sidebar-border">
  <p className="text-sm font-medium truncate">{user?.name}</p>
  <p className="text-xs text-muted-foreground truncate">{user?.roleName}</p>
</div>

// DESPUÉS
<div className={`border-t border-sidebar-border transition-all duration-300 ${collapsed ? "flex justify-center px-0 py-4" : "px-4 py-4"}`}>
  {collapsed ? (
    <div
      className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold"
      title={user?.name}
    >
      {initials}
    </div>
  ) : (
    <>
      <p className="text-sm font-medium truncate">{user?.name}</p>
      <p className="text-xs text-muted-foreground truncate">{user?.roleName}</p>
    </>
  )}
</div>
```

### Verificación Fase D

- Colapsado: círculo con iniciales (ej. "AB" para "Ana Bermúdez")
- Hover sobre el círculo → tooltip con nombre completo
- Expandido: nombre y rol como antes

---

## Fase E — Persistencia en localStorage

> Ya incluida en la Fase A como parte del `toggleSidebar`. No requiere fase separada de implementación.

El estado se inicializa leyendo `localStorage.getItem("access-control-sidebar")` y se actualiza en cada toggle. Al recargar, el sidebar recuerda su último estado.

### Verificación Fase E

- Colapsar → F5 → sidebar permanece colapsado
- Expandir → F5 → sidebar permanece expandido

---

## Archivos a editar — resumen

```
frontend/src/layouts/MainLayout.tsx    ← ÚNICO ARCHIVO EDITADO
```

**Cambios dentro del archivo:**

1. Import: `PanelLeftClose`, `PanelLeftOpen`
2. Estado: `collapsed` + `toggleSidebar` + lectura/escritura localStorage
3. Iniciales: cálculo de `initials` desde `user?.name`
4. `<aside>`: ancho dinámico + `transition-all duration-300`
5. Logo div: contenido condicional según `collapsed`
6. `<nav>` NavLink: layout condicional, `title` para tooltip, label condicional
7. Topbar `<div />` vacío: reemplazado por botón con `PanelLeftClose`/`PanelLeftOpen`
8. User info div: iniciales vs nombre/rol según `collapsed`

---

## Notas técnicas

- **`overflow-hidden`** en el `<aside>`: imprescindible para que el texto no desborde durante la animación de colapso.
- **`whitespace-nowrap`** en el label "Access Control": evita que el texto se rompa en 2 líneas durante la transición.
- **`shrink-0`** en los íconos: ya existe, evita que se compriman.
- **`PanelLeftClose` / `PanelLeftOpen`**: disponibles en lucide-react sin instalación adicional.
- **Tooltip nativo `title`**: suficiente para este caso; no requiere instalar componente Tooltip de ShadCN.
- **`transition-all duration-300`** en el aside: anima tanto el ancho como el padding suavemente.
- **Orden de fases**: A → B → C → D. Cada fase es independiente pero conviene implementarlas en orden para verificar incrementalmente.

---

## Verificación final end-to-end

- [ ] `npm run build` → 0 errores
- [ ] Click hamburger → sidebar se anima a 64px, solo íconos visibles
- [ ] Click hamburger → sidebar vuelve a 256px, textos visibles
- [ ] Hover sobre ícono colapsado → tooltip con label correcto
- [ ] Badge de notificación en Paquetes visible en ambos modos
- [ ] Estado activo del nav (azul) funciona en ambos modos
- [ ] Logo: solo Shield en colapsado, Shield + "Access Control" en expandido
- [ ] User info: iniciales en colapsado, nombre + rol en expandido
- [ ] F5 → sidebar recuerda su último estado (localStorage)
- [ ] Modo oscuro: transición correcta en ambos modos
- [ ] El contenido principal ocupa el espacio ganado al colapsar
