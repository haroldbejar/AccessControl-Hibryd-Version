# AccessControl Backend API

API REST en .NET 9 para el sistema de control de acceso de conjuntos residenciales.  
Modernización del sistema legado WPF — Fase 1 (Backend).

## Arquitectura

Clean Architecture con CQRS:

```
src/
├── AccessControl.Domain/         # Entidades, enums, interfaces, excepciones
├── AccessControl.Application/    # Casos de uso (Commands/Queries), CQRS con MediatR
├── AccessControl.Infrastucture/  # EF Core 9 + Pomelo MySQL, repositorios, UnitOfWork
└── AccessControl.API/            # Controllers, middleware, Program.cs
tests/
├── AccessControl.Domain.Tests/        # 33 tests — entidades y excepciones
├── AccessControl.Application.Tests/   # 20 tests — handlers CQRS
└── AccessControl.API.IntegrationTests/ # 6 tests — endpoint /api/auth/login
```

## Stack tecnológico

| Capa          | Tecnología                             |
| ------------- | -------------------------------------- |
| Runtime       | .NET 9                                 |
| ORM           | Entity Framework Core 9 + Pomelo MySQL |
| Base de datos | MySQL 8.0+                             |
| Autenticación | JWT (HS256)                            |
| CQRS          | MediatR 14                             |
| Validación    | FluentValidation 12                    |
| Mapeo         | Riok.Mapperly 4                        |
| Logging       | Serilog + Console + File               |
| Documentación | Swagger (Swashbuckle 6.9)              |
| Testing       | xUnit + FluentAssertions + NSubstitute |

## Requisitos previos

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9)
- MySQL 8.0+ (local, XAMPP, o Docker)
- Git

## Setup local

### 1. Clonar el repositorio

```bash
git clone https://github.com/haroldbejar/AccessControl-Hibryd-Version.git
cd AccessControl-Hibryd-Version
```

### 2. Configurar appsettings

Crea `src/AccessControl.API/appsettings.Development.json` con tus valores:

```json
{
    "ConnectionStrings": {
        "DefaultConnection": "Server=localhost;Port=3306;Database=accesscontrol;User=root;Password=tu_password;"
    },
    "Jwt": {
        "Key": "TuClaveSecretaDe32CaracteresMinimo!!",
        "Issuer": "AccessControl.API",
        "Audience": "AccessControl.Client",
        "ExpiresInMinutes": "60"
    },
    "Serilog": {
        "MinimumLevel": {
            "Default": "Information"
        }
    }
}
```

### 3. Crear la base de datos

```bash
dotnet ef database update --project src/AccessControl.Infrastucture --startup-project src/AccessControl.API
```

### 4. Ejecutar la API

```bash
dotnet run --project src/AccessControl.API
```

Swagger disponible en: `http://localhost:5000` (entorno Development)

### 5. Ejecutar los tests

```bash
dotnet test
```

Resultado esperado: **59 tests — 0 fallos**

## Ejecutar con Docker

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Levantar API + MySQL

```bash
cp .env.example .env
# editar .env con tus valores
docker compose up --build
```

La API quedará disponible en `http://localhost:8080`.

## Endpoints

Todos los endpoints (excepto `/api/auth/login`) requieren header:  
`Authorization: Bearer {token}`

### Auth

| Método | Ruta              | Descripción          |
| ------ | ----------------- | -------------------- |
| `POST` | `/api/auth/login` | Login — devuelve JWT |

### Visitas

| Método   | Ruta                                    | Descripción                                                                                 |
| -------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `GET`    | `/api/visits`                           | Listar visitas (filtros: startDate, endDate, documentFilter, nameFilter, destinationFilter) |
| `GET`    | `/api/visits/{id}`                      | Obtener visita por ID                                                                       |
| `GET`    | `/api/visits/document/{documentNumber}` | Obtener visita por documento                                                                |
| `POST`   | `/api/visits`                           | Registrar visita                                                                            |
| `PATCH`  | `/api/visits/{documentNumber}/checkout` | Registrar salida                                                                            |
| `DELETE` | `/api/visits/{id}`                      | Eliminar visita                                                                             |

### Paquetes

| Método   | Ruta                         | Descripción                                                                                     |
| -------- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `GET`    | `/api/packages`              | Listar paquetes (filtros: startDate, endDate, controlNumber, senderName, destinationId, status) |
| `GET`    | `/api/packages/pending`      | Listar paquetes pendientes                                                                      |
| `GET`    | `/api/packages/{id}`         | Obtener paquete por ID                                                                          |
| `POST`   | `/api/packages`              | Registrar paquete                                                                               |
| `PATCH`  | `/api/packages/{id}/deliver` | Registrar entrega                                                                               |
| `DELETE` | `/api/packages/{id}`         | Eliminar paquete                                                                                |

### Usuarios

| Método   | Ruta              | Descripción            |
| -------- | ----------------- | ---------------------- |
| `GET`    | `/api/users`      | Listar usuarios        |
| `GET`    | `/api/users/{id}` | Obtener usuario por ID |
| `POST`   | `/api/users`      | Crear usuario          |
| `PUT`    | `/api/users/{id}` | Actualizar usuario     |
| `DELETE` | `/api/users/{id}` | Eliminar usuario       |

### Destinatarios, Representantes, Roles, Menús, Autorizaciones

| Método   | Ruta                        | Descripción                                 |
| -------- | --------------------------- | ------------------------------------------- |
| `GET`    | `/api/destinations`         | Listar destinatarios                        |
| `POST`   | `/api/destinations`         | Crear destinatario                          |
| `DELETE` | `/api/destinations/{id}`    | Eliminar destinatario                       |
| `GET`    | `/api/representatives`      | Listar por destinatario (`?destinationId=`) |
| `POST`   | `/api/representatives`      | Crear representante                         |
| `PUT`    | `/api/representatives/{id}` | Actualizar representante                    |
| `DELETE` | `/api/representatives/{id}` | Eliminar representante                      |
| `GET`    | `/api/roles`                | Listar roles                                |
| `POST`   | `/api/roles`                | Crear rol                                   |
| `GET`    | `/api/menus`                | Listar menús                                |
| `GET`    | `/api/authorizations`       | Obtener autorizaciones por rol (`?roleId=`) |
| `PUT`    | `/api/authorizations`       | Actualizar autorizaciones de un rol         |

### Sistema

| Método | Ruta      | Descripción  |
| ------ | --------- | ------------ |
| `GET`  | `/health` | Health check |
