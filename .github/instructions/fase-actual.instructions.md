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

### Fase 2 — Frontend React + TypeScript

- [x] **2.1 Setup inicial** — Vite 8 + React 19 + TS 6 + TailwindCSS v4 + ShadCN UI (Radix/Nova). Path alias `@/*`. Build: 0 errores.
- [x] **2.2 Infraestructura base** — Axios (interceptores JWT/401), Zustand authStore (persist localStorage), TanStack Query (QueryClient), React Router (BrowserRouter), ProtectedRoute, MainLayout (sidebar + topbar), AppRouter. Build: 0 errores.
- [x] **2.3 Autenticación** — authService (POST /api/auth/login), LoginPage (RHF + Zod, toggle password, spinner, toast), guard de ruta, prueba e2e exitosa admin/Admin123!. Build: 0 errores.
- [x] **2.4 Módulo Visitas** — tipos TS (`VehicleTypeEnum` const-object, `VisitResponse`, `CreateVisitRequest`, `CheckOutRequest`), visitService + destinationService + representativeService, hooks TanStack Query (useVisits, useVisitByDocument, useCreateVisit, useCheckOut, useDestinations, useRepresentativesByDestination), VisitsPage (tabla paginada, filtros fecha/documento/nombre, contadores), CreateVisitDialog (RHF+Zod, destino→representante dinámico, vehículo condicional), CheckOutDialog (búsqueda por documento, preview, confirmación). ShadCN: dialog, badge, select, label, input. Build: 0 errores.
- [x] **2.4.1 Captura de imágenes en visitas** ✅ COMPLETADA — CameraCapture.tsx (shared, reutilizable), Photo2 en backend (Command+Handler), CreateVisitDialog integrado con 2 fotos (foto1 obligatoria, foto2 opcional). Fix VisitRepository: override GetByIdAsync + ThenInclude(Destination) en todos los métodos. GenericRepository: GetByIdAsync virtual. Build: 0 errores.
- [x] **2.5 Módulo Paquetes** — listado, registrar paquete (con foto + firma al recibir), entregar (con firma del receptor)
- [x] **2.6 Módulo Dashboard** — 4 KPIs (visitas hoy, activas, paquetes hoy, pendientes), tabla visitas recientes del día, tabla paquetes pendientes. Card de ShadCN instalado. Build: 0 errores.
- [ ] **2.7 Módulo Usuarios** — CRUD usuarios (solo admin)
- [ ] **2.8 Módulo Destinatarios y Representantes**
- [ ] **2.9 PWA + optimizaciones finales**

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
