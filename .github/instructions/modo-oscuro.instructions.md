---
name: "Modo Oscuro (Dark Mode)"
description: "Plan de implementación del modo oscuro: ThemeProvider, toggle en topbar, paleta .dark alineada con #2563EB y adaptación de colores hardcodeados."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de implementación del modo oscuro. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Añadir soporte de modo oscuro completo a la SPA. El usuario podrá alternar entre modo claro y oscuro con un botón en el topbar; la preferencia se persiste en `localStorage`.

---

## Decisiones de arquitectura confirmadas

| Decisión                | Valor                                                                           |
| ----------------------- | ------------------------------------------------------------------------------- |
| Mecanismo               | Clase `.dark` en `<html>` — estándar ShadCN (ya configurado en `index.css`)     |
| Estado                  | React Context (`ThemeProvider`) + `localStorage` (clave `access-control-theme`) |
| Default                 | `light`                                                                         |
| Paleta `.dark`          | Fondo `#0F172A` (slate-900) + primary `#3B82F6` (blue-500 visible sobre oscuro) |
| Toggle UI               | Ícono `Sun` / `Moon` de lucide en el topbar (junto al botón de logout)          |
| Archivos nuevos         | Solo `src/shared/hooks/useTheme.ts` — ThemeProvider va en `main.tsx`            |
| Colores hardcodeados    | Reemplazados por pares `[#hex] dark:[class]` de Tailwind en `DashboardPage.tsx` |
| Otros tsx con hardcoded | Solo `DashboardPage.tsx` tiene hex fijos actualmente                            |

---

## Estado de implementación

- [x] **Fase A** — `index.css`: bloque `.dark` actualizado con paleta de marca (`#0F172A`, `#3B82F6`, sidebar/cards slate-800)
- [x] **Fase B** — `useTheme.ts` (NUEVO) + `main.tsx`: ThemeProvider con persistencia en localStorage (`access-control-theme`)
- [x] **Fase C** — `MainLayout.tsx`: botón toggle Moon/Sun en topbar junto al logout
- [x] **Fase D** — `DashboardPage.tsx`: hex hardcodeados reemplazados por pares `dark:` de Tailwind; eliminado `colorHex` e inline style

---

## Fase A — Paleta `.dark` en `index.css`

### Archivo

`frontend/src/index.css`

### Objetivo

Reemplazar el bloque `.dark` generado por ShadCN (grises oklch sin identidad) por una paleta oscura alineada con el azul primario `#2563EB`.

### Valores finales del bloque `.dark`

```css
.dark {
    --background: #0f172a;
    --foreground: #f1f5f9;
    --card: #1e293b;
    --card-foreground: #f1f5f9;
    --popover: #1e293b;
    --popover-foreground: #f1f5f9;
    --primary: #3b82f6;
    --primary-foreground: #ffffff;
    --secondary: #1e3a5f;
    --secondary-foreground: #f1f5f9;
    --muted: #1e293b;
    --muted-foreground: #94a3b8;
    --accent: #a78bfa;
    --accent-foreground: #ffffff;
    --destructive: #f87171;
    --border: #334155;
    --input: #334155;
    --ring: #3b82f6;
    --chart-1: #3b82f6;
    --chart-2: #a78bfa;
    --chart-3: #7fbcff;
    --chart-4: #34d399;
    --chart-5: #fcd34d;
    --radius: 0.625rem;
    --sidebar: #1e293b;
    --sidebar-foreground: #f1f5f9;
    --sidebar-primary: #3b82f6;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #1e3a5f;
    --sidebar-accent-foreground: #93c5fd;
    --sidebar-border: #334155;
    --sidebar-ring: #3b82f6;
}
```

### Verificación Fase A

- `npm run build` → 0 errores
- Agregar manualmente `class="dark"` al `<html>` en DevTools → todos los componentes ShadCN (Card, Input, Button, Select) se ven correctamente sobre fondo oscuro

---

## Fase B — ThemeProvider: hook + contexto en `main.tsx`

### B.1 `frontend/src/shared/hooks/useTheme.ts` (NUEVO)

```ts
import { createContext, useContext } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
    theme: "light",
    toggleTheme: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}
```

### B.2 `frontend/src/main.tsx` (EDITAR)

Añadir `ThemeProvider` inline (sin archivo extra) que:

1. Lee `localStorage.getItem("access-control-theme")` al inicializar
2. Aplica `document.documentElement.classList.toggle("dark", theme === "dark")`
3. Persiste en `localStorage` en cada toggle

```tsx
import { useState, useEffect } from "react";
import { ThemeContext, type Theme } from "@/shared/hooks/useTheme";

// Dentro de createRoot(...).render():
function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        return (
            (localStorage.getItem("access-control-theme") as Theme) ?? "light"
        );
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("access-control-theme", theme);
    }, [theme]);

    const toggleTheme = () =>
        setTheme((t) => (t === "light" ? "dark" : "light"));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Envolver <App /> con <ThemeProvider>
```

### Verificación Fase B

- `npm run build` → 0 errores
- En consola del browser: `localStorage.getItem("access-control-theme")` devuelve `"light"` o `"dark"`
- `document.documentElement.classList` contiene `"dark"` cuando corresponde

---

## Fase C — Toggle Moon/Sun en `MainLayout.tsx`

### Archivo

`frontend/src/layouts/MainLayout.tsx`

### Cambios

1. Importar `useTheme` + íconos `Sun`, `Moon` de lucide
2. En el topbar, añadir botón **antes** del botón de logout:

```tsx
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/shared/hooks/useTheme";

// Dentro del componente:
const { theme, toggleTheme } = useTheme();

// En el header, antes de <Button variant="ghost"...logout...>:
<Button variant="ghost" size="icon" onClick={toggleTheme} title="Cambiar tema">
    {theme === "dark" ? (
        <Sun className="h-4 w-4" />
    ) : (
        <Moon className="h-4 w-4" />
    )}
</Button>;
```

### Verificación Fase C

- Botón visible en el topbar (esquina superior derecha, junto a logout)
- Click alterna entre Sun y Moon
- La clase `.dark` se aplica/retira del `<html>` en tiempo real
- Tocar F5 mantiene el tema elegido (localStorage)

---

## Fase D — Adaptar hex hardcodeados en `DashboardPage.tsx`

### Archivo

`frontend/src/features/dashboard/DashboardPage.tsx`

### Problema

Las clases `bg-[#DBEAFE]`, `border-[#2563EB]`, `text-[#2563EB]`, `text-[#6B7280]` y el `style={{ color: "#2563EB" }}` son fijos y no responden al modo oscuro. En dark mode, `#DBEAFE` (azul blanquecino) sobre `#1E293B` (slate dark) genera contraste pobre.

### Equivalencias dark mode

| Clase light (actual)        | Clase dark a añadir     | Resultado en dark                |
| --------------------------- | ----------------------- | -------------------------------- |
| `border-[#2563EB]`          | `dark:border-blue-500`  | Azul medio visible sobre oscuro  |
| `bg-[#DBEAFE]`              | `dark:bg-blue-900/40`   | Azul muy oscuro semitransparente |
| `border-b border-[#E5E7EB]` | `dark:border-slate-700` | Separador oscuro                 |
| `text-[#2563EB]`            | `dark:text-blue-400`    | Azul claro legible sobre oscuro  |
| `text-[#6B7280]`            | `dark:text-slate-400`   | Gris claro descriptivo           |

### Cambio en el `colorHex` inline style

El `style={{ color: colorHex }}` no puede usar `dark:`. Solución: reemplazar por clase Tailwind:

```tsx
// ANTES
<p className="text-4xl font-bold mt-1" style={{ color: colorHex }}>
    {value}
</p>

// DESPUÉS (sin inline style)
<p className="text-4xl font-bold mt-1 text-[#2563EB] dark:text-blue-400">
    {value}
</p>
```

Y eliminar `colorHex` del array `kpis` (ya no se necesita).

### Patrón a aplicar en cada Card (KPI + tablas + reservas)

```tsx
// KPI Card — antes
className =
    "border-t-2 border-[#2563EB] shadow-[...] hover:... transition-all duration-200";

// KPI Card — después
className =
    "border-t-2 border-[#2563EB] dark:border-blue-500 shadow-[...] hover:... transition-all duration-200";

// CardHeader — antes
className = "rounded-t-xl px-4 pb-3 bg-[#DBEAFE] border-b border-[#E5E7EB]";

// CardHeader — después
className =
    "rounded-t-xl px-4 pb-3 bg-[#DBEAFE] dark:bg-blue-900/40 border-b border-[#E5E7EB] dark:border-slate-700";

// CardTitle — antes
className = "text-base font-semibold text-[#2563EB]";

// CardTitle — después
className = "text-base font-semibold text-[#2563EB] dark:text-blue-400";

// KPI subtitle — antes
className = "text-sm text-[#6B7280]";

// KPI subtitle — después
className = "text-sm text-[#6B7280] dark:text-slate-400";
```

### Verificación Fase D

- `npm run build` → 0 errores
- Toggle dark en topbar → Dashboard cambia correctamente
- KPI numbers legibles, headers con fondo oscuro azulado, títulos en azul claro
- Resto de páginas (Visitas, Paquetes, etc.) responden correctamente vía variables CSS (no tienen hex fijos)

---

## Archivos a crear / editar — resumen

### Frontend (1 nuevo + 3 editados)

```
frontend/src/
  shared/hooks/useTheme.ts                    ← NUEVO
  main.tsx                                    ← EDITAR (ThemeProvider inline)
  layouts/MainLayout.tsx                      ← EDITAR (toggle Sun/Moon)
  features/dashboard/DashboardPage.tsx        ← EDITAR (dark: variants)
```

---

## Verificación final end-to-end

- [ ] `npm run build` → 0 errores
- [ ] Modo light: idéntico al aprobado (paleta `#2563EB`)
- [ ] Modo dark: fondo `#0F172A`, cards `#1E293B`, primario `#3B82F6`, headers `blue-900/40`
- [ ] Toggle persiste al recargar (F5)
- [ ] Sidebar: texto y fondo correctos en ambos modos (vía CSS variables — sin cambios extra)
- [ ] Componentes ShadCN (Dialog, Select, Badge, Input): automáticos vía variables CSS
- [ ] `DashboardPage.tsx`: sin contraste roto en dark mode
