# Documento de Arquitectura - Access Control Management

**Version:** 1.0  
**Fecha:** Mayo 2026  
**Repositorio:** haroldbejar/AccessControl-Hibryd-Version

## 1. Vision General

Access Control Management es un sistema de gestion de acceso para copropiedades. Permite registrar visitas, gestionar paquetes, reservar zonas comunes y generar informes. La aplicacion esta disenada como una arquitectura hibrida: un backend API REST en .NET 9 consumido por una SPA React/TypeScript que opera como PWA instalable en el navegador.

```text
┌─────────────────────────────────────┐
│       SPA React + TypeScript        │
│    (Vite · TailwindCSS · ShadCN)    │
│  PWA instalable · SignalR cliente   │
└──────────────┬──────────────────────┘
               │  HTTP/REST + WebSocket (SignalR)
               ▼
┌─────────────────────────────────────┐
│         API REST  .NET 9            │
│   Clean Architecture · CQRS         │
│   JWT Auth · SignalR Hub            │
└──────────────┬──────────────────────┘
               │  EF Core 9 + Pomelo
               ▼
┌─────────────────────────────────────┐
│           MySQL 8.0                 │
│  10 tablas · Soft Delete global     │
│  Migraciones automaticas            │
└─────────────────────────────────────┘
```

## 2. Backend - .NET 9

### 2.1 Estructura de capas (Clean Architecture)

```text
src/
├── AccessControl.Domain/          ← Nucleo: entidades, enums, interfaces
├── AccessControl.Application/     ← Casos de uso: CQRS, DTOs, validadores
├── AccessControl.Infrastucture/   ← EF Core, repositorios, servicios externos
└── AccessControl.API/             ← Controllers REST, Hubs SignalR, middleware

tests/
├── AccessControl.Domain.Tests/
├── AccessControl.Application.Tests/
└── AccessControl.API.IntegrationTests/
```

Las dependencias fluyen siempre hacia adentro: API -> Application -> Domain. Infrastructure implementa interfaces del Domain. El Domain no depende de nada externo.

### 2.2 Capa Domain

Contiene el modelo de negocio puro, sin dependencias de frameworks.

**BaseEntity** - clase base de todas las entidades:

| Campo          | Tipo      | Proposito                   |
| -------------- | --------- | --------------------------- |
| Id             | int       | PK auto-increment           |
| CreatedDate    | DateTime  | Auditoria de creacion       |
| UserCreated    | int       | FK al usuario que creo      |
| ModifiedDate   | DateTime? | Auditoria de modificacion   |
| Eliminated     | bool      | Soft delete                 |
| EliminatedDate | DateTime? | Fecha de eliminacion logica |

**Entidades del dominio (10):**

| Entidad        | Responsabilidad                          | Relaciones clave                           |
| -------------- | ---------------------------------------- | ------------------------------------------ |
| Visit          | Registro de entrada/salida de visitantes | -> Representative                          |
| Package        | Paquetes recibidos en porteria           | -> Destination, Representative             |
| User           | Usuarios del sistema                     | -> Role                                    |
| Role           | Roles de acceso (Admin, Portero)         | <- User[]                                  |
| Representative | Residentes/arrendatarios                 | -> Destination                             |
| Destination    | Unidades (apartamentos, oficinas)        | <- Representative[]                        |
| CommonArea     | Zonas comunes reservables                | <- Reservation[]                           |
| Reservation    | Reservas de zonas comunes                | -> CommonArea, Destination, Representative |
| Mail           | Correos (legacy)                         | -                                          |
| Stencil        | Plantillas (legacy)                      | -                                          |

**Enumeraciones:**

- VehicleTypeEnum - NA / Car / Motorcycle / Bicycle
- PackagesStatusEnum - Received / Delivered
- ReservationStatusEnum - Pending / Confirmed / Cancelled / Completed
- RepresentativeTypeEnum - Owner / Tenant

**Interfaces del dominio:** IRepository<T>, IUnitOfWork, y una interfaz especifica por cada repositorio (IVisitRepository, IPackageRepository, etc.).

### 2.3 Capa Application - CQRS con MediatR

Implementa los casos de uso mediante el patron CQRS. Cada feature tiene subcarpetas /Commands y /Queries.

```text
Features/
├── Visits/
│   ├── Commands/
│   │   ├── CreateVisit/
│   │   └── CheckOutVisit/
│   └── Queries/
│       ├── GetAllVisits/
│       └── GetVisitByDocument/
├── Packages/
├── Users/
├── Representatives/
├── Destinations/
├── CommonAreas/
├── Reservations/
└── Reports/
```

**Pipeline de MediatR (behaviors en orden):**

```text
Request
  ↓
LoggingBehavior
  ↓
ValidationBehavior
  ↓
Handler
  ↓
Response
```

**Result Pattern**

Los handlers no lanzan excepciones para flujos esperados:

- Result<VisitResponse> para exito con valor
- Result.Failure("mensaje") para fracaso

**Mapperly**

Mapeo de entidades a DTOs en tiempo de compilacion; propiedades de navegacion con MapProperty.

### 2.4 Capa Infrastructure

Implementa todas las interfaces del dominio.

**EF Core 9 + Pomelo MySQL:**

- AppDbContext con ApplyConfigurationsFromAssembly
- Filtro global de soft delete para entidades BaseEntity
- Auditoria automatica en SaveChangesAsync

**Repositorios:**

| Repositorio           | Metodos adicionales                                               |
| --------------------- | ----------------------------------------------------------------- |
| VisitRepository       | GetByDocumentNumberAsync, GetAllFilteredAsync                     |
| PackageRepository     | GetPendingPackagesAsync, DeliverPackageAsync, GetAllFilteredAsync |
| UserRepository        | GetByUserAccountAsync, LoginAsync, UserAccountExistsAsync         |
| ReservationRepository | GetAllFilteredAsync, GetByDateAndAreaAsync, HasOverlapAsync       |

UnitOfWork coordina repositorios y expone SaveChangesAsync.

**JwtTokenService**

Genera tokens HS256 con claims NameIdentifier, Name, Role y Jti.

**Migraciones aplicadas:**

| Migracion                        | Cambio                                    |
| -------------------------------- | ----------------------------------------- |
| InitialCreate                    | Schema inicial completo                   |
| RemovePackageStatusDefault       | Ajuste de valor por defecto               |
| RemoveAuthorizationsAndMenus     | Eliminacion de entidades legacy RBAC      |
| AddReservationsModule            | CommonAreas + Reservations                |
| AddRepresentativeTypeAndContract | Tipo de representante + fecha de contrato |

### 2.5 Capa API

**BaseController**

Inyecta IMediator y expone CurrentUserId desde JWT.

**Controllers y rutas:**

| Controller                | Base URL             | Endpoints destacados                                       |
| ------------------------- | -------------------- | ---------------------------------------------------------- |
| AuthController            | /api/auth            | POST /login                                                |
| VisitsController          | /api/visits          | GET lista, GET por documento, POST, PATCH checkout         |
| PackagesController        | /api/packages        | GET lista, GET pendientes, POST, PATCH entregar            |
| UsersController           | /api/users           | CRUD, PATCH change-password                                |
| RolesController           | /api/roles           | GET, POST                                                  |
| DestinationsController    | /api/destinations    | CRUD completo                                              |
| RepresentativesController | /api/representatives | CRUD, GET by-destination                                   |
| CommonAreasController     | /api/common-areas    | CRUD completo                                              |
| ReservationsController    | /api/reservations    | GET, GET availability, POST, PATCH cancel/confirm/complete |
| ReportsController         | /api/reports         | GET /summary                                               |
| PhotoSessionsController   | /api/photo-sessions  | POST crear sesion, POST upload                             |

**Middleware pipeline:**

- ExceptionMiddleware
- SerilogRequestLogging
- UseHttpsRedirection
- UseCors("AllowAll")
- UseAuthentication
- UseAuthorization
- MapControllers
- MapHub<PhotoHub>("/hubs/photo")
- MapHealthChecks("/health")

### 2.6 Autenticacion y Autorizacion

- JWT Bearer HS256
- Endpoints protegidos con Authorize global (excepto login y upload publico de foto)
- Visibilidad de modulos por roleName en frontend
- Seed inicial con admin/Admin123! en entornos no Testing

## 3. Frontend - React + TypeScript

### 3.1 Stack tecnologico

| Herramienta     | Version    | Proposito                   |
| --------------- | ---------- | --------------------------- |
| Vite            | 8.0.4      | Build tool, HMR, plugin PWA |
| React           | 19.2.4     | UI framework                |
| TypeScript      | 6.0.2      | Tipado estatico             |
| TailwindCSS     | v4         | Estilos utility-first       |
| ShadCN UI       | Radix Nova | Componentes accesibles      |
| React Router    | v6         | Routing declarativo         |
| TanStack Query  | 5.96.2     | Cache de datos servidor     |
| Zustand         | 5.0.12     | Estado global               |
| React Hook Form | 7.72.1     | Formularios                 |
| Zod             | 4.3.6      | Validacion                  |
| Axios           | 1.14.0     | HTTP client                 |
| SignalR client  | 10.0.0     | Tiempo real                 |
| react-pdf       | 4.4.0      | PDFs en cliente             |
| xlsx            | 0.18.5     | Exportacion Excel           |
| qrcode.react    | 4.2.0      | QR para captura movil       |
| Sonner          | 2.0.7      | Toasts                      |
| date-fns        | -          | Fechas                      |
| Vitest          | 4.1.4      | Testing frontend            |

### 3.2 Organizacion por feature

El frontend sigue arquitectura feature-sliced:

- features/{feature}/api
- features/{feature}/hooks
- features/{feature}/types
- features/{feature}/components
- features/{feature}/{Feature}Page.tsx
- shared/components, shared/hooks, shared/services, shared/types
- layouts/MainLayout.tsx
- routes/AppRouter.tsx y ProtectedRoute.tsx

### 3.3 Modulos implementados

| Modulo         | Ruta                | Acceso           | Funcionalidades             |
| -------------- | ------------------- | ---------------- | --------------------------- |
| Login          | /login              | Publico          | Formulario RHF + Zod        |
| Dashboard      | /dashboard          | Todos            | 4 KPIs + tablas             |
| Visitas        | /visits             | Todos            | Registro, filtros, checkout |
| Paquetes       | /packages           | Todos            | Registro, entrega, alertas  |
| Usuarios       | /users              | Admin            | CRUD + cambio password      |
| Destinatarios  | /destinations       | Admin            | CRUD                        |
| Representantes | /representatives    | Admin            | CRUD + tipo/contrato        |
| Reservas       | /reservations       | Todos            | Grilla + lista              |
| Zonas comunes  | /common-areas       | Admin            | CRUD                        |
| Reportes       | /reports            | Todos (R5 Admin) | PDF + Excel                 |
| Captura movil  | /capture/:sessionId | Publico          | Captura via SignalR         |

### 3.4 Gestion de estado

**Zustand**

- authStore persistido en localStorage (access-control-auth)
- token, user, isAuthenticated, login, logout

**TanStack Query**

- staleTime global 5 minutos
- retry 1
- query keys por feature para invalidacion selectiva

**ThemeContext**

- Tema light/dark persistido en localStorage (access-control-theme)

### 3.5 Comunicacion con API

Instancia Axios compartida:

- baseURL desde VITE_API_URL
- interceptor request agrega Bearer token
- interceptor response hace logout en 401

Patrones de respuesta backend:

- Wrapper ApiResult en algunos controllers (usar response.data.value)
- Dato crudo en otros controllers (usar response.data)

### 3.6 Routing y proteccion de rutas

- Rutas publicas: /login y /capture/:sessionId
- Rutas protegidas bajo ProtectedRoute y MainLayout
- Lazy loading con React.lazy + Suspense para todas las paginas
- Ruta comodin para NotFoundPage

### 3.7 Captura de imagenes y SignalR

Dos modos de captura:

1. Webcam PC (CameraCapture.tsx)
2. Captura remota con celular (PhotoCapture.tsx + useCameraSession.ts)

Flujo remoto:

- PC crea sesion y genera QR
- Celular escanea QR y sube foto
- Backend valida token y reenvia via SignalR al PC
- PC recibe evento photoReceived y rellena el formulario

### 3.8 Notificaciones en app

NotificationBell + useNotifications:

- Polling cada 2 minutos
- Alertas de paquetes vencidos y reservas proximas
- Badge en campana y badge en sidebar para paquetes

### 3.9 PWA

Configurada con vite-plugin-pwa y Workbox:

- CacheFirst para assets estaticos
- NetworkFirst para /api/\*
- Genera sw.js y workbox-\*.js en dist

### 3.10 Exportacion de reportes

- PDF con @react-pdf/renderer
- Excel con xlsx
- Informes R1-R5, con R5 solo admin

## 4. Base de Datos

**Motor:** MySQL 8.0  
**ORM:** EF Core 9 + Pomelo

Convenciones principales:

- string -> VARCHAR(n)
- bool -> TINYINT(1)
- DateTime -> DATETIME(6)
- DateOnly -> DATE
- TimeOnly -> TIME
- byte[] -> LONGBLOB
- enum -> INT

Soft delete global y relaciones con DeleteBehavior.Restrict para evitar borrado en cascada.

## 5. Testing

| Proyecto                           | Tipo        | Herramientas                  | Cobertura              |
| ---------------------------------- | ----------- | ----------------------------- | ---------------------- |
| AccessControl.Domain.Tests         | Unitarios   | xUnit + FluentAssertions      | Reglas de dominio      |
| AccessControl.Application.Tests    | Unitarios   | xUnit + NSubstitute           | Handlers y validadores |
| AccessControl.API.IntegrationTests | Integracion | xUnit + WebApplicationFactory | Flujos HTTP            |

Estado reportado: 57 tests pasando.

## 6. Decisiones de diseno relevantes

| Decision                             | Rationale                                     |
| ------------------------------------ | --------------------------------------------- |
| Sin RBAC granular                    | Sistema simplificado a visibilidad por rol    |
| Fotos base64 en MySQL                | Compatibilidad con legado y despliegue simple |
| DateTime.Now en registros operativos | Coherencia con zona local (UTC-5)             |
| Result Pattern                       | Errores esperados sin excepciones de control  |
| const-object enums en TypeScript     | Tipado estable y compatible con Zod           |
| Invalidacion por clave raiz en Query | Refresco seguro de variantes de query         |

## 7. Configuracion de entornos

| Variable                            | Valor dev                                    | Proposito        |
| ----------------------------------- | -------------------------------------------- | ---------------- |
| VITE_API_URL                        | http://localhost:5192/api                    | URL base backend |
| Jwt:Key                             | AccessControl@SuperSecretKey2026!MinLength32 | Firma JWT        |
| Jwt:ExpiresInMinutes                | 480                                          | Sesion 8 horas   |
| ConnectionStrings:DefaultConnection | Server=localhost;Database=access_control;... | MySQL local      |

Backend por defecto en puerto 5192. Frontend en 5174.

## 8. Flujo ejemplo de operacion

**Caso: registrar visita con foto desde celular**

1. Portero abre formulario en PC.
2. Genera QR (POST /api/photo-sessions).
3. Frontend PC se conecta a SignalR y espera foto.
4. Celular escanea QR y toma foto.
5. Celular sube foto (POST upload con token).
6. Backend valida y emite photoReceived al grupo SignalR.
7. PC recibe foto, completa datos y envia POST /api/visits.
8. Backend guarda en MySQL y responde VisitResponse.
9. Frontend invalida queries y refresca tabla.

---

**Fin del documento.**
