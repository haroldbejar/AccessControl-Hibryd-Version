---
name: "Perfil de Usuario — Cambio de Contraseña"
description: "Plan de implementación para que cualquier usuario autenticado pueda cambiar su propia contraseña desde la UI."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de implementación del módulo Perfil de Usuario. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Permitir que cualquier usuario autenticado (admin o portero) cambie su propia contraseña desde la UI sin necesidad de que el administrador intervenga. El flujo requiere confirmar la contraseña actual antes de aceptar la nueva.

---

## Decisiones de arquitectura confirmadas

| Decisión            | Valor                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------- |
| Endpoint nuevo      | `PATCH /api/users/{id}/change-password`                                                |
| Auth                | `[Authorize]` — cualquier rol autenticado; el backend valida que `id == CurrentUserId` |
| Validación backend  | `currentPassword` verificada con BCrypt antes de aplicar el cambio                     |
| Hash nuevo password | BCrypt (igual que `CreateUserCommandHandler`)                                          |
| Patrón respuesta    | `Ok()` (sin body) / `BadRequest(error)` — igual que `UpdateUser`                       |
| Frontend accede     | `response.data` directo (patrón `Ok(result.Value)` de `UsersController`)               |
| Acceso UI           | Menú desplegable en el Avatar/nombre del topbar — visible para todos los roles         |
| Ubicación UI        | Topbar → dropdown con "Mi perfil" → dialog de cambio de contraseña                     |
| Archivos nuevos     | 3 backend + 2 frontend                                                                 |
| Archivos editados   | 1 backend (`UsersController`) + 1 frontend (`MainLayout.tsx`)                          |

---

## Estado de implementación

- [x] **Fase A** — Backend: Command + Handler + Validator ✅ Build: 0 errores
- [x] **Fase B** — Backend: Endpoint en `UsersController` ✅ Build: 0 errores
- [x] **Fase C** — Frontend: service + hook ✅ Build: 0 errores
- [x] **Fase D** — Frontend: `ChangePasswordDialog` + integración en topbar ✅ Build: 0 errores

---

## Fase A — Backend: Command, Handler y Validator

### A.1 `ChangePasswordCommand.cs` (NUEVO)

**Ruta:** `src/AccessControl.Application/Features/Users/Commands/ChangePassword/ChangePasswordCommand.cs`

```csharp
using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.ChangePassword;

public sealed record ChangePasswordCommand(
    int Id,
    string CurrentPassword,
    string NewPassword
) : IRequest<Result>;
```

### A.2 `ChangePasswordCommandHandler.cs` (NUEVO)

**Ruta:** `src/AccessControl.Application/Features/Users/Commands/ChangePassword/ChangePasswordCommandHandler.cs`

```csharp
using AccessControl.Application.Common.Models;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.ChangePassword;

internal sealed class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public ChangePasswordCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        var user = await _uow.Users.GetByIdAsync(request.Id, ct);
        if (user is null)
            return Result.Failure("Usuario no encontrado.");

        // Verificar contraseña actual con BCrypt
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
            return Result.Failure("La contraseña actual es incorrecta.");

        // Hashear y guardar nueva contraseña
        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UserModified = request.Id;

        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
```

> **Nota:** `BCrypt.Net.BCrypt` ya es dependencia del proyecto (usada en `CreateUserCommandHandler`). No requiere NuGet adicional.

> **Nota:** `user.UserModified = request.Id` — el modificador es el propio usuario (auto-servicio).

### A.3 `ChangePasswordCommandValidator.cs` (NUEVO)

**Ruta:** `src/AccessControl.Application/Features/Users/Commands/ChangePassword/ChangePasswordCommandValidator.cs`

```csharp
using FluentValidation;

namespace AccessControl.Application.Features.Users.Commands.ChangePassword;

public sealed class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Id de usuario inválido.");

        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("La contraseña actual es requerida.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("La nueva contraseña es requerida.")
            .MinimumLength(6).WithMessage("La nueva contraseña debe tener al menos 6 caracteres.")
            .MaximumLength(100).WithMessage("La nueva contraseña no puede superar 100 caracteres.")
            .NotEqual(x => x.CurrentPassword).WithMessage("La nueva contraseña debe ser diferente a la actual.");
    }
}
```

### Verificación Fase A

```
dotnet build → 0 errores
```

---

## Fase B — Backend: Endpoint en `UsersController`

### B.1 Editar `UsersController.cs`

**Ruta:** `src/AccessControl.API/Controllers/UsersController.cs`

Agregar import:

```csharp
using AccessControl.Application.Features.Users.Commands.ChangePassword;
```

Agregar endpoint dentro de la clase (antes del cierre `}`):

```csharp
[HttpPatch("{id:int}/change-password")]
public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request, CancellationToken ct)
{
    // Seguridad: el usuario solo puede cambiar su propia contraseña
    if (id != CurrentUserId)
        return Forbid();

    var command = new ChangePasswordCommand(id, request.CurrentPassword, request.NewPassword);
    var result = await _mediator.Send(command, ct);
    return result.IsSuccess ? Ok() : BadRequest(result.Error);
}
```

Agregar record DTO al final del archivo (fuera de la clase o en un archivo separado):

```csharp
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
```

> **Nota:** `CurrentUserId` ya está disponible en `BaseController` (usado en `DeleteUserCommand`). No requiere cambios en la base.

### Verificación Fase B

```
dotnet run → probar PATCH /api/users/{id}/change-password con Swagger o HTTP client
```

**Casos a probar:**

- `id` distinto al `CurrentUserId` del JWT → 403 Forbidden
- `currentPassword` incorrecta → 400 `"La contraseña actual es incorrecta."`
- `newPassword` igual a la actual → 400 (validación FluentValidation)
- `newPassword` menor de 6 chars → 400
- Todo correcto → 200 OK sin body

---

## Fase C — Frontend: service y hook

### C.1 Editar `userService.ts`

**Ruta:** `frontend/src/features/users/api/userService.ts`

Añadir al objeto `userService`:

```typescript
changePassword: (id: number, currentPassword: string, newPassword: string) =>
    api.patch(`/users/${id}/change-password`, { currentPassword, newPassword }),
```

### C.2 Editar `useUsers.ts`

**Ruta:** `frontend/src/features/users/hooks/useUsers.ts`

Añadir hook:

```typescript
export function useChangePassword() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            currentPassword,
            newPassword,
        }: {
            id: number;
            currentPassword: string;
            newPassword: string;
        }) => userService.changePassword(id, currentPassword, newPassword),
        onSuccess: () => {
            toast.success("Contraseña actualizada correctamente.");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(
                error.response?.data?.message ??
                    "Error al cambiar la contraseña.",
            );
        },
    });
}
```

### Verificación Fase C

```
npm run build → 0 errores
```

---

## Fase D — Frontend: Dialog + integración en topbar

### D.1 `ChangePasswordDialog.tsx` (NUEVO)

**Ruta:** `frontend/src/features/users/components/ChangePasswordDialog.tsx`

- Props: `{ open: boolean; onClose: () => void }`
- Usa `useAuthStore` para obtener `userId` del usuario actual
- Usa `useChangePassword` hook
- Formulario con React Hook Form + Zod:

```typescript
const schema = z
    .object({
        currentPassword: z.string().min(1, "Requerida"),
        newPassword: z
            .string()
            .min(6, "Mínimo 6 caracteres")
            .max(100, "Máximo 100 caracteres"),
        confirmPassword: z.string().min(1, "Requerida"),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });
```

- 3 campos tipo `password` con toggle show/hide (ícono `Eye`/`EyeOff` de lucide)
- Al submit: llama `changePassword.mutate({ id: userId, currentPassword, newPassword })`
- En `onSuccess` (via `useChangePassword`): toast + `onClose()`
- Fields: "Contraseña actual" | "Nueva contraseña" | "Confirmar nueva contraseña"

**Estructura del dialog:**

```tsx
<Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
                Ingresa tu contraseña actual y la nueva contraseña.
            </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 3 campos password con toggle */}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={changePassword.isPending}>
                    {changePassword.isPending
                        ? "Guardando..."
                        : "Cambiar contraseña"}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
</Dialog>
```

### D.2 Editar `MainLayout.tsx`

**Ruta:** `frontend/src/layouts/MainLayout.tsx`

Añadir import:

```typescript
import { KeyRound, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChangePasswordDialog from "@/features/users/components/ChangePasswordDialog";
```

Añadir estado local:

```typescript
const [changePasswordOpen, setChangePasswordOpen] = useState(false);
```

Reemplazar el botón de logout actual por un `DropdownMenu` que agrupe:

```tsx
{
    /* ANTES: solo botón logout */
}
{
    /* DESPUÉS: DropdownMenu con nombre del usuario + opciones */
}
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
            <span className="text-sm font-medium hidden sm:block">
                {user?.name}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
            <KeyRound className="h-4 w-4 mr-2" />
            Cambiar contraseña
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>;

{
    /* Dialog */
}
<ChangePasswordDialog
    open={changePasswordOpen}
    onClose={() => setChangePasswordOpen(false)}
/>;
```

> **Nota:** El toggle Sun/Moon permanece intacto antes del DropdownMenu.

> **ShadCN DropdownMenu:** verificar si ya está instalado con `npx shadcn@latest add dropdown-menu` si no existe en `components/ui/`.

### Verificación Fase D

```
npm run build → 0 errores
```

**Flujo a probar:**

1. Login como portero → topbar muestra nombre + chevron
2. Click → dropdown con "Cambiar contraseña" + "Cerrar sesión"
3. "Cambiar contraseña" → dialog abre
4. Contraseña actual incorrecta → toast de error
5. Nueva contraseña < 6 chars → error de validación Zod (sin llamada al backend)
6. Contraseña nueva ≠ confirmación → error de validación Zod
7. Todo correcto → toast "Contraseña actualizada correctamente." + dialog cierra
8. Login con contraseña anterior → falla (confirma que el cambio fue efectivo)

---

## Archivos a crear / editar — resumen

### Backend (3 nuevos + 1 editado)

```
src/AccessControl.Application/Features/Users/Commands/ChangePassword/
  ChangePasswordCommand.cs                  ← NUEVO
  ChangePasswordCommandHandler.cs           ← NUEVO
  ChangePasswordCommandValidator.cs         ← NUEVO

src/AccessControl.API/Controllers/
  UsersController.cs                        ← EDITAR (1 endpoint + 1 record DTO)
```

### Frontend (1 nuevo + 2 editados)

```
frontend/src/features/users/
  components/ChangePasswordDialog.tsx       ← NUEVO
  api/userService.ts                        ← EDITAR (1 método)
  hooks/useUsers.ts                         ← EDITAR (1 hook)

frontend/src/layouts/
  MainLayout.tsx                            ← EDITAR (dropdown + dialog)
```

---

## Notas técnicas

- **`CurrentUserId`** ya existe en `BaseController` (se usa en `DeleteUserCommand`). El endpoint lo usa para verificar que el usuario solo cambie su propia contraseña.
- **BCrypt** ya es dependencia del proyecto. No se requiere NuGet adicional.
- **FluentValidation** ya registrado via `AddValidatorsFromAssembly` en `DependencyInjection.cs`. El validator se registra automáticamente.
- **ShadCN DropdownMenu** — verificar si ya está instalado antes de Fase D.
- **`ChangePasswordRequest` DTO** — puede ir en el mismo archivo `UsersController.cs` como record, o en un archivo separado en `Dtos/`. Patrón ya usado en `PhotoSessionsController.cs` con `UploadPhotoRequest`.
- **Toast** — usar el sistema ya existente en el proyecto (Sonner u otro ya configurado).
- **Seguridad:** la validación `id != CurrentUserId` en el controller es la primera línea de defensa. El handler valida adicionalmente la contraseña actual con BCrypt.

---

## Verificación final end-to-end

- [ ] `dotnet build` → 0 errores
- [ ] `npm run build` → 0 errores
- [ ] PATCH con `id` ajeno → 403 Forbidden
- [ ] PATCH con contraseña actual incorrecta → 400 con mensaje claro
- [ ] PATCH correcto → 200 OK, login posterior con nueva contraseña funciona
- [ ] UI: dropdown visible para todos los roles (admin y portero)
- [ ] Dialog: 3 campos con toggle show/hide, validación Zod client-side
- [ ] Toast de éxito/error funcionando
- [ ] Toggle Moon/Sun del topbar no afectado
