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
- [ ] **1.7 Testing**
- [ ] **1.8 Documentación y Deploy**

---

## Subfase actual: 1.7 — Testing

### Objetivo

Cubrir con pruebas automatizadas las capas Domain, Application e Integration (API).

### Proyectos de test disponibles

- `tests/AccessControl.Domain.Tests/` — xUnit
- `tests/AccessControl.Application.Tests/` — xUnit
- `tests/AccessControl.API.IntegrationTests/` — xUnit

### Prioridades sugeridas

- Application: handlers críticos (LoginCommandHandler, CreateVisitCommandHandler, CreatePackageCommandHandler)
- Domain: validaciones de entidades y excepciones
- Integration: endpoint `/api/auth/login` (happy path + credenciales inválidas)

### Notas técnicas

- Stack: xUnit + FluentAssertions + NSubstitute (mocks)
- Para integration tests: `WebApplicationFactory<Program>` + base de datos en memoria o SQLite
