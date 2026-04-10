---
name: "Fase Actual"
description: "Estado actual de la modernización y contexto de trabajo inmediato"
applyTo: "**/*"
---

> ⚠️ Este archivo define el contexto de trabajo actual. Leerlo antes de ejecutar cualquier tarea.

---

name: 'Fase Actual'
description: 'Estado actual de la modernización y contexto de trabajo inmediato'
applyTo: '\*_/_'

---

> ⚠️ Este archivo define el contexto de trabajo actual. Leerlo antes de ejecutar cualquier tarea.

## Fase actual: Fase 2 — Frontend React + TypeScript

**Objetivo:** SPA React moderna que consuma la API REST y reemplace la UI WPF legada  
**Stack:** Vite 8 + React 19 + TypeScript 6 + TailwindCSS v4 + ShadCN UI

---

## Estado de subfases

### Fase 1 — Backend API (.NET 9) ✅ COMPLETADA

- [x] **1.1** Setup Clean Architecture
- [x] **1.2** Migración de entidades
- [x] **1.3** Infrastructure Layer (EF Core 9 + Pomelo, 10 configuraciones, repos, UoW)
- [x] **1.4** Application Layer CQRS (32 casos de uso, MediatR, FluentValidation, Mapperly)
- [x] **1.5** API Controllers (9 controllers, 32 endpoints, middleware)
- [x] **1.6** JWT Authentication (HS256, BCrypt, [Authorize])
- [x] **1.7** Testing (57/57 tests — Domain: 33, Application: 20, Integration: 4)
- [x] **1.8** Documentación y Deploy (README, Dockerfile, docker-compose)
- [x] **1.9 Limpieza arquitectural** — Eliminadas entidades `Authorization` y `Menu` (RBAC legacy WPF). 21 archivos eliminados (entidades, interfaces, repos, configs EF, mappers Mapperly, features CQRS, controllers). 5 archivos editados (Role, IUnitOfWork, UnitOfWork, DependencyInjection, AppDbContext). Migración `RemoveAuthorizationsAndMenus` aplicada a BD. Tests: 57/57 pasando (Domain: 32, Application: 19, Integration: 6). Build: 0 errores.

### Fase 2 — Frontend React + TypeScript

- [x] **2.1 Setup inicial** — Vite 8 + React 19 + TS 6 + TailwindCSS v4 + ShadCN UI (Radix/Nova). Path alias `@/*`. Build: 0 errores.
- [x] **2.2 Infraestructura base** — Axios (interceptores JWT/401), Zustand authStore (persist localStorage), TanStack Query (QueryClient), React Router (BrowserRouter), ProtectedRoute, MainLayout (sidebar + topbar), AppRouter. Build: 0 errores.
- [x] **2.3 Autenticación** — authService (POST /api/auth/login), LoginPage (RHF + Zod, toggle password, spinner, toast), guard de ruta, prueba e2e exitosa admin/Admin123!. Build: 0 errores.
- [x] **2.4 Módulo Visitas** — tipos TS (`VehicleTypeEnum` const-object, `VisitResponse`, `CreateVisitRequest`, `CheckOutRequest`), visitService + destinationService + representativeService, hooks TanStack Query (useVisits, useVisitByDocument, useCreateVisit, useCheckOut, useDestinations, useRepresentativesByDestination), VisitsPage (tabla paginada, filtros fecha/documento/nombre, contadores), CreateVisitDialog (RHF+Zod, destino→representante dinámico, vehículo condicional), CheckOutDialog (búsqueda por documento, preview, confirmación). ShadCN: dialog, badge, select, label, input. Build: 0 errores.
- [x] **2.4.1 Captura de imágenes en visitas** ✅ COMPLETADA — CameraCapture.tsx (shared, reutilizable), Photo2 en backend (Command+Handler), CreateVisitDialog integrado con 2 fotos (foto1 obligatoria, foto2 opcional). Fix VisitRepository: override GetByIdAsync + ThenInclude(Destination) en todos los métodos. GenericRepository: GetByIdAsync virtual. Build: 0 errores.
- [x] **2.5 Módulo Paquetes** — listado, registrar paquete (con foto + firma al recibir), entregar (con firma del receptor)
- [x] **2.6 Módulo Dashboard** — 4 KPIs (visitas hoy, activas, paquetes hoy, pendientes), tabla visitas recientes del día, tabla paquetes pendientes. Card de ShadCN instalado. Build: 0 errores.
- [x] **2.7 Módulo Usuarios** — CRUD usuarios (solo admin). Tipos, service, hooks, UsersPage, CreateUserDialog, EditUserDialog. Sidebar condicional (solo admin). Fix backend: `GenericRepository.GetAllAsync` → `virtual`; `UserRepository` override con `.Include(u => u.Role)`. Build: 0 errores.
- [x] **2.8 Módulo Destinatarios y Representantes** — Tipos, services, hooks TanStack Query. DestinationsPage (tabla + crear/eliminar). RepresentativesPage (filtro por destinatario, CRUD completo). CreateRepresentativeDialog + EditRepresentativeDialog con sección condicional de vehículo. MainLayout: Building2/ContactRound, rutas solo admin. Build: 0 errores.
- [x] **2.9 PWA + optimizaciones finales** — `vite-plugin-pwa` (manifest, Workbox NetworkFirst/CacheFirst, SW autoUpdate), favicon SVG candado (#5B8DEF), lazy loading de rutas (React.lazy + Suspense + PageLoader), NotFoundPage (404 con ShieldAlert), ErrorBoundary global (ShieldX), `index.html` lang=es + theme-color + meta description + título "Access Control". Build: 0 errores. `dist/sw.js` + `dist/workbox-*.js` generados.
- [x] **2.10.A Paleta Neo Gradient** — Cambio de paleta de colores en `index.css` (variables CSS ShadCN). Solo frontend, sin cambios de lógica.
- [ ] **2.11 Módulo de Reportes** — 5 informes descargables en PDF. R1–R4 visibles para todos los roles; R5 solo admin. Requiere 1 endpoint nuevo en backend (`GET /api/reports/summary`). Librería: `@react-pdf/renderer`. Ver notas técnicas al final de este archivo.

### Nota sobre autorización en la arquitectura moderna

- El sistema de permisos granulares CRUD por menú (tabla `Authorizations` + `Menus`) era exclusivo del WPF legado
- En la arquitectura moderna se usa: JWT Bearer (`[Authorize]` global) + `roleName` en frontend para visibilidad condicional de módulos
- No hay permisos por operación (crear/editar/eliminar) por rol — diseño intencional

---

## Notas técnicas relevantes

### Backend

- API en `http://localhost:5192` (perfil `http` de launchSettings.json)
- Seed: `admin` / `Admin123!`
- `LoginResponse` devuelve: `userId, userAccount, name, roleId, roleName, token, expiration`
- JWT Bearer, `[AllowAnonymous]` solo en `AuthController`

### Frontend (`frontend/`)

- Dev server: `npx vite` → `http://localhost:5174`
- Build: `npm run build`
- TailwindCSS v4 via `@tailwindcss/vite` (sin postcss.config)
- `ignoreDeprecations: "6.0"` en tsconfig para `baseUrl` (TS6)
- ShadCN: `components.json` estilo `radix-nova`, iconos `lucide`
- Zustand key en localStorage: `access-control-auth`
- `AuthUser`: `{ userId, name, userAccount, roleName }` (campo `name`, no `userName`)

### Ajuste completado: 2.4.1 — Captura de imágenes ✅

- Fotos transmitidas como **base64 puro** en JSON body
- `Photo` obligatoria, `Photo2` opcional
- `CameraCapture` en `shared/components/` — reutilizable (paquetes, etc.)
- Backend: `GenericRepository.GetByIdAsync` virtual; `VisitRepository` override con ThenInclude(Destination)

### Fix global: DateTime.UtcNow → DateTime.Now ✅

- `CheckIn`, `CheckOut` (Visits), `ReceivedDate`, `DeliveryDate` (Packages) usan `DateTime.Now`
- Razón: Colombia es UTC-5; con UtcNow los registros caían en el día siguiente en la BD y el filtro de fecha del frontend (hora local) nunca los encontraba
- Fix aplicado en: `CreateVisitCommandHandler`, `CheckOutVisitCommandHandler`, `CreatePackageCommandHandler`, `PackageRepository.DeliverPackageAsync`

### Notas para subfase 2.6 — Dashboard ✅

- `DashboardPage.tsx` en `features/dashboard/`
- Reutiliza `useVisits`, `usePackages`, `usePendingPackages` — sin endpoints nuevos
- Fechas calculadas con `date-fns`: `startOfDay/endOfDay` → filtro hoy
- Clases Tailwind: usar utilitarios (`max-w-35`, `max-w-30`) en lugar de valores arbitrarios

### Notas para subfase 2.7 — Usuarios

**Endpoints backend disponibles:**

- `GET /api/users` → `UserResponse[]`
- `GET /api/users/{id}` → `UserResponse`
- `POST /api/users` → body: `{ userAccount, password, name, roleId, userCreated }`
- `PUT /api/users/{id}` → body: `{ id, name, roleId, visible, userModified }`
- `DELETE /api/users/{id}` → no puede eliminarse a sí mismo (backend valida con `CurrentUserId`)
- `GET /api/roles` → `RoleResponse[]` (para selector en formularios)

**DTOs backend:**

- `UserResponse`: `{ id, userAccount, name, roleId, roleName, visible }`
- `RoleResponse`: `{ id, name, visible }`

**Archivos frontend a crear:**

- `features/users/types/user.types.ts`
- `features/users/api/userService.ts`
- `features/users/hooks/useUsers.ts`
- `features/users/UsersPage.tsx`
- `features/users/components/CreateUserDialog.tsx`
- `features/users/components/EditUserDialog.tsx`

**Reglas de negocio:**

- Solo visible en sidebar si `roleName` incluye "Admin" (case-insensitive)
- Al editar: campos `name`, `roleId`, `visible` — sin `password`
- Al eliminar: el usuario no puede eliminarse a sí mismo (validado también en frontend)
- `userCreated` / `userModified` → `userId` del `authStore`

**Bugs resueltos en 2.7:**

- `z.coerce.number()` incompatible con resolver RHF → usar `z.number()` + cast manual `Number(v)` en `onChange`
- `RolesController`/`UsersController` retornan `Ok(result.Value)` (dato crudo) → frontend accede `response.data` directamente (sin `.value`)
- `GenericRepository.GetAllAsync` sin `virtual` → `UserRepository` no podía hacer override → NullRef en Mapperly (`user.Role.Name`) → 500. Fix: añadir `virtual` a `GetAllAsync` en `GenericRepository`

**Patrón crítico — respuestas del API:**

- `VisitsController` / `PackagesController` → `Ok(result)` → JSON: `{ isSuccess, value, error }` → frontend: `response.data.value`
- `UsersController` / `RolesController` / `DestinationsController` / `RepresentativesController` → `Ok(result.Value)` → JSON: dato crudo → frontend: `response.data`

**Patrón crítico — NullRef en Mapperly:**

Cada vez que un mapper accede a una navigation property (`entity.NavProp.Field`) y el repositorio genérico no la incluye con `.Include()`, lanza NullReferenceException → 500. Fix: override del método en el repositorio específico con `.Include()`. Ya aplicado en: `VisitRepository`, `PackageRepository`, `UserRepository`.

### Notas para subfase 2.8 — Destinatarios y Representantes

**Endpoints backend disponibles:**

- `GET /api/destinations` → `DestinationResponse[]`
- `GET /api/destinations/{id}` → `DestinationResponse`
- `POST /api/destinations` → body: `{ name, userCreated }`
- `PUT /api/destinations/{id}` → body: `{ id, name, visible, userModified }`
- `DELETE /api/destinations/{id}`
- `GET /api/representatives` → `RepresentativeResponse[]`
- `GET /api/representatives/{id}` → `RepresentativeResponse`
- `GET /api/representatives/by-destination/{destinationId}` → `RepresentativeResponse[]`
- `POST /api/representatives` → body: `{ name, destinationId, userCreated }`
- `PUT /api/representatives/{id}` → body: `{ id, name, destinationId, visible, userModified }`
- `DELETE /api/representatives/{id}`

**Archivos frontend a crear:**

- `features/destinations/types/destination.types.ts`
- `features/destinations/api/destinationService.ts` (extender el existente en `visits/api/`)
- `features/destinations/hooks/useDestinations.ts`
- `features/destinations/DestinationsPage.tsx`
- `features/destinations/components/CreateDestinationDialog.tsx`
- `features/destinations/components/EditDestinationDialog.tsx`
- `features/representatives/types/representative.types.ts`
- `features/representatives/api/representativeService.ts`
- `features/representatives/hooks/useRepresentatives.ts`
- `features/representatives/RepresentativesPage.tsx`
- `features/representatives/components/CreateRepresentativeDialog.tsx`
- `features/representatives/components/EditRepresentativeDialog.tsx`

**Reglas de negocio:**

- Destinatarios y Representantes visibles solo para admin en el sidebar
- Un representante pertenece a un destinatario (`destinationId`)
- Al crear/editar representante: select de destinatarios activos
- `userCreated` / `userModified` → `userId` del `authStore`

### Notas para subfase 2.10.A — Paleta Neo Gradient

**Archivo a editar:** `frontend/src/index.css` — solo las variables CSS del bloque `:root` (modo claro).

**Paleta completa — variables ShadCN → valores Neo Gradient:**

| Variable                       | Valor     |
| ------------------------------ | --------- |
| `--background`                 | `#F4F7FC` |
| `--foreground`                 | `#1F2937` |
| `--card`                       | `#FFFFFF` |
| `--card-foreground`            | `#1F2937` |
| `--primary`                    | `#5B8DEF` |
| `--primary-foreground`         | `#FFFFFF` |
| `--secondary`                  | `#EEF2FB` |
| `--secondary-foreground`       | `#1F2937` |
| `--muted`                      | `#EEF2FB` |
| `--muted-foreground`           | `#6B7280` |
| `--accent`                     | `#A78BFA` |
| `--accent-foreground`          | `#FFFFFF` |
| `--destructive`                | `#EF4444` |
| `--border`                     | `#D9E4F5` |
| `--input`                      | `#D9E4F5` |
| `--ring`                       | `#5B8DEF` |
| `--sidebar`                    | `#FFFFFF` |
| `--sidebar-foreground`         | `#1F2937` |
| `--sidebar-primary`            | `#5B8DEF` |
| `--sidebar-primary-foreground` | `#FFFFFF` |
| `--sidebar-accent`             | `#EEF2FB` |
| `--sidebar-accent-foreground`  | `#5B8DEF` |
| `--sidebar-border`             | `#D9E4F5` |
| `--sidebar-ring`               | `#5B8DEF` |

**Notas técnicas:**

- TailwindCSS v4 acepta hex directo en variables CSS — sin necesidad de convertir a oklch ni HSL
- El modo oscuro (`.dark`) no se modifica en esta subfase — queda pendiente
- Verificar build `npm run build` tras el cambio

### Notas para subfase 2.11 — Módulo de Reportes

**Informe R1 — Visitas por período**

- Reutiliza: `GET /api/visits?startDate&endDate`
- Columnas PDF: N°, Fecha, Documento, Nombre, Destino, Representante, Entrada, Salida
- Visible: todos los roles

**Informe R2 — Visitas con vehículo**

- Reutiliza: `GET /api/visits?startDate&endDate` filtrado `hasVehicle === true`
- Columnas PDF: N°, Fecha, Nombre, Tipo vehículo, Marca, Modelo, Color, Placa
- Visible: todos los roles

**Informe R3 — Paquetes pendientes**

- Reutiliza: `GET /api/packages/pending`
- Columnas PDF: N°, Control, Remitente, Empresa, Tracking, Destinatario, Representante, F. Recepción
- Visible: todos los roles

**Informe R4 — Historial de paquetes**

- Reutiliza: `GET /api/packages?startDate&endDate`
- Columnas PDF: N°, Control, Remitente, Estado, Destinatario, F. Recepción, F. Entrega, Recibido por
- Visible: todos los roles

**Informe R5 — Resumen ejecutivo** _(solo admin)_

- Requiere: `GET /api/reports/summary?startDate&endDate` ← **endpoint nuevo**
- DTO respuesta: `ActivitySummaryResponse { TotalVisits, ActiveVisits, VisitsWithVehicle, TotalPackages, PendingPackages, DeliveredPackages, PeriodStart, PeriodEnd }`
- Contenido PDF: tarjetas de KPIs + tabla de distribución
- Visible: solo `roleName.toLowerCase().includes("admin")`

**Endpoint nuevo a crear — backend:**

- Ruta: `GET /api/reports/summary?startDate={date}&endDate={date}`
- Controlador: `ReportsController`
- Query: `GetActivitySummaryQuery` + handler
- DTO: `ActivitySummaryResponse`
- Patrón de respuesta: `Ok(result.Value)` (dato crudo, igual que Users/Roles)

**Estructura de archivos a crear — backend:**

```
src/AccessControl.Application/Features/Reports/
  Queries/GetActivitySummary/
    GetActivitySummaryQuery.cs
    GetActivitySummaryQueryHandler.cs
    ActivitySummaryResponse.cs
src/AccessControl.API/Controllers/
  ReportsController.cs
```

**Estructura de archivos a crear — frontend:**

```
frontend/src/features/reports/
  types/report.types.ts
  api/reportService.ts
  hooks/useReports.ts
  pdf/
    ReportLayout.tsx       ← template compartido (header, footer, estilos)
    VisitsPdf.tsx          ← R1
    VehicleVisitsPdf.tsx   ← R2
    PendingPackagesPdf.tsx ← R3
    PackagesHistoryPdf.tsx ← R4
    ActivitySummaryPdf.tsx ← R5 (solo admin)
  components/
    ReportFilters.tsx      ← filtros de fecha + selector de informe
  ReportsPage.tsx
```

**Reglas de implementación:**

- `@react-pdf/renderer` instalar con `--legacy-peer-deps` (por Vite 8)
- Fotos de visitantes → **excluidas del PDF** — solo datos textuales
- PDF se genera y descarga en el cliente (sin endpoint de descarga en backend)
- Fecha formateada: `dd/MM/yyyy HH:mm` (Colombia, fecha local)
- Ruta: `/reports` — lazy loading en AppRouter
- Sidebar: ícono `FileBarChart2` de lucide, visible para **todos los roles**
- R5 tab: oculto condicionalmente con `roleName.toLowerCase().includes("admin")`
- Filtros de fecha usando `<input type="date">` nativo (sin date-picker adicional)

**Patrón de descarga PDF:**

```tsx
import { pdf } from "@react-pdf/renderer";
const blob = await pdf(<ComponentePdf data={data} />).toBlob();
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "reporte.pdf";
a.click();
URL.revokeObjectURL(url);
```

**Bugs conocidos / consideraciones @react-pdf/renderer:**

- No soporta clases Tailwind — usar objetos `StyleSheet.create({})` con propiedades camelCase
- Componentes disponibles: `Document`, `Page`, `View`, `Text`, `StyleSheet`
- No usar componentes HTML (`div`, `span`, `table`) dentro de documentos PDF
- `Font.register()` necesario si se quieren fuentes personalizadas (opcional — usar fuentes por defecto)
- El hook `usePDF()` es alternativa a `pdf().toBlob()` para previsualización inline

**Decisiones confirmadas:**

- R1, R2, R3, R4 → visibles para **todos los roles** (portero + admin)
- R5 Resumen Ejecutivo → solo **admin**
- PDF generado en cliente con `@react-pdf/renderer`
- Sidebar ítem `/reports` visible para todos los roles
