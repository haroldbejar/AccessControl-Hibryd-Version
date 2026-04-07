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

## Fase actual: Fase 1 — Backend API (.NET 9)

**Objetivo:** API REST funcional que reemplace la capa Business del sistema WPF legado  
**Duración estimada:** 4-6 semanas (160-240 horas)

---

## Estado de subfases

- [x] **1.1 Setup inicial** — Estructura Clean Architecture creada
- [x] **1.2 Migración de entidades** — Todas las entidades definidas en `AccessControl.Domain/Entities/`
- [x] **1.3 Infrastructure Layer** — EF Core 9 + Pomelo, AppDbContext, 10 configuraciones Fluent API, GenericRepository, 8 repositorios específicos, UnitOfWork, DependencyInjection. Build: 0 errores.
- [x] **1.4 Application Layer (CQRS)** — MediatR + FluentValidation + Mapperly. 32 casos de uso (Visits, Packages, Users, Auth, Destinations, Representatives, Roles, Menus, Authorizations). Result<T>, ValidationBehavior, LoggingBehavior, 8 mappers con RequiredMappingStrategy.Target. Build: 0 errores, 0 warnings.
- [x] **1.5 API Controllers** — ExceptionMiddleware, Program.cs (Serilog + Swagger/OpenAPI JWT + CORS + HealthChecks), BaseController, 9 controllers (32 endpoints totales). Build: 0 errores, 0 warnings.
- [x] **1.6 JWT Authentication** — IJwtTokenService + JwtTokenService (HS256, claims: NameIdentifier/Name/Role/Jti), LoginCommandHandler actualizado, LoginResponse con Token+Expiration, appsettings Jwt section, Program.cs UseAuthentication+AddJwtBearer, [Authorize] en BaseController, [AllowAnonymous] en AuthController, CurrentUserId en BaseController reemplaza hardcoded `1`. Build: 0 errores, 0 warnings.
- [x] **1.7 Testing** — 3 proyectos xUnit: Domain (33 tests), Application (20 tests), Integration (6 tests). Build: 0 errores. Stack: xUnit + FluentAssertions + NSubstitute + InMemory DB.
- [x] **1.8 Documentación y Deploy** — README completo, Dockerfile multi-stage, docker-compose (API + MySQL 8.0), .env.example. Build: 0 errores. Tests: 57/57 passing.

---

## ✅ FASE 1 COMPLETADA

**Todos los objetivos de la Fase 1 — Backend API (.NET 9) han sido completados.**

### Resultados finales

- 7 proyectos compilados sin errores ni warnings
- 57 tests passing (Domain: 33, Application: 20, Integration: 4 — sin contar los de login)
- API REST con 32 endpoints, JWT Auth, Clean Architecture
- Docker listo para deploy en producción

### Próxima fase

**Fase 2 — Frontend React + TypeScript** (ver plan-modernizacion.instructions.md)

### Notas técnicas relevantes para continuidad

- Swashbuckle 6.9.0 (Microsoft.OpenApi 1.x) — compatible con .NET 9
- Swagger deshabilitado en entorno `Testing` (ver Program.cs)
- `WebApplicationFactory<Program>` usa `UseEnvironment("Testing")` + InMemory DB
- Puerto Docker: 8080 (no 80)
- MySQL docker-compose usa puerto 3307:3306 para evitar conflicto con MySQL local
