# Access Control — Instrucciones para GitHub Copilot

## Descripción general

**Access Control** es un sistema integral de gestión de acceso para conjuntos residenciales, edificios y comunidades cerradas. Permite:

- Registrar y controlar el ingreso de visitantes (con foto, documento, destino)
- Gestionar recepción y entrega de paquetes y domicilios
- Administrar residentes, apartamentos y personal autorizado
- Generar reportes de accesos e incidentes

Este proyecto es la modernización completa de un sistema WPF legado, migrado a una arquitectura moderna con API REST (.NET 8) + frontend React/TypeScript + Electron para escritorio. Soporta dos modos de operación:

- **Offline (sin internet):** operación standalone con SQLite/IndexedDB, todo funciona sin conexión
- **Online (multi-usuario):** datos centralizados en MySQL, sincronización en tiempo real entre porteros/recepcionistas

---

## Stack tecnológico

### Backend — .NET 9

| Categoría     | Librería                               | Versión         |
| ------------- | -------------------------------------- | --------------- |
| Framework     | ASP.NET Core                           | 9.0             |
| Lenguaje      | C#                                     | 13              |
| ORM           | Entity Framework Core + Pomelo (MySQL) | 9.0.14 + 9.0.0  |
| Mapeador      | Riok.Mapperly                          | 4.3.1           |
| CQRS          | MediatR                                | 14.1.0          |
| Validación    | FluentValidation + DI Extensions       | 12.1.1          |
| Auth          | JWT Bearer + BCrypt.Net-Next           | 9.0.14 / 4.0.3  |
| Logging       | Serilog (Console + File sinks)         | (6.1.1 + 7.0.0) |
| Documentación | Swashbuckle (Swagger/OpenAPI)          | (10.1.7/9.0.10) |
| Health Checks | EF Core + MySQL health checks          | 9.0.14          |

### Frontend — React + TypeScript

| Categoría       | Librería                                     | Versión              |
| --------------- | -------------------------------------------- | -------------------- |
| Framework       | React + TypeScript                           | 18.2+ / 5.3+         |
| Build tool      | Vite                                         | 5.0+                 |
| UI Components   | ShadCN UI + Radix UI                         | Latest / 1.0+        |
| Estilos         | TailwindCSS + clsx + tailwind-merge          | 3.4+                 |
| Estado global   | Zustand                                      | 4.5+                 |
| Estado servidor | TanStack Query (React Query)                 | 5.17+                |
| Formularios     | React Hook Form + @hookform/resolvers        | 7.49+ / 3.3+         |
| Validación      | Zod                                          | 3.22+                |
| HTTP            | Axios                                        | 1.6+                 |
| Routing         | React Router DOM                             | 6.21+                |
| Offline DB      | Dexie.js (IndexedDB wrapper)                 | 3.2+                 |
| PWA             | Workbox + vite-plugin-pwa                    | 7.0+ / 0.17+         |
| Iconos          | Lucide React                                 | 0.300+               |
| Fechas          | date-fns                                     | 3.0+                 |
| Notificaciones  | Sonner                                       | 1.3+                 |
| Desktop         | Electron + Electron Builder + electron-store | 28.0+ / 24.0+ / 8.1+ |

### Base de datos

- **MySQL 8.0+** — modo online/multi-usuario (producción)
- **SQLite** — modo offline/standalone (local)
- **IndexedDB (Dexie.js)** — caché del frontend para operación offline

### Testing

| Tipo              | Herramienta                                       | Versión       |
| ----------------- | ------------------------------------------------- | ------------- |
| Unit tests (.NET) | xUnit + Moq + FluentAssertions + Bogus            | 2.6+          |
| Integration tests | Microsoft.AspNetCore.Mvc.Testing + Testcontainers | 8.0.0 / 3.6.0 |
| Frontend unit     | Vitest + @testing-library/react                   | 1.1+ / 14.1+  |
| Frontend events   | @testing-library/user-event + jest-dom            | 14.5+ / 6.1+  |

### DevOps

- Docker 24.0+ + Docker Compose 2.23+
- GitHub Actions (CI/CD)
- Sentry (error tracking) + Seq (logs estructurados, opcional)

---

## Arquitectura y patrones

### Arquitectura general (Clean Architecture)

```
AccessControl.sln
├── src/
│   ├── AccessControl.API/           ← Controllers, Program.cs, middlewares HTTP
│   ├── AccessControl.Application/   ← Commands, Queries, Handlers, Validators (CQRS)
│   ├── AccessControl.Domain/        ← Entidades, Value Objects, interfaces de repositorio
│   └── AccessControl.Infrastructure/← Implementación de repos, DbContext, servicios externos
└── tests/
    ├── AccessControl.UnitTests/
    └── AccessControl.IntegrationTests/
```

### CQRS con MediatR

- Cada operación de escritura = un `Command` + su `CommandHandler`
- Cada consulta = una `Query` + su `QueryHandler`
- Cada Command/Query tiene su propio `Validator` usando FluentValidation
- Los Controllers **solo** hacen `await _mediator.Send(command)` — sin lógica de negocio
- Los Handlers no acceden directamente a DbContext; usan interfaces de repositorio

Ejemplo de estructura de un caso de uso:

```
Application/
└── Visits/
    ├── Commands/
    │   └── CreateVisit/
    │       ├── CreateVisitCommand.cs
    │       ├── CreateVisitCommandHandler.cs
    │       └── CreateVisitCommandValidator.cs
    └── Queries/
        └── GetVisitById/
            ├── GetVisitByIdQuery.cs
            └── GetVisitByIdQueryHandler.cs
```

### Frontend — estructura de carpetas

```
src/
├── components/          ← Componentes reutilizables (ShadCN + custom)
│   ├── ui/              ← Componentes base de ShadCN (no modificar directamente)
│   └── shared/          ← Componentes propios reutilizables
├── pages/               ← Vistas por ruta (una carpeta por módulo)
│   ├── visits/
│   ├── packages/
│   ├── residents/
│   └── dashboard/
├── features/            ← Lógica de negocio agrupada por dominio
│   └── visits/
│       ├── api.ts       ← Llamadas HTTP del dominio
│       ├── hooks.ts     ← React Query hooks del dominio
│       ├── store.ts     ← Slice de Zustand si aplica
│       └── schemas.ts   ← Schemas Zod del dominio
├── store/               ← Stores globales de Zustand (UI state)
├── hooks/               ← Custom hooks genéricos
├── lib/                 ← Configuración de Axios, Dexie, utils
├── types/               ← Tipos e interfaces globales (respuestas de API, entidades)
└── sync/                ← Lógica de sincronización offline/online
```

---

## Soporte Offline / Sincronización

Este es uno de los aspectos más críticos del sistema. Seguir siempre estas reglas:

- Toda entidad que se pueda crear offline debe tener:
    - `id` generado en cliente (UUID v4), no autoincremental del servidor
    - `syncStatus: 'pending' | 'synced' | 'conflict'`
    - `localCreatedAt` y `serverCreatedAt` para resolución de conflictos

- El flujo de sincronización es:
    1. Operación local → guardada en Dexie.js con `syncStatus: 'pending'`
    2. Al recuperar conexión → `SyncService` detecta registros pendientes
    3. Envío al backend → si éxito: `syncStatus: 'synced'`
    4. Si hay conflicto de versión → `syncStatus: 'conflict'` y se muestra al usuario

- **Nunca** asumir que hay conexión en los hooks de features; siempre verificar con `useNetworkStatus()`
- React Query se usa para datos cuando hay conexión; Dexie.js como caché local primaria

---

## Convenciones de código

### C# — Backend

**Naming:**

| Elemento             | Convención                  | Ejemplo                                 |
| -------------------- | --------------------------- | --------------------------------------- |
| Clases               | PascalCase                  | `VisitRepository`, `CreateVisitCommand` |
| Interfaces           | IPascalCase                 | `IVisitRepository`, `IUnitOfWork`       |
| Métodos públicos     | PascalCase                  | `GetAllAsync()`, `CreateVisit()`        |
| Métodos privados     | PascalCase                  | `ValidateInput()`, `BuildQuery()`       |
| Métodos async        | Sufijo `Async` obligatorio  | `GetByIdAsync()`, `SaveChangesAsync()`  |
| Propiedades públicas | PascalCase                  | `FirstName`, `CheckInTime`              |
| Variables locales    | camelCase                   | `visitCount`, `isValid`                 |
| Parámetros           | camelCase                   | `visitorId`, `apartmentNumber`          |
| Constantes           | PascalCase o UPPER_SNAKE    | `MaxRetries`, `MAX_RETRIES`             |
| Enums                | PascalCase (tipo y valores) | `VisitStatus.Active`                    |

**Reglas generales:**

- Usar `var` solo cuando el tipo es obvio por la derecha de la asignación
- Preferir `record` para DTOs y objetos inmutables
- Siempre usar `cancellationToken` en métodos async públicos de la API
- Los repositorios devuelven `Task<T?>` (nullable) cuando el registro puede no existir
- No lanzar excepciones para flujos de negocio esperados; usar `Result<T>` o `OneOf`
- Los endpoints siempre retornan `IActionResult` o `ActionResult<T>`, nunca tipos concretos

### TypeScript — Frontend

**Naming:**

| Elemento              | Convención                     | Ejemplo                                 |
| --------------------- | ------------------------------ | --------------------------------------- |
| Componentes           | PascalCase                     | `VisitorCard.tsx`, `AccessLogTable.tsx` |
| Hooks                 | prefijo `use`                  | `useVisitors.ts`, `useNetworkStatus.ts` |
| Stores Zustand        | sufijo `Store` + prefijo `use` | `useVisitorStore.ts`                    |
| Schemas Zod           | sufijo `Schema`                | `createVisitSchema.ts`                  |
| Tipos/Interfaces      | PascalCase                     | `Visitor`, `VisitResponse`, `ApiError`  |
| Funciones utilitarias | camelCase                      | `formatDate()`, `buildQueryParams()`    |
| Constantes            | UPPER_SNAKE_CASE               | `MAX_PHOTO_SIZE_MB`, `SYNC_INTERVAL_MS` |
| Archivos de tipos     | sufijo `.types.ts`             | `visit.types.ts`                        |

**Reglas generales:**

- Siempre tipar explícitamente los retornos de funciones (no depender de inferencia en exports)
- Preferir `interface` para objetos de dominio, `type` para uniones y aliases
- Los componentes deben recibir props tipadas; nunca `any` ni `object`
- React Query para **todo** dato que viene del servidor; Zustand solo para estado UI (modales, filtros activos, selección)
- Validar con Zod en el punto de entrada (formularios y respuestas de API críticas)
- No usar `useEffect` para sincronizar estado; si es necesario, documentar el porqué

---

## Comandos principales

### Backend

```bash
# Desarrollo
dotnet run --project src/AccessControl.API

# Tests unitarios
dotnet test tests/AccessControl.UnitTests

# Tests de integración (requiere Docker)
dotnet test tests/AccessControl.IntegrationTests

# Migraciones
dotnet ef migrations add <NombreMigracion> --project src/AccessControl.Infrastructure --startup-project src/AccessControl.API
dotnet ef database update --project src/AccessControl.Infrastructure --startup-project src/AccessControl.API

# Build producción
dotnet publish src/AccessControl.API -c Release -o ./publish
```

### Frontend

```bash
# Desarrollo web
npm run dev

# Desarrollo Electron (desktop)
npm run electron:dev

# Tests
npm run test
npm run test:coverage

# Build web
npm run build

# Build instalador Electron
npm run electron:build

# Lint y formato
npm run lint
npm run format
```

### Docker

```bash
# Levantar entorno completo (API + MySQL)
docker compose up -d

# Solo base de datos
docker compose up -d mysql

# Ver logs
docker compose logs -f api
```

---

## Design System — Paleta de colores (Neo Gradient)

La paleta oficial del frontend es **Neo Gradient**. Las variables CSS de ShadCN en `frontend/src/index.css` deben respetar estos valores (modo claro):

| Variable ShadCN                | Valor     | Descripción                             |
| ------------------------------ | --------- | --------------------------------------- |
| `--background`                 | `#F4F7FC` | Fondo general de la app                 |
| `--foreground`                 | `#1F2937` | Texto principal                         |
| `--card`                       | `#FFFFFF` | Superficie de tarjetas                  |
| `--card-foreground`            | `#1F2937` | Texto sobre tarjetas                    |
| `--primary`                    | `#5B8DEF` | Color primario (botones, links activos) |
| `--primary-foreground`         | `#FFFFFF` | Texto sobre primario                    |
| `--secondary`                  | `#EEF2FB` | Superficies secundarias                 |
| `--secondary-foreground`       | `#1F2937` | Texto sobre secundario                  |
| `--muted`                      | `#EEF2FB` | Fondos apagados                         |
| `--muted-foreground`           | `#6B7280` | Texto secundario / hints                |
| `--accent`                     | `#A78BFA` | Acento violeta suave                    |
| `--accent-foreground`          | `#FFFFFF` | Texto sobre acento                      |
| `--destructive`                | `#EF4444` | Acciones destructivas                   |
| `--border`                     | `#D9E4F5` | Bordes                                  |
| `--input`                      | `#D9E4F5` | Borde de inputs                         |
| `--ring`                       | `#5B8DEF` | Focus ring                              |
| `--sidebar`                    | `#FFFFFF` | Fondo del sidebar                       |
| `--sidebar-foreground`         | `#1F2937` | Texto en sidebar                        |
| `--sidebar-primary`            | `#5B8DEF` | Ítem activo en sidebar                  |
| `--sidebar-primary-foreground` | `#FFFFFF` | Texto ítem activo                       |
| `--sidebar-accent`             | `#EEF2FB` | Hover en sidebar                        |
| `--sidebar-accent-foreground`  | `#5B8DEF` | Texto hover sidebar                     |
| `--sidebar-border`             | `#D9E4F5` | Borde del sidebar                       |
| `--sidebar-ring`               | `#5B8DEF` | Focus ring en sidebar                   |

**Notas:**

- TailwindCSS v4 acepta valores hex directos en variables CSS — no convertir a oklch ni HSL
- El modo oscuro (`.dark`) está pendiente de definición — no modificar hasta tener la paleta oscura
- No usar colores arbitrarios fuera de estas variables; siempre referenciar via `text-primary`, `bg-accent`, etc.

---

## Recursos y scripts

```
scripts/
├── start-api.sh         ← Instala dependencias e inicia la API
├── start-frontend.sh    ← Inicia Vite en modo desarrollo
├── run-tests.sh         ← Ejecuta todos los tests (unit + integration)
├── seed-database.sh     ← Pobla la base de datos con datos de prueba
└── reset-db.sh          ← Borra y recrea la base de datos local

docker/
├── docker-compose.yml       ← Entorno completo
├── docker-compose.test.yml  ← Entorno para integration tests
└── mysql/
    └── init.sql             ← Script inicial de base de datos
```

## Arquitectura

┌────────────────────────────────────────────────────────────────────┐
│ 🎯 ARQUITECTURA MODERNA │
└────────────────────────────────────────────────────────────────────┘

              ┌─────────────────────────────────────┐
              │      FRONTEND (ÚNICO CÓDIGO)        │
              │                                     │
              │    🎨 React + TypeScript            │
              │    🎨 TailwindCSS / ShadCN          │
              │    🎨 Responsive & Modern           │
              └──────────────┬──────────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │

┌─────────▼────────┐ ┌────────▼─────────┐
│ 📴 MODO OFFLINE │ │ 🌐 MODO ONLINE │
│ (Electron) │ │ (Browser) │
├──────────────────┤ ├──────────────────┤
│ - Desktop App │ │ - Progressive │
│ - React bundled │ │ Web App (PWA) │
│ - API local │ │ - Cloud hosted │
│ - MySQL local │ │ - API remota │
└─────────┬────────┘ └────────┬─────────┘
│ │
│ ┌──────────────────┐ │
└────────►│ API REST .NET 8 │◄──────┘
│ (Backend único) │
└─────────┬────────┘
│
┌─────────▼────────┐
│ MySQL Database │
│ (Local o Cloud) │
└──────────────────┘

---

## Reglas adicionales para el agente

1. **Al crear un nuevo endpoint:** siempre crear Command/Query + Handler + Validator + Controller method + DTO de respuesta
2. **Al crear un componente:** usar ShadCN si existe el componente base; crear en `components/shared/` si es reutilizable, en `pages/[módulo]/` si es específico de vista
3. **Al crear un formulario:** siempre usar React Hook Form + schema Zod + resolver de hookform
4. **Al agregar una consulta al servidor:** siempre usar React Query (`useQuery` / `useMutation`), nunca `useEffect` + `fetch`/`axios` directo
5. **Al tocar lógica de sincronización offline:** verificar que el campo `syncStatus` se actualice correctamente y que los UUID se generen en cliente
6. **Nunca** hacer lógica de negocio en Controllers ni en Componentes React — va en Handlers y en hooks/features respectivamente
7. **Siempre** agregar comentarios XML (`///`) a métodos y clases públicos en C#
8. **Siempre** que se crea una migración, revisar que sea reversible (tiene método `Down`)
