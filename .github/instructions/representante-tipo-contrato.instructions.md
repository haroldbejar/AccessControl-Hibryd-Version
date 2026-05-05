---
name: "Tipo de Representante + Fecha de Contrato"
description: "Plan para añadir RepresentativeType (Propietario/Arrendatario) y ContractEndDate (nullable) a la entidad Representative, con visualización informativa en visitas."
applyTo: "src/**,frontend/src/features/representatives/**,frontend/src/features/visits/**"
---

> ⚠️ Este archivo define el plan de implementación para el tipo de representante y fecha de contrato. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Permitir distinguir si un representante es **Propietario** o **Arrendatario (Inquilino)** y, opcionalmente, registrar la fecha de vencimiento del contrato. Estos datos son puramente informativos: no bloquean ningún flujo, no generan alertas automáticas y no afectan la lógica de reservas ni visitas.

---

## Decisiones de diseño confirmadas

| Decisión                   | Valor                                                                        |
| -------------------------- | ---------------------------------------------------------------------------- |
| Enum valores               | `Owner = 1` (Propietario), `Tenant = 2` (Arrendatario)                       |
| Default                    | `Owner` — registros existentes no se rompen (valor por defecto en migración) |
| `ContractEndDate`          | `DateOnly?` nullable — propietario no suele tener fecha de contrato          |
| Campo condicional frontend | Date picker visible solo si `representativeType === Tenant`                  |
| Lógica de negocio          | Ninguna — sin bloqueos, sin alertas por vencimiento, solo informativo        |
| Chip en CreateVisitDialog  | Solo lectura; visible solo si el representante elegido es Arrendatario       |
| Patrón respuesta API       | `Ok(result.Value)` → `response.data` (igual que Representatives existente)   |
| Migración                  | `AddRepresentativeTypeAndContract` — no destructiva                          |
| Archivos nuevos            | 1 enum backend + 0 frontend (usa const-object)                               |
| Archivos editados backend  | 6: entidad, config EF, response DTO, 2 commands + handlers, mapper           |
| Archivos editados frontend | 5: types, create dialog, edit dialog, page, visit dialog                     |

---

## Estado de implementación

- [x] **Fase 1** — Domain: enum + entidad ✅ Build: 0 errores
- [x] **Fase 2** — Infrastructure: EF config + migración ✅ Build: 0 errores
- [ ] **Fase 3** — Application CQRS: DTOs, commands, handlers, mapper
- [ ] **Fase 4** — Frontend: types, forms, tabla, chip en visitas

---

## Fase 1 — Domain

### 1.1 `src/AccessControl.Domain/Enums/RepresentativeTypeEnum.cs` (NUEVO)

```csharp
namespace AccessControl.Domain.Enums;

public enum RepresentativeTypeEnum
{
    Owner = 1,   // Propietario
    Tenant = 2   // Arrendatario / Inquilino
}
```

### 1.2 Editar `src/AccessControl.Domain/Entities/Representative.cs`

Añadir al final de la clase (antes del cierre `}`):

```csharp
// Tipo de representante y datos de contrato
public RepresentativeTypeEnum RepresentativeType { get; set; } = RepresentativeTypeEnum.Owner;
public DateOnly? ContractEndDate { get; set; }

// [NotMapped] descriptor legible
[System.ComponentModel.DataAnnotations.Schema.NotMapped]
public string RepresentativeTypeDescription => RepresentativeType switch
{
    RepresentativeTypeEnum.Owner  => "Propietario",
    RepresentativeTypeEnum.Tenant => "Arrendatario",
    _ => "Desconocido"
};
```

### Verificación Fase 1

```
dotnet build → 0 errores
```

---

## Fase 2 — Infrastructure

### 2.1 Editar `src/AccessControl.Infrastucture/Persistence/Configurations/RepresentativeConfiguration.cs`

Añadir dentro del método `Configure`, después de las propiedades existentes:

```csharp
builder.Property(r => r.RepresentativeType)
    .HasConversion<int>()
    .HasColumnName("RepresentativeType")
    .HasDefaultValue(RepresentativeTypeEnum.Owner);

builder.Property(r => r.ContractEndDate)
    .HasColumnType("date")
    .HasColumnName("ContractEndDate")
    .IsRequired(false);
```

### 2.2 Migración

```bash
dotnet ef migrations add AddRepresentativeTypeAndContract \
  --project src/AccessControl.Infrastucture \
  --startup-project src/AccessControl.API

dotnet ef database update \
  --project src/AccessControl.Infrastucture \
  --startup-project src/AccessControl.API
```

> La columna `RepresentativeType` tendrá `DEFAULT 1` → todos los registros existentes quedan como Propietario sin intervención manual.

### Verificación Fase 2

```
dotnet build → 0 errores
# Verificar en MySQL: tabla Representatives con columnas RepresentativeType (int, NOT NULL, DEFAULT 1) y ContractEndDate (date, NULL)
```

---

## Fase 3 — Application CQRS

### 3.1 Editar `RepresentativeResponse.cs`

**Ruta:** `src/AccessControl.Application/Features/Representatives/Dtos/RepresentativeResponse.cs`

Añadir los dos nuevos campos al record:

```csharp
public record RepresentativeResponse(
    int Id,
    string Name,
    string? Phone,
    string? CellPhone,
    int DestinationId,
    string DestinationName,
    bool HasVehicle,
    int? VehicleTypeId,
    string? Brand,
    string? Model,
    string? Color,
    string? Plate,
    int RepresentativeType,              // ← NUEVO
    string RepresentativeTypeDescription, // ← NUEVO (from [NotMapped])
    DateOnly? ContractEndDate,            // ← NUEVO
    bool Visible
);
```

### 3.2 Editar `CreateRepresentativeCommand.cs` y su Handler

**Ruta:** `src/AccessControl.Application/Features/Representatives/Commands/CreateRepresentative/`

Añadir parámetros al record command:

```csharp
public sealed record CreateRepresentativeCommand(
    string Name,
    string? Phone,
    string? CellPhone,
    int DestinationId,
    bool HasVehicle,
    int? VehicleTypeId,
    string? Brand,
    string? Model,
    string? Color,
    string? Plate,
    int RepresentativeType,        // ← NUEVO (default 1 en el controller si no se envía)
    DateOnly? ContractEndDate,     // ← NUEVO
    string UserCreated
) : IRequest<Result<RepresentativeResponse>>;
```

En el handler, al crear la entidad, asignar:

```csharp
var representative = new Representative
{
    Name = request.Name,
    Phone = request.Phone,
    CellPhone = request.CellPhone,
    DestinationId = request.DestinationId,
    HasVehicle = request.HasVehicle,
    VehicleTypeId = request.VehicleTypeId,
    Brand = request.Brand,
    Model = request.Model,
    Color = request.Color,
    Plate = request.Plate,
    RepresentativeType = (RepresentativeTypeEnum)request.RepresentativeType,  // ← NUEVO
    ContractEndDate = request.ContractEndDate,                                  // ← NUEVO
    UserCreated = request.UserCreated,
};
```

### 3.3 Editar `UpdateRepresentativeCommand.cs` y su Handler

**Ruta:** `src/AccessControl.Application/Features/Representatives/Commands/UpdateRepresentative/`

Mismo patrón — añadir los dos campos al command y asignarlos en el handler:

```csharp
representative.RepresentativeType = (RepresentativeTypeEnum)request.RepresentativeType;
representative.ContractEndDate = request.ContractEndDate;
```

### 3.4 Editar `RepresentativeMapper.cs`

**Ruta:** `src/AccessControl.Application/Common/Mappings/RepresentativeMapper.cs`

Si el mapper usa Mapperly, añadir los campos en el método de mapeo `ToResponse`:

```csharp
RepresentativeType = (int)r.RepresentativeType,
RepresentativeTypeDescription = r.RepresentativeTypeDescription,
ContractEndDate = r.ContractEndDate,
```

### Verificación Fase 3

```
dotnet build → 0 errores
dotnet test → todos los tests pasan
# Probar POST /api/representatives con representativeType: 2, contractEndDate: "2026-12-31"
# GET /api/representatives → los nuevos campos aparecen en la respuesta
```

---

## Fase 4 — Frontend

### 4.1 Editar `representative.types.ts`

**Ruta:** `frontend/src/features/representatives/types/representative.types.ts`

Añadir el const-object enum y los nuevos campos:

```ts
// Enum de tipo de representante (const-object pattern)
export const RepresentativeTypeEnum = {
    Owner: 1,
    Tenant: 2,
} as const;
export type RepresentativeType =
    (typeof RepresentativeTypeEnum)[keyof typeof RepresentativeTypeEnum];

export const representativeTypeLabels: Record<RepresentativeType, string> = {
    [RepresentativeTypeEnum.Owner]: "Propietario",
    [RepresentativeTypeEnum.Tenant]: "Arrendatario",
};

// Actualizar las interfaces existentes:
export interface RepresentativeResponse {
    // ...campos existentes...
    representativeType: RepresentativeType; // ← NUEVO
    representativeTypeDescription: string; // ← NUEVO
    contractEndDate: string | null; // ← NUEVO (formato "yyyy-MM-dd")
}

export interface CreateRepresentativeRequest {
    // ...campos existentes...
    representativeType: RepresentativeType; // ← NUEVO
    contractEndDate: string | null; // ← NUEVO
}

export interface UpdateRepresentativeRequest {
    // ...campos existentes...
    representativeType: RepresentativeType; // ← NUEVO
    contractEndDate: string | null; // ← NUEVO
}
```

### 4.2 Editar `CreateRepresentativeDialog.tsx`

**Ruta:** `frontend/src/features/representatives/components/CreateRepresentativeDialog.tsx`

**Schema Zod** — añadir:

```ts
representativeType: z.number().int().min(1).max(2).default(1),
contractEndDate: z.string().nullable().optional(),
```

**Formulario** — añadir **antes** del bloque de vehículo existente:

```tsx
{
    /* Tipo de representante */
}
<div className="space-y-2">
    <Label htmlFor="representativeType">Tipo de representante</Label>
    <Select
        value={String(watch("representativeType") ?? 1)}
        onValueChange={(v) =>
            setValue("representativeType", Number(v) as RepresentativeType)
        }
    >
        <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="1">Propietario</SelectItem>
            <SelectItem value="2">Arrendatario</SelectItem>
        </SelectContent>
    </Select>
</div>;

{
    /* Fecha de fin de contrato (solo si Arrendatario) */
}
{
    watch("representativeType") === RepresentativeTypeEnum.Tenant && (
        <div className="space-y-2">
            <Label htmlFor="contractEndDate">
                Fecha de vencimiento del contrato
            </Label>
            <Input
                id="contractEndDate"
                type="date"
                {...register("contractEndDate")}
            />
        </div>
    );
}
```

**Al enviar** — incluir los nuevos campos en el payload:

```ts
representativeType: data.representativeType ?? RepresentativeTypeEnum.Owner,
contractEndDate: data.contractEndDate ?? null,
```

### 4.3 Editar `EditRepresentativeDialog.tsx`

Mismo patrón que `CreateRepresentativeDialog.tsx`. Asegurar que `reset()` incluya los dos nuevos campos al cargar el representante:

```ts
reset({
    // ...campos existentes...
    representativeType: representative.representativeType,
    contractEndDate: representative.contractEndDate,
});
```

### 4.4 Editar `RepresentativesPage.tsx`

Añadir columna **Tipo** en la tabla (antes de Estado):

```tsx
<TableHead>Tipo</TableHead>

// En cada fila:
<TableCell>
    <Badge variant={rep.representativeType === RepresentativeTypeEnum.Tenant ? "secondary" : "outline"}>
        {rep.representativeTypeDescription}
    </Badge>
    {rep.contractEndDate && (
        <p className="text-xs text-muted-foreground mt-0.5">
            Hasta: {format(parseISO(rep.contractEndDate), "dd/MM/yyyy")}
        </p>
    )}
</TableCell>
```

### 4.5 Editar `CreateVisitDialog.tsx`

**Ruta:** `frontend/src/features/visits/components/CreateVisitDialog.tsx`

Añadir un chip informativo de solo lectura cuando el representante seleccionado es Arrendatario. Colocarlo **debajo del select de representante**, visible solo si aplica:

```tsx
{
    /* Chip informativo si el representante es Arrendatario */
}
{
    selectedRepresentative &&
        selectedRepresentative.representativeType ===
            RepresentativeTypeEnum.Tenant && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                <span className="font-medium">Arrendatario</span>
                {selectedRepresentative.contractEndDate && (
                    <span>
                        — Contrato hasta:{" "}
                        {format(
                            parseISO(selectedRepresentative.contractEndDate),
                            "dd/MM/yyyy",
                        )}
                    </span>
                )}
            </div>
        );
}
```

> `selectedRepresentative` se deriva del array `representatives` filtrando por el `representativeId` seleccionado en el form (patrón ya existente en el dialog con `useWatch` o `watch`).

### Verificación Fase 4

```
npm run build → 0 errores
# Flujo crear representante:
#  → tipo "Arrendatario" → aparece campo fecha de contrato
#  → tipo "Propietario" → campo fecha oculto
# Tabla representantes: badge "Propietario" / "Arrendatario" + fecha si aplica
# CreateVisitDialog: chip amarillo si el representante elegido es Arrendatario
```

---

## Archivos a crear / editar — resumen

### Backend (1 nuevo + 6 editados)

```
src/AccessControl.Domain/
  Enums/RepresentativeTypeEnum.cs                             ← NUEVO
  Entities/Representative.cs                                  ← EDITAR

src/AccessControl.Infrastucture/
  Persistence/Configurations/RepresentativeConfiguration.cs   ← EDITAR

src/AccessControl.Application/
  Features/Representatives/Dtos/RepresentativeResponse.cs     ← EDITAR
  Features/Representatives/Commands/CreateRepresentative/...  ← EDITAR (command + handler)
  Features/Representatives/Commands/UpdateRepresentative/...  ← EDITAR (command + handler)
  Common/Mappings/RepresentativeMapper.cs                     ← EDITAR
```

### Frontend (0 nuevos + 5 editados)

```
frontend/src/features/representatives/
  types/representative.types.ts                               ← EDITAR
  components/CreateRepresentativeDialog.tsx                   ← EDITAR
  components/EditRepresentativeDialog.tsx                     ← EDITAR
  RepresentativesPage.tsx                                     ← EDITAR

frontend/src/features/visits/
  components/CreateVisitDialog.tsx                            ← EDITAR
```

---

## Notas técnicas

- **`DateOnly` en EF Core + MySQL:** requiere `HasColumnType("date")`. EF 8+ soporta `DateOnly` nativamente con el proveedor Pomelo.
- **`[NotMapped]`** en `RepresentativeTypeDescription`: evita que EF intente mapear esta propiedad calculada a columna.
- **Const-object pattern** en frontend: consistent con `VehicleTypeEnum`, `ReservationStatusEnum` ya existentes en el proyecto.
- **`format(parseISO(...), "dd/MM/yyyy")`**: `date-fns` ya es dependencia del proyecto.
- **`RepresentativeTypeEnum.Owner` como default** en el payload de create: si el usuario no selecciona tipo, se envía `1` (Propietario).
- **Tests existentes**: no se rompen — los campos nuevos son opcionales o tienen default. Verificar que los mocks de `RepresentativeResponse` en tests incluyan los nuevos campos si los tests fallan.

---

## Verificación final end-to-end

- [ ] `dotnet build` → 0 errores
- [ ] `dotnet test` → todos los tests pasan
- [ ] Migración aplicada: columnas `RepresentativeType` (DEFAULT 1) y `ContractEndDate` (NULL) en tabla `Representatives`
- [ ] `POST /api/representatives` con `{ "representativeType": 2, "contractEndDate": "2026-12-31" }` → 201
- [ ] `GET /api/representatives` → campo `representativeType`, `representativeTypeDescription` y `contractEndDate` en cada objeto
- [ ] `npm run build` → 0 errores
- [ ] UI: selector de tipo en crear/editar representante
- [ ] UI: campo fecha condicional (solo visible si Arrendatario)
- [ ] UI: tabla muestra badge tipo + fecha si aplica
- [ ] UI: CreateVisitDialog muestra chip amarillo al seleccionar representante Arrendatario
