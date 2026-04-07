# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar archivos de proyecto para restaurar dependencias (cache layer)
COPY ["src/AccessControl.API/AccessControl.API.csproj",               "src/AccessControl.API/"]
COPY ["src/AccessControl.Application/AccessControl.Application.csproj", "src/AccessControl.Application/"]
COPY ["src/AccessControl.Domain/AccessControl.Domain.csproj",           "src/AccessControl.Domain/"]
COPY ["src/AccessControl.Infrastucture/AccessControl.Infrastructure.csproj", "src/AccessControl.Infrastucture/"]

RUN dotnet restore "src/AccessControl.API/AccessControl.API.csproj"

# Copiar el resto del código fuente
COPY src/ src/

# Publicar en modo Release
RUN dotnet publish "src/AccessControl.API/AccessControl.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Usuario no-root por seguridad (OWASP A05)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copiar artefactos publicados
COPY --from=build /app/publish .

# Crear directorio de logs con permisos correctos
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app/logs

USER appuser

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "AccessControl.API.dll"]
