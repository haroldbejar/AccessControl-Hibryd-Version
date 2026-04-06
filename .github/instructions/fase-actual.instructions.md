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
- [x] **1.5 API Controllers** — ExceptionMiddleware, Program.cs (Serilog + Swagger/OpenAPI JWT + CORS + HealthChecks), BaseController, 9 controllers (32 endpoints totales). Build: 0 errores, 0 warnings. Campos de auditoría (UserEliminated/UserModified) hardcodeados como `1` — se reemplazarán con userId del JWT en 1.6.
- [ ] **1.6 JWT Authentication**
- [ ] **1.7 Testing**
- [ ] **1.8 Documentación y Deploy**

---

## Subfase actual: 1.6 — JWT Authentication

### Objetivo

Proteger los endpoints con autenticación JWT Bearer. El `AuthController.Login` ya existe y devuelve `LoginResponse` — falta generar el token real y validarlo en cada request.

### Tareas

- `JwtTokenService` en Infrastructure — genera el JWT firmado con clave secreta, expira en X minutos
- `LoginCommandHandler` — reemplaza la lógica de retorno por llamada a `JwtTokenService`
- `LoginResponse` — incluir `Token` (string) y `Expiration` (DateTime)
- `appsettings.json` — sección `Jwt` con `Key`, `Issuer`, `Audience`, `ExpiresInMinutes`
- `Program.cs` — activar `UseAuthentication()` + configurar `AddJwtBearer` con parámetros de `appsettings`
- Controllers — agregar `[Authorize]` a todos excepto `AuthController`
- Reemplazar `1` hardcodeado en `UserEliminated`/`UserModified` por `userId` extraído del claim JWT

### Notas técnicas

- Paquete ya referenciado: `Microsoft.AspNetCore.Authentication.JwtBearer 9.0.14`
- Claim a usar para userId: `ClaimTypes.NameIdentifier` o claim personalizado `uid`
- `AuthController` debe quedar con `[AllowAnonymous]`
