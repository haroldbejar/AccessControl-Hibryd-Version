---
name: "Módulo Reservas de Zonas Comunes"
description: "Plan detallado de implementación del módulo de reservas dividido por fases."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de implementación del módulo Reservas. Leerlo antes de ejecutar cualquier tarea relacionada con este módulo.

## Propósito del módulo

Gestión de reservas de zonas comunes (salón comunal, BBQ, zona de juegos, etc.) en copropiedades.

- El **admin** crea y gestiona zonas; confirma y completa reservas.
- El **portero** crea reservas en nombre de residentes.
- Vista principal: grilla de disponibilidad por zona y fecha.

---

## Decisiones de diseño confirmadas

| Decisión             | Valor                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| Granularidad grilla  | 1 hora; reservas abarcan N celdas (estilo Google Calendar)                    |
| Zonas en grilla      | Select de zona — una a la vez, sin scroll horizontal                          |
| Vistas               | Toggle Grilla ↔ Lista (no simultáneas); Grilla es la default                  |
| Estados              | Pending → Confirmed → Completed (manual admin); Cancelled: cualquier rol      |
| Inicio de reservas   | Siempre en `Pending`                                                          |
| Solapamiento         | `existing.Start < newEnd AND existing.End > newStart AND Status != Cancelled` |
| Tipos C#             | `TimeOnly` / `DateOnly` → MySQL `TIME` / `DATE`                               |
| Tiempos en frontend  | Strings `"HH:mm"` en JSON                                                     |
| Patrón respuesta API | `Ok(result.Value)` → `response.data` (dato crudo, igual que UsersController)  |
| Acceso visibilidad   | Sidebar "Reservas": todos los roles; "Zonas comunes": solo admin              |

---

## Estado de implementación

- [x] **Fase A** — Domain: entidades, enums, interfaces de repositorio, IUnitOfWork ✅ Build: 0 errores
- [ ] **Fase B** — Infrastructure: EF Core configs, repositorios, migración, DI
- [ ] **Fase C** — Application CQRS: DTOs, commands, queries, validators
- [ ] **Fase D** — API Controllers (2 controllers, 11 endpoints)
- [ ] **Fase E** — Frontend base: tipos, services, hooks
- [ ] **Fase F** — Frontend UI: páginas y componentes

---

## Fase A — Domain

### A.1 Enum nuevo

**`src/AccessControl.Domain/Enums/ReservationStatusEnum.cs`**

```csharp
public enum ReservationStatusEnum
{
    Pending = 1,
    Confirmed = 2,
    Cancelled = 3,
    Completed = 4
}
```

### A.2 Entidad `CommonArea` : BaseEntity

**`src/AccessControl.Domain/Entities/CommonArea.cs`**

- `Name` — string, MaxLength(100), Required, índice único
- `Description` — string?, MaxLength(500)
- `Capacity` — int? (personas máximas)
- `Location` — string?, MaxLength(200) (ej: "Piso 1, Torre B")
- `OpeningTime` — TimeOnly (hora apertura)
- `ClosingTime` — TimeOnly (hora cierre)
- Nav: `ICollection<Reservation> Reservations`
- [NotMapped] `bool IsAvailable => !Eliminated`

### A.3 Entidad `Reservation` : BaseEntity

**`src/AccessControl.Domain/Entities/Reservation.cs`**

- `CommonAreaId` — int, FK
- `DestinationId` — int, FK
- `RepresentativeId` — int, FK
- `ReservationDate` — DateOnly (MySQL DATE)
- `StartTime` — TimeOnly (MySQL TIME)
- `EndTime` — TimeOnly (MySQL TIME)
- `Status` — ReservationStatusEnum, default Pending
- `Notes` — string?, MaxLength(500)
- `CancellationReason` — string?, MaxLength(500)
- Nav: `CommonArea`, `Destination`, `Representative`
- [NotMapped] `string StatusDescription` — switch sobre Status

### A.4 Interfaces de repositorio

**`src/AccessControl.Domain/Interfaces/ICommonAreaRepository.cs`**

- Extiende `IRepository<CommonArea>` (sin métodos adicionales)

**`src/AccessControl.Domain/Interfaces/IReservationRepository.cs`**

- Extiende `IRepository<Reservation>`
- `Task<IEnumerable<Reservation>> GetAllFilteredAsync(DateOnly? date, int? commonAreaId, ReservationStatusEnum? status)`
- `Task<IEnumerable<Reservation>> GetByDateAndAreaAsync(DateOnly date, int commonAreaId)`
- `Task<bool> HasOverlapAsync(int commonAreaId, DateOnly date, TimeOnly start, TimeOnly end, int? excludeId = null)`

### A.5 Editar `IUnitOfWork`

- Agregar: `ICommonAreaRepository CommonAreas { get; }`
- Agregar: `IReservationRepository Reservations { get; }`

---

## Fase B — Infrastructure

### B.1 `CommonAreaConfiguration.cs`

- Tabla: `CommonAreas`
- `Name`: required, MaxLength(100), índice único
- `OpeningTime` / `ClosingTime`: `HasColumnType("time")`

### B.2 `ReservationConfiguration.cs`

- Tabla: `Reservations`
- FK `CommonAreaId` → DeleteBehavior.Restrict
- FK `DestinationId` → DeleteBehavior.Restrict
- FK `RepresentativeId` → DeleteBehavior.Restrict
- `ReservationDate`: `HasColumnType("date")`
- `StartTime` / `EndTime`: `HasColumnType("time")`
- `Status`: int en BD
- Índice compuesto: `(CommonAreaId, ReservationDate)`

### B.3 `CommonAreaRepository.cs`

- Override `GetAllAsync`: filtra `!x.Eliminated`

### B.4 `ReservationRepository.cs`

- Override `GetAllAsync`: `.Include(r => r.CommonArea).Include(r => r.Destination).Include(r => r.Representative)`
- Implementa `GetAllFilteredAsync` con filtros opcionales
- Implementa `GetByDateAndAreaAsync`
- Implementa `HasOverlapAsync` con `AnyAsync`:
    ```csharp
    existing.StartTime < end && existing.EndTime > start
    && existing.Status != ReservationStatusEnum.Cancelled
    && (excludeId == null || existing.Id != excludeId)
    ```

### B.5 Editar: AppDbContext, UnitOfWork, DependencyInjection

- `AppDbContext`: agregar `DbSet<CommonArea>` y `DbSet<Reservation>`
- `UnitOfWork`: implementar `CommonAreas` y `Reservations`
- `DependencyInjection`: registrar repos e interfaces

### B.6 Migración

```
dotnet ef migrations add AddReservationsModule --project src/AccessControl.Infrastucture --startup-project src/AccessControl.API
dotnet ef database update --project src/AccessControl.Infrastucture --startup-project src/AccessControl.API
```

---

## Fase C — Application CQRS

### DTOs (en `Features/Reservations/` o `Features/CommonAreas/`)

**`CommonAreaResponse`**: `Id, Name, Description, Capacity, Location, OpeningTime ("HH:mm"), ClosingTime ("HH:mm"), Visible`

**`ReservationResponse`**: `Id, CommonAreaId, CommonAreaName, DestinationId, DestinationName, RepresentativeId, RepresentativeName, ReservationDate ("yyyy-MM-dd"), StartTime ("HH:mm"), EndTime ("HH:mm"), Status (int), StatusDescription, Notes, CancellationReason, CreatedDate`

**`AvailabilitySlot`**: `StartTime ("HH:mm"), EndTime ("HH:mm"), IsFree, ReservationId?, RepresentativeName?, DestinationName?, Status?`

**`AvailabilityResponse`**: `CommonAreaId, CommonAreaName, Date ("yyyy-MM-dd"), OpeningTime ("HH:mm"), ClosingTime ("HH:mm"), Slots (AvailabilitySlot[])`

### CommonArea Commands/Queries (5)

- `CreateCommonAreaCommand` + Validator: Name required, OpeningTime < ClosingTime
- `UpdateCommonAreaCommand` + Validator: mismo
- `DeleteCommonAreaCommand` → verificar sin reservas activas (Pending/Confirmed)
- `GetAllCommonAreasQuery`
- `GetCommonAreaByIdQuery`

### Reservation Commands/Queries (6)

- `CreateReservationCommand` + Validator:
    1. StartTime < EndTime
    2. ReservationDate >= DateOnly.FromDateTime(DateTime.Today)
    3. StartTime >= zona.OpeningTime AND EndTime <= zona.ClosingTime
    4. `HasOverlapAsync()` → fallar si true
- `CancelReservationCommand` (requiere `CancellationReason`, solo si Pending o Confirmed)
- `ConfirmReservationCommand` (solo admin, solo si Pending) ← **agregar en Fase C y D**
- `CompleteReservationCommand` (solo admin, solo si Confirmed) ← **agregar en Fase C y D**
- `GetAllReservationsQuery(date?, commonAreaId?, status?)`
- `GetAvailabilityQuery(commonAreaId, date)` → genera slots de 1h entre OpeningTime y ClosingTime, marcando IsFree/ocupado

---

## Fase D — API Controllers

### `CommonAreasController`

| Método | Ruta                     | Auth  |
| ------ | ------------------------ | ----- |
| GET    | `/api/common-areas`      | Todos |
| GET    | `/api/common-areas/{id}` | Todos |
| POST   | `/api/common-areas`      | Admin |
| PUT    | `/api/common-areas/{id}` | Admin |
| DELETE | `/api/common-areas/{id}` | Admin |

### `ReservationsController`

| Método | Ruta                                                                  | Auth  |
| ------ | --------------------------------------------------------------------- | ----- |
| GET    | `/api/reservations?date&commonAreaId&status`                          | Todos |
| GET    | `/api/reservations/availability?commonAreaId={int}&date={yyyy-MM-dd}` | Todos |
| POST   | `/api/reservations`                                                   | Todos |
| PATCH  | `/api/reservations/{id}/cancel`                                       | Todos |
| PATCH  | `/api/reservations/{id}/confirm`                                      | Admin |
| PATCH  | `/api/reservations/{id}/complete`                                     | Admin |

**Patrón de respuesta:** `Ok(result.Value)` → frontend accede `response.data`

---

## Fase E — Frontend base

### Tipos (`frontend/src/features/reservations/types/reservation.types.ts`)

- `ReservationStatusEnum` como const-object: `{ Pending: 1, Confirmed: 2, Cancelled: 3, Completed: 4 }`
- `reservationStatusLabels`: mapa `id → string` en español
- `reservationStatusColors`: mapa `id → clase badge` (badge-yellow, badge-green, etc.)
- `CommonAreaResponse`, `ReservationResponse`, `AvailabilitySlot`, `AvailabilityResponse`
- `CreateReservationRequest`, `CancelReservationRequest`

### Services

- `commonAreaService.ts`: `getAll`, `getById`, `create`, `update`, `remove`
- `reservationService.ts`: `getAll(filters?)`, `getAvailability(commonAreaId, date)`, `create`, `cancel`, `confirm`, `complete`

### Hooks

- `useCommonAreas.ts`: `useCommonAreas()`, `useCreateCommonArea()`, `useUpdateCommonArea()`, `useDeleteCommonArea()`; staleTime 5min; invalida `["common-areas"]`
- `useReservations.ts`: `useReservations(filters?)`, `useAvailability(commonAreaId, date)`, `useCreateReservation()`, `useCancelReservation()`, `useConfirmReservation()`, `useCompleteReservation()`; staleTime 30s; invalida `["reservations"]` y `["availability"]`

---

## Fase F — Frontend UI

### `CommonAreasPage.tsx` (solo admin)

- Ruta: `/common-areas`
- Tabla con columnas: Nombre, Descripción, Capacidad, Ubicación, Horario, Estado
- Botones: Crear, Editar, Eliminar
- `CreateCommonAreaDialog.tsx` + `EditCommonAreaDialog.tsx`

### `ReservationsPage.tsx` (todos los roles)

- Ruta: `/reservations`
- **Header**: `[input date] [Select zona ▾] [⊞ Grilla | ≡ Lista] [+ Nueva reserva]`

### `AvailabilityGrid.tsx` (componente de grilla)

- Filas = horas desde `openingTime` hasta `closingTime` (bloques 1hr)
- Celda libre (verde): click → `CreateReservationDialog` pre-llenado con zona + hora
- Celda ocupada (roja): abarca N filas según duración; hover → Popover con detalle (nombre, destino, notas) + botones Confirmar/Cancelar según rol

### Vista Lista

- Tabla filtrada por zona y fecha seleccionadas
- Badges de estado con colores (`reservationStatusColors`)
- Acciones: Cancelar (todos), Confirmar/Completar (solo admin)

### Dialogs

- `CreateReservationDialog.tsx`: Zona (pre-llenada o selectable), Fecha, Hora inicio, Hora fin, Destino, Representante (dinámico), Notas
- `CancelReservationDialog.tsx`: textarea motivo, mínimo 5 chars (RHF + Zod)

### Sidebar (editar `MainLayout.tsx`)

- `CalendarDays` "Reservas" `/reservations` → visible para todos los roles
- `MapPin` "Zonas comunes" `/common-areas` → solo admin

### AppRouter (editar)

- Lazy import de `ReservationsPage` y `CommonAreasPage`
- Rutas bajo `ProtectedRoute`

---

## Archivos a crear — resumen

### Backend (22 nuevos + 5 editados)

```
src/AccessControl.Domain/
  Enums/ReservationStatusEnum.cs
  Entities/CommonArea.cs
  Entities/Reservation.cs
  Interfaces/ICommonAreaRepository.cs
  Interfaces/IReservationRepository.cs

src/AccessControl.Infrastucture/
  Persistence/Configurations/CommonAreaConfiguration.cs
  Persistence/Configurations/ReservationConfiguration.cs
  Persistence/Repositories/CommonAreaRepository.cs
  Persistence/Repositories/ReservationRepository.cs
  [editar] AppDbContext.cs
  [editar] UnitOfWork.cs
  [editar] DependencyInjection.cs

src/AccessControl.Application/
  Features/CommonAreas/Commands/CreateCommonArea/...
  Features/CommonAreas/Commands/UpdateCommonArea/...
  Features/CommonAreas/Commands/DeleteCommonArea/...
  Features/CommonAreas/Queries/GetAllCommonAreas/...
  Features/CommonAreas/Queries/GetCommonAreaById/...
  Features/Reservations/Commands/CreateReservation/...
  Features/Reservations/Commands/CancelReservation/...
  Features/Reservations/Commands/ConfirmReservation/...
  Features/Reservations/Commands/CompleteReservation/...
  Features/Reservations/Queries/GetAllReservations/...
  Features/Reservations/Queries/GetAvailability/...

src/AccessControl.API/
  Controllers/CommonAreasController.cs
  Controllers/ReservationsController.cs
  [editar] IUnitOfWork.cs → en Domain
```

### Frontend (13 nuevos + 2 editados)

```
frontend/src/features/reservations/
  types/reservation.types.ts
  api/commonAreaService.ts
  api/reservationService.ts
  hooks/useCommonAreas.ts
  hooks/useReservations.ts
  CommonAreasPage.tsx
  ReservationsPage.tsx
  components/AvailabilityGrid.tsx
  components/CreateCommonAreaDialog.tsx
  components/EditCommonAreaDialog.tsx
  components/CreateReservationDialog.tsx
  components/CancelReservationDialog.tsx
  components/ReservationListView.tsx

[editar] frontend/src/routes/AppRouter.tsx
[editar] frontend/src/shared/components/MainLayout.tsx
```

---

## Verificación por fase

- **Fase A**: `dotnet build` — 0 errores
- **Fase B**: `dotnet ef migrations add ... && dotnet ef database update` — tablas creadas
- **Fase C**: `dotnet build` — 0 errores. Ejecutar tests: `dotnet test` — todos pasan
- **Fase D**: `dotnet run` — probar endpoints con Swagger/HTTP client
- **Fase E–F**: `npm run build` — 0 errores. Probar flujo completo en navegador
