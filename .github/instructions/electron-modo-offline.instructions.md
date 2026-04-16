---
name: "Electron — Modo Offline (Desktop App)"
description: "Plan detallado de implementación del wrapper Electron con API embebida, SQLite, Dexie.js y sincronización offline/online."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de implementación del modo offline con Electron. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Empaquetar la SPA React existente como una aplicación de escritorio Windows/macOS usando Electron, con la API .NET 9 embebida en el proceso principal. El sistema debe funcionar **completamente sin internet**, usando SQLite como base de datos local, y sincronizar automáticamente con el servidor cloud cuando se recupere la conexión.

---

## Contexto: dos tipos de clientes

| Tipo                 | Descripción                              | Tecnología                   |
| -------------------- | ---------------------------------------- | ---------------------------- |
| **Offline (60-70%)** | PC en portería sin internet, monousuario | Electron + SQLite + Dexie.js |
| **Online (30-40%)**  | Multi-usuario en red local o cloud       | Browser PWA + MySQL          |

El mismo código React funciona en ambos casos. La diferencia es el entorno que lo ejecuta.

---

## Decisiones de arquitectura confirmadas

| Decisión                     | Valor                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| Wrapper desktop              | Electron 28+                                                                             |
| Empaquetado                  | Electron Builder 24+ (NSIS para Windows, DMG para macOS)                                 |
| API embebida                 | `child_process.spawn` del binario `dotnet AccessControl.API.dll`                         |
| Puerto API local             | `5192` (mismo que en desarrollo — sin cambios en frontend)                               |
| Base de datos offline        | SQLite via `Microsoft.EntityFrameworkCore.Sqlite`                                        |
| Detección de proveedor       | Variable de entorno `DB_PROVIDER=sqlite` o `mysql`                                       |
| Cache frontend               | Dexie.js (IndexedDB wrapper) — caché local primaria                                      |
| IDs en entidades             | **No se migran** los int PKs — se agrega campo `ClientId` (Guid) no-breaking             |
| Módulos con soporte offline  | `Visit` y `Package` únicamente (primera iteración)                                       |
| Módulos solo lectura offline | `User`, `Destination`, `Representative`, `CommonArea`, `Reservation`                     |
| Resolución de conflictos     | Last-Write-Wins (LWW) por `ModifiedAt`                                                   |
| Auto-updater                 | `electron-updater` + GitHub Releases                                                     |
| NPM nuevos                   | `electron`, `electron-builder`, `electron-updater`, `dexie`, `concurrently`, `cross-env` |
| NuGet nuevos                 | `Microsoft.EntityFrameworkCore.Sqlite`                                                   |

---

## Estado de implementación

- [ ] **Fase A** — Electron wrapper básico: ventana + Vite renderer
- [ ] **Fase B** — API .NET embebida: spawn, salud, IPC
- [ ] **Fase C** — SQLite como proveedor offline en el backend
- [ ] **Fase D** — Dexie.js + `useNetworkStatus` en el frontend
- [ ] **Fase E** — `ClientId` + `SyncStatus` en entidades + tabla `SyncLog`
- [ ] **Fase F** — `SyncService`: push + pull + merge
- [ ] **Fase G** — Electron Builder: instalador + auto-updater

---

## Fase A — Electron Wrapper básico

### Objetivo

Abrir la React SPA en una ventana Electron nativa. En esta fase el frontend sigue apuntando a la API externa (no embebida aún). Prueba que el scaffolding funciona.

### Instalación

```bash
cd frontend
npm install --save-dev electron@28 electron-builder@24 concurrently cross-env
npm install electron-updater
```

### A.1 `frontend/electron/main.ts` (NUEVO)

```ts
import { app, BrowserWindow, shell } from "electron";
import path from "path";

const isDev = process.env.NODE_ENV === "development";
const VITE_DEV_URL = "http://localhost:5174";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "Access Control",
        show: false,
    });

    if (isDev) {
        mainWindow.loadURL(VITE_DEV_URL);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }

    mainWindow.once("ready-to-show", () => mainWindow?.show());

    // Abrir links externos en el browser, no en Electron
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

### A.2 `frontend/electron/preload.ts` (NUEVO)

```ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    isElectron: true,
    onApiReady: (callback: () => void) =>
        ipcRenderer.once("api-ready", callback),
    onApiError: (callback: (msg: string) => void) =>
        ipcRenderer.once("api-error", (_event, msg) => callback(msg)),
    getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
```

### A.3 `frontend/electron/tsconfig.json` (NUEVO)

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "lib": ["ES2020"],
        "outDir": "../dist-electron",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "resolveJsonModule": true
    },
    "include": ["**/*.ts"],
    "exclude": ["node_modules"]
}
```

### A.4 Editar `frontend/package.json`

Agregar campo `main` y nuevos scripts:

```json
{
    "main": "dist-electron/main.js",
    "scripts": {
        "electron:dev": "concurrently -k \"cross-env NODE_ENV=development npm run dev\" \"npm run electron:compile -- --watch\" \"sleep 3 && electron .\"",
        "electron:compile": "tsc -p electron/tsconfig.json",
        "electron:build": "npm run build && npm run electron:compile && electron-builder",
        "electron:preview": "npm run build && npm run electron:compile && electron ."
    }
}
```

### A.5 `frontend/electron-builder.yml` (NUEVO — configuración básica)

```yaml
appId: com.accesscontrol.desktop
productName: Access Control
directories:
    output: release
    buildResources: public
files:
    - dist/**/*
    - dist-electron/**/*
    - node_modules/**/*
    - package.json
win:
    target: nsis
    icon: public/icon.ico
mac:
    target: dmg
    icon: public/icon.icns
nsis:
    oneClick: false
    allowToChangeInstallationDirectory: true
    installerIcon: public/icon.ico
    uninstallerIcon: public/icon.ico
    createDesktopShortcut: true
    createStartMenuShortcut: true
```

### Verificación Fase A

```bash
npm run electron:dev
# → Ventana Electron abre la SPA de React
# → DevTools disponibles (F12)
# → Login funciona (apunta a API externa corriendo en :5192)
```

---

## Fase B — API .NET embebida en Electron

### Objetivo

El proceso principal de Electron lanza el binario `dotnet` con la API. La React SPA no necesita ningún cambio — ya apunta a `localhost:5192`. Electron lo gestiona todo en el background.

### B.1 `frontend/electron/api-server.ts` (NUEVO)

```ts
import { ChildProcess, spawn } from "child_process";
import path from "path";
import http from "http";

const API_PORT = 5192;
const API_HEALTH_URL = `http://localhost:${API_PORT}/health`;
const MAX_WAIT_MS = 30_000;
const POLL_INTERVAL_MS = 500;

let apiProcess: ChildProcess | null = null;

function getApiPath(): string {
    const app = require("electron").app;
    if (process.env.NODE_ENV === "development") {
        // En dev: usar dotnet run
        return "";
    }
    // En producción: binario publicado junto al Electron app
    return path.join(
        path.dirname(app.getPath("exe")),
        "resources",
        "api",
        "AccessControl.API.dll",
    );
}

export function startApi(): Promise<void> {
    return new Promise((resolve, reject) => {
        const isDev = process.env.NODE_ENV === "development";

        if (isDev) {
            // En desarrollo, asumir que la API ya está corriendo
            resolve();
            return;
        }

        const apiDll = getApiPath();
        apiProcess = spawn("dotnet", [apiDll], {
            env: {
                ...process.env,
                ASPNETCORE_ENVIRONMENT: "Offline",
                DB_PROVIDER: "sqlite",
                ASPNETCORE_URLS: `http://localhost:${API_PORT}`,
            },
            stdio: ["ignore", "pipe", "pipe"],
        });

        apiProcess.stdout?.on("data", (data) =>
            console.log("[API]", data.toString()),
        );
        apiProcess.stderr?.on("data", (data) =>
            console.error("[API ERROR]", data.toString()),
        );

        apiProcess.on("error", (err) => reject(err));
        apiProcess.on("exit", (code) => {
            if (code !== 0) reject(new Error(`API exited with code ${code}`));
        });

        waitForApi(MAX_WAIT_MS, POLL_INTERVAL_MS).then(resolve).catch(reject);
    });
}

export function stopApi(): void {
    if (apiProcess) {
        apiProcess.kill();
        apiProcess = null;
    }
}

function waitForApi(maxMs: number, intervalMs: number): Promise<void> {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const poll = () => {
            http.get(API_HEALTH_URL, (res) => {
                if (res.statusCode === 200) {
                    resolve();
                } else if (Date.now() - start < maxMs) {
                    setTimeout(poll, intervalMs);
                } else {
                    reject(new Error("API health check timeout"));
                }
            }).on("error", () => {
                if (Date.now() - start < maxMs) {
                    setTimeout(poll, intervalMs);
                } else {
                    reject(new Error("API health check timeout"));
                }
            });
        };
        poll();
    });
}
```

### B.2 Editar `frontend/electron/main.ts` — integrar API server

Modificar para lanzar la API antes de mostrar la ventana:

```ts
// Añadir imports
import { startApi, stopApi } from "./api-server";
import { ipcMain } from "electron";

// Antes de createWindow():
ipcMain.handle("get-app-version", () => app.getVersion());

app.whenReady().then(async () => {
    createWindow(); // crea ventana oculta (show: false)

    try {
        await startApi();
        mainWindow?.webContents.send("api-ready");
        mainWindow?.show();
    } catch (err) {
        mainWindow?.webContents.send("api-error", String(err));
        mainWindow?.show(); // mostrar de todos modos para mostrar el error
    }
});

app.on("before-quit", () => stopApi());
```

### B.3 `frontend/src/shared/hooks/useElectron.ts` (NUEVO)

```ts
declare global {
    interface Window {
        electronAPI?: {
            isElectron: boolean;
            onApiReady: (cb: () => void) => void;
            onApiError: (cb: (msg: string) => void) => void;
            getAppVersion: () => Promise<string>;
        };
    }
}

export function useElectron() {
    const isElectron =
        typeof window !== "undefined" && !!window.electronAPI?.isElectron;
    return { isElectron };
}
```

### B.4 `frontend/src/shared/components/ApiLoadingScreen.tsx` (NUEVO)

Pantalla de splash que se muestra mientras la API embebida inicia:

```tsx
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Status = "loading" | "ready" | "error";

export default function ApiLoadingScreen({
    children,
}: {
    children: React.ReactNode;
}) {
    const isElectron = !!window.electronAPI?.isElectron;
    const [status, setStatus] = useState<Status>(
        isElectron ? "loading" : "ready",
    );
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!isElectron) return;
        window.electronAPI?.onApiReady(() => setStatus("ready"));
        window.electronAPI?.onApiError((msg) => {
            setErrorMsg(msg);
            setStatus("error");
        });
    }, [isElectron]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                    Iniciando Access Control...
                </p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <p className="text-destructive font-semibold">
                    Error al iniciar el servicio
                </p>
                <p className="text-xs text-muted-foreground max-w-sm text-center">
                    {errorMsg}
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
```

### B.5 Editar `frontend/src/main.tsx`

Envolver `<App />` con `<ApiLoadingScreen>`:

```tsx
import ApiLoadingScreen from "@/shared/components/ApiLoadingScreen";

// En render():
<ApiLoadingScreen>
    <App />
</ApiLoadingScreen>;
```

### B.6 Backend: `src/AccessControl.API/appsettings.Offline.json` (NUEVO)

```json
{
    "DatabaseProvider": "sqlite",
    "ConnectionStrings": {
        "DefaultConnection": "Data Source=accesscontrol.db"
    },
    "Logging": {
        "LogLevel": {
            "Default": "Warning"
        }
    }
}
```

### Verificación Fase B

```bash
npm run electron:preview
# → Splash screen "Iniciando Access Control..." visible ~2-3 segundos
# → Ventana principal abre automáticamente cuando la API está lista
# → Login funciona contra la API embebida en localhost:5192
# → Al cerrar Electron: proceso dotnet también termina (verificar Task Manager)
```

---

## Fase C — SQLite como proveedor offline en el backend

### Objetivo

El backend detecta si debe usar MySQL o SQLite según la variable de entorno/appsettings. Sin cambios en los repositorios ni en la lógica de negocio existente.

### Instalación

```bash
dotnet add src/AccessControl.API package Microsoft.EntityFrameworkCore.Sqlite
dotnet add src/AccessControl.Infrastucture package Microsoft.EntityFrameworkCore.Sqlite
```

### C.1 Editar `src/AccessControl.Infrastucture/DependencyInjection.cs`

```csharp
// Leer el proveedor de BD (variable de entorno tiene prioridad sobre appsettings)
var dbProvider = Environment.GetEnvironmentVariable("DB_PROVIDER")
    ?? configuration["DatabaseProvider"]
    ?? "mysql";

services.AddDbContext<AppDbContext>(options =>
{
    if (dbProvider.Equals("sqlite", StringComparison.OrdinalIgnoreCase))
    {
        var sqliteConn = configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=accesscontrol.db";
        options.UseSqlite(sqliteConn);
    }
    else
    {
        var mysqlConn = configuration.GetConnectionString("DefaultConnection")!;
        options.UseMySql(mysqlConn, ServerVersion.AutoDetect(mysqlConn));
    }
});
```

### C.2 Migraciones SQLite

SQLite tiene limitaciones con EF Core (no soporta ALTER TABLE avanzado). Se necesita un segundo conjunto de migraciones:

```bash
# Crear carpeta de migraciones SQLite
dotnet ef migrations add InitialSqlite \
  --project src/AccessControl.Infrastucture \
  --startup-project src/AccessControl.API \
  --context AppDbContext \
  --output-dir Persistence/Migrations/Sqlite \
  -- --DatabaseProvider=sqlite
```

### C.3 Editar `src/AccessControl.Infrastucture/Persistence/AppDbContext.cs`

Configurar tipos específicos de SQLite que difieren de MySQL:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // SQLite no soporta TimeOnly / DateOnly nativamente
    // → mapear a string "HH:mm" y "yyyy-MM-dd"
    if (Database.IsSqlite())
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(TimeOnly) || property.ClrType == typeof(TimeOnly?))
                    property.SetColumnType("TEXT");
                if (property.ClrType == typeof(DateOnly) || property.ClrType == typeof(DateOnly?))
                    property.SetColumnType("TEXT");
            }
        }
    }
}
```

### C.4 Editar `src/AccessControl.API/Program.cs`

Añadir health check compatible con ambos proveedores:

```csharp
// Reemplazar el health check existente de MySQL por uno genérico:
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");
```

### Verificación Fase C

```bash
# Modo SQLite
DB_PROVIDER=sqlite dotnet run --project src/AccessControl.API
# → dotnet build → 0 errores
# → GET /health → 200 OK
# → GET /api/auth/login con admin/Admin123! → token JWT válido
# → Base de datos accesscontrol.db creada en el directorio de trabajo
# → Tablas creadas correctamente en SQLite (verificar con DB Browser for SQLite)
```

---

## Fase D — Dexie.js + `useNetworkStatus`

### Objetivo

Añadir IndexedDB como capa de persistencia local en el frontend. El hook `useNetworkStatus` detecta si hay conexión al backend (no solo al internet general — un PC offline puede tener red local pero sin el cloud).

### Instalación

```bash
npm install dexie --legacy-peer-deps
```

### D.1 `frontend/src/lib/db.ts` (NUEVO)

```ts
import Dexie, { type Table } from "dexie";
import type { VisitResponse } from "@/features/visits/types/visit.types";
import type { PackageResponse } from "@/features/packages/types/package.types";

export interface OfflineVisit extends VisitResponse {
    clientId: string; // UUID generado en cliente
    syncStatus: "pending" | "synced" | "conflict";
    localCreatedAt: string; // ISO timestamp local
}

export interface OfflinePackage extends PackageResponse {
    clientId: string;
    syncStatus: "pending" | "synced" | "conflict";
    localCreatedAt: string;
}

export class AccessControlDB extends Dexie {
    visits!: Table<OfflineVisit>;
    packages!: Table<OfflinePackage>;

    constructor() {
        super("AccessControlDB");
        this.version(1).stores({
            visits: "++id, clientId, syncStatus, checkIn, destinationId",
            packages: "++id, clientId, syncStatus, controlNumber, status",
        });
    }
}

export const db = new AccessControlDB();
```

### D.2 `frontend/src/shared/hooks/useNetworkStatus.ts` (NUEVO)

Detecta conectividad real con el backend (no solo `navigator.onLine`):

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import apiClient from "@/lib/apiClient";

const CHECK_INTERVAL_MS = 30_000;
const HEALTH_ENDPOINT = "/health";

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const checkConnectivity = useCallback(async () => {
        try {
            await apiClient.get(HEALTH_ENDPOINT, { timeout: 5000 });
            setIsOnline(true);
        } catch {
            setIsOnline(false);
        } finally {
            setLastChecked(new Date());
        }
    }, []);

    useEffect(() => {
        checkConnectivity();
        intervalRef.current = setInterval(checkConnectivity, CHECK_INTERVAL_MS);
        window.addEventListener("online", checkConnectivity);
        window.addEventListener("offline", () => setIsOnline(false));

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            window.removeEventListener("online", checkConnectivity);
            window.removeEventListener("offline", () => setIsOnline(false));
        };
    }, [checkConnectivity]);

    return { isOnline, lastChecked, checkConnectivity };
}
```

### D.3 `frontend/src/shared/components/OfflineBanner.tsx` (NUEVO)

```tsx
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/shared/hooks/useNetworkStatus";

export default function OfflineBanner() {
    const { isOnline } = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="w-full bg-amber-500 text-white text-xs text-center py-1.5 flex items-center justify-center gap-2 z-50">
            <WifiOff className="h-3.5 w-3.5" />
            Modo sin conexión — los cambios se sincronizarán cuando se recupere
            la conexión
        </div>
    );
}
```

### D.4 Editar `frontend/src/layouts/MainLayout.tsx`

Añadir `<OfflineBanner />` en la parte superior del layout (antes del `<aside>`):

```tsx
import OfflineBanner from "@/shared/components/OfflineBanner";

// En el return, antes del <div className="flex h-screen...">:
<>
    <OfflineBanner />
    <div className="flex h-screen bg-background">...</div>
</>;
```

### Verificación Fase D

```bash
npm run build → 0 errores
# Desactivar la API manualmente → banner amarillo aparece en ~30 segundos
# Reactivar la API → banner desaparece en el siguiente ciclo de check
# IndexedDB "AccessControlDB" visible en DevTools → Application → IndexedDB
```

---

## Fase E — `ClientId` + `SyncStatus` en entidades + tabla `SyncLog`

### Objetivo

Añadir de forma **no destructiva** los campos necesarios para la sincronización a las entidades `Visit` y `Package`. Los int PKs no cambian — se agrega un `ClientId` (Guid) generado en cliente.

### E.1 Editar `src/AccessControl.Domain/Enums/SyncStatusEnum.cs` (NUEVO)

```csharp
namespace AccessControl.Domain.Enums;

public enum SyncStatusEnum
{
    Pending = 0,   // creado offline, pendiente de enviar
    Synced = 1,    // sincronizado con el servidor
    Conflict = 2   // conflicto detectado, requiere resolución
}
```

### E.2 Editar `src/AccessControl.Domain/Entities/Visit.cs`

Añadir al final de la clase:

```csharp
// Soporte offline
public Guid? ClientId { get; set; }          // UUID generado en cliente (nullable para registros pre-existentes)
public SyncStatusEnum SyncStatus { get; set; } = SyncStatusEnum.Synced;
public DateTime? LocalCreatedAt { get; set; }
```

### E.3 Editar `src/AccessControl.Domain/Entities/Package.cs`

Igual que Visit:

```csharp
public Guid? ClientId { get; set; }
public SyncStatusEnum SyncStatus { get; set; } = SyncStatusEnum.Synced;
public DateTime? LocalCreatedAt { get; set; }
```

### E.4 Nueva entidad `src/AccessControl.Domain/Entities/SyncLog.cs` (NUEVO)

```csharp
using AccessControl.Domain.Common;
using AccessControl.Domain.Enums;

namespace AccessControl.Domain.Entities;

public class SyncLog : BaseEntity
{
    public string EntityType { get; set; } = string.Empty;  // "Visit", "Package"
    public int? EntityId { get; set; }                       // int PK del servidor (null si nuevo)
    public Guid ClientId { get; set; }                       // UUID del cliente
    public string Action { get; set; } = string.Empty;       // "INSERT", "UPDATE"
    public SyncStatusEnum SyncStatus { get; set; } = SyncStatusEnum.Pending;
    public DateTime? SyncedAt { get; set; }
    public string? Payload { get; set; }                     // JSON del objeto completo
    public string? ErrorMessage { get; set; }
}
```

### E.5 Configuraciones EF Core

**`src/AccessControl.Infrastucture/Persistence/Configurations/VisitConfiguration.cs`** — añadir al método `Configure`:

```csharp
builder.Property(v => v.ClientId).HasColumnName("ClientId");
builder.Property(v => v.SyncStatus).HasConversion<int>();
builder.Property(v => v.LocalCreatedAt).HasColumnName("LocalCreatedAt");
// Índice para búsqueda rápida por ClientId durante sync
builder.HasIndex(v => v.ClientId).HasDatabaseName("IX_Visits_ClientId");
```

**`src/AccessControl.Infrastucture/Persistence/Configurations/PackageConfiguration.cs`** — ídem para Package.

**`src/AccessControl.Infrastucture/Persistence/Configurations/SyncLogConfiguration.cs`** (NUEVO):

```csharp
using AccessControl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public class SyncLogConfiguration : IEntityTypeConfiguration<SyncLog>
{
    public void Configure(EntityTypeBuilder<SyncLog> builder)
    {
        builder.ToTable("SyncLogs");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.EntityType).IsRequired().HasMaxLength(50);
        builder.Property(s => s.Action).IsRequired().HasMaxLength(20);
        builder.Property(s => s.SyncStatus).HasConversion<int>();
        builder.Property(s => s.Payload).HasColumnType("longtext");
        builder.HasIndex(s => s.SyncStatus).HasDatabaseName("IX_SyncLogs_Status");
        builder.HasIndex(s => new { s.EntityType, s.ClientId })
               .HasDatabaseName("IX_SyncLogs_EntityType_ClientId");
    }
}
```

### E.6 Migración

```bash
dotnet ef migrations add AddClientIdAndSyncLog \
  --project src/AccessControl.Infrastucture \
  --startup-project src/AccessControl.API

dotnet ef database update \
  --project src/AccessControl.Infrastucture \
  --startup-project src/AccessControl.API
```

### E.7 Actualizar `frontend/src/lib/db.ts`

```ts
// Agregar SyncLog local
export interface LocalSyncEntry {
  id?: number;
  clientId: string;
  entityType: "visit" | "package";
  action: "INSERT" | "UPDATE";
  payload: string; // JSON serializado
  createdAt: string;
}

// En AccessControlDB, añadir tabla:
syncQueue!: Table<LocalSyncEntry>;

// En version(1).stores():
syncQueue: "++id, clientId, entityType, action"
```

### Verificación Fase E

```bash
dotnet build → 0 errores
# Verificar migración aplicada: tablas Visits y Packages tienen columnas ClientId, SyncStatus
# Tabla SyncLogs creada con los índices correctos
npm run build → 0 errores
```

---

## Fase F — SyncService: push + pull + merge

### Objetivo

Servicio de background en el frontend que, cuando detecta conexión, toma los registros de la cola local (`syncQueue` en Dexie) y los envía al backend. Luego descarga los cambios del servidor.

### F.1 Nuevos endpoints en el backend (síncronos para Fase F)

**`src/AccessControl.API/Controllers/SyncController.cs`** (NUEVO)

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

[ApiController]
[Route("api/sync")]
[Authorize]
public class SyncController : BaseController
{
    // POST /api/sync/visits — recibe lista de visitas creadas offline
    [HttpPost("visits")]
    public async Task<IActionResult> SyncVisits(
        [FromBody] SyncVisitsRequest request,
        CancellationToken ct)
    {
        // Por implementar en el handler
        return Ok();
    }

    // POST /api/sync/packages — recibe lista de paquetes creados offline
    [HttpPost("packages")]
    public async Task<IActionResult> SyncPackages(
        [FromBody] SyncPackagesRequest request,
        CancellationToken ct)
    {
        return Ok();
    }

    // GET /api/sync/delta?since={datetime} — devuelve cambios desde una fecha
    [HttpGet("delta")]
    public async Task<IActionResult> GetDelta([FromQuery] DateTime since, CancellationToken ct)
    {
        return Ok();
    }
}

public record SyncVisitsRequest(List<SyncVisitItem> Items);
public record SyncVisitItem(Guid ClientId, object Payload); // tipado completo en implementation
public record SyncPackagesRequest(List<SyncPackageItem> Items);
public record SyncPackageItem(Guid ClientId, object Payload);
```

### F.2 `frontend/src/sync/SyncService.ts` (NUEVO)

```ts
import { db } from "@/lib/db";
import apiClient from "@/lib/apiClient";

export class SyncService {
    private isSyncing = false;

    async syncAll(): Promise<void> {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            await this.pushPendingVisits();
            await this.pushPendingPackages();
            await this.pullDelta();
        } finally {
            this.isSyncing = false;
        }
    }

    private async pushPendingVisits(): Promise<void> {
        const pending = await db.syncQueue
            .where("entityType")
            .equals("visit")
            .toArray();

        if (pending.length === 0) return;

        const items = pending.map((entry) => ({
            clientId: entry.clientId,
            payload: JSON.parse(entry.payload),
        }));

        try {
            const { data } = await apiClient.post("/sync/visits", { items });
            // Marcar como sincronizados
            for (const result of data.results ?? []) {
                await db.syncQueue
                    .where("clientId")
                    .equals(result.clientId)
                    .delete();
                // Actualizar el registro local con el ID del servidor
                await db.visits
                    .where("clientId")
                    .equals(result.clientId)
                    .modify({ id: result.serverId, syncStatus: "synced" });
            }
        } catch (err) {
            console.error("[SyncService] Error pushing visits:", err);
        }
    }

    private async pushPendingPackages(): Promise<void> {
        const pending = await db.syncQueue
            .where("entityType")
            .equals("package")
            .toArray();

        if (pending.length === 0) return;

        const items = pending.map((entry) => ({
            clientId: entry.clientId,
            payload: JSON.parse(entry.payload),
        }));

        try {
            const { data } = await apiClient.post("/sync/packages", { items });
            for (const result of data.results ?? []) {
                await db.syncQueue
                    .where("clientId")
                    .equals(result.clientId)
                    .delete();
                await db.packages
                    .where("clientId")
                    .equals(result.clientId)
                    .modify({ id: result.serverId, syncStatus: "synced" });
            }
        } catch (err) {
            console.error("[SyncService] Error pushing packages:", err);
        }
    }

    private async pullDelta(): Promise<void> {
        // Obtener el timestamp del último pull exitoso
        const lastSync = localStorage.getItem("access-control-last-sync");
        const since = lastSync ?? new Date(0).toISOString();

        try {
            const { data } = await apiClient.get(`/sync/delta?since=${since}`);
            // Merge estrategia: server wins para registros existentes
            if (data.visits?.length) {
                await db.visits.bulkPut(
                    data.visits.map((v: any) => ({
                        ...v,
                        syncStatus: "synced",
                    })),
                );
            }
            if (data.packages?.length) {
                await db.packages.bulkPut(
                    data.packages.map((p: any) => ({
                        ...p,
                        syncStatus: "synced",
                    })),
                );
            }
            localStorage.setItem(
                "access-control-last-sync",
                new Date().toISOString(),
            );
        } catch (err) {
            console.error("[SyncService] Error pulling delta:", err);
        }
    }
}

export const syncService = new SyncService();
```

### F.3 `frontend/src/sync/useSyncStatus.ts` (NUEVO)

```ts
import { useEffect, useRef, useState } from "react";
import { syncService } from "./SyncService";
import { useNetworkStatus } from "@/shared/hooks/useNetworkStatus";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useSyncStatus() {
    const { isOnline } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const prevOnline = useRef(false);

    const pendingCount = useLiveQuery(() => db.syncQueue.count(), [], 0);

    useEffect(() => {
        // Disparar sync cuando se recupera la conexión
        if (isOnline && !prevOnline.current && pendingCount! > 0) {
            setIsSyncing(true);
            syncService.syncAll().finally(() => setIsSyncing(false));
        }
        prevOnline.current = isOnline;
    }, [isOnline, pendingCount]);

    return { isSyncing, pendingCount: pendingCount ?? 0 };
}
```

### F.4 Integrar sync en `OfflineBanner`

```tsx
// Añadir al OfflineBanner cuando isOnline y hay pendientes:
{
    isOnline && pendingCount > 0 && (
        <div className="w-full bg-blue-500 text-white text-xs text-center py-1.5 flex items-center justify-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Sincronizando {pendingCount} registro{pendingCount !== 1 ? "s" : ""}{" "}
            pendiente{pendingCount !== 1 ? "s" : ""}...
        </div>
    );
}
```

### Verificación Fase F

```bash
dotnet build → 0 errores
npm run build → 0 errores
# Flujo manual a probar:
# 1. Desconectar API → banner amarillo
# 2. Registrar una visita → guardada en Dexie, syncStatus: 'pending'
# 3. Reconectar API → banner azul "Sincronizando 1 registro..."
# 4. Visita aparece en MySQL → syncStatus: 'synced'
```

---

## Fase G — Electron Builder: instalador + auto-updater

### Objetivo

Generar un instalador `.exe` (Windows NSIS) y `.dmg` (macOS) que incluya la app React, el binario .NET publicado, y un sistema de auto-actualización via GitHub Releases.

### G.1 Publicar el backend para distribución

```bash
dotnet publish src/AccessControl.API \
  -c Release \
  -r win-x64 \
  --self-contained false \
  -o ./publish/api
```

### G.2 `frontend/electron-builder.yml` — configuración completa

```yaml
appId: com.accesscontrol.desktop
productName: Access Control
copyright: Copyright © 2026

directories:
    output: release
    buildResources: build-resources

files:
    - dist/**/*
    - dist-electron/**/*
    - "!node_modules/**/*"

extraResources:
    - from: ../publish/api
      to: api
      filter:
          - "**/*"

win:
    target:
        - target: nsis
          arch: [x64]
    icon: build-resources/icon.ico

mac:
    target:
        - target: dmg
          arch: [x64, arm64]
    icon: build-resources/icon.icns
    category: public.app-category.productivity

nsis:
    oneClick: false
    perMachine: true
    allowToChangeInstallationDirectory: true
    deleteAppDataOnUninstall: false
    createDesktopShortcut: true
    createStartMenuShortcut: true
    shortcutName: Access Control

publish:
    provider: github
    owner: haroldbejar
    repo: AccessControl-Hibryd-Version
    releaseType: release
```

### G.3 `frontend/electron/auto-updater.ts` (NUEVO)

```ts
import { autoUpdater } from "electron-updater";
import { BrowserWindow, dialog } from "electron";
import log from "electron-log";

autoUpdater.logger = log;
autoUpdater.autoDownload = false;

export function setupAutoUpdater(win: BrowserWindow) {
    autoUpdater.on("update-available", (info) => {
        dialog
            .showMessageBox(win, {
                type: "info",
                title: "Actualización disponible",
                message: `Versión ${info.version} disponible. ¿Descargar ahora?`,
                buttons: ["Sí", "No"],
            })
            .then(({ response }) => {
                if (response === 0) autoUpdater.downloadUpdate();
            });
    });

    autoUpdater.on("update-downloaded", () => {
        dialog
            .showMessageBox(win, {
                type: "info",
                title: "Listo para instalar",
                message:
                    "La actualización se instalará al reiniciar la aplicación.",
                buttons: ["Reiniciar ahora", "Más tarde"],
            })
            .then(({ response }) => {
                if (response === 0) autoUpdater.quitAndInstall();
            });
    });

    autoUpdater.on("error", (err) => {
        log.error("Auto-updater error:", err);
    });

    // Verificar actualizaciones al inicio (solo en producción)
    if (process.env.NODE_ENV !== "development") {
        autoUpdater.checkForUpdates();
    }
}
```

### G.4 Editar `frontend/electron/main.ts` — integrar auto-updater

```ts
import { setupAutoUpdater } from "./auto-updater";

// Dentro de createWindow(), después de mainWindow.show():
if (process.env.NODE_ENV !== "development") {
    setupAutoUpdater(mainWindow);
}
```

### G.5 Scripts de build final en `package.json`

```json
"scripts": {
  "electron:build:win": "npm run build && npm run electron:compile && electron-builder --win",
  "electron:build:mac": "npm run build && npm run electron:compile && electron-builder --mac",
  "electron:release": "npm run build && npm run electron:compile && electron-builder --publish always"
}
```

### Verificación Fase G

```bash
npm run electron:build:win
# → Carpeta release/ generada con:
#   - Access Control Setup x.x.x.exe  (instalador NSIS)
#   - Access Control-x.x.x.exe        (portable)
# Instalar → shortcut en escritorio
# Abrir → API inicia, splash screen, login funciona
# Verificar que accesscontrol.db se crea en %APPDATA%/Access Control/
```

---

## Archivos a crear / editar — resumen

### Frontend (12 nuevos + 5 editados)

```
frontend/
  electron/
    main.ts                                     ← NUEVO
    preload.ts                                  ← NUEVO
    api-server.ts                               ← NUEVO
    auto-updater.ts                             ← NUEVO
    tsconfig.json                               ← NUEVO
  electron-builder.yml                          ← NUEVO
  src/
    lib/db.ts                                   ← NUEVO
    sync/
      SyncService.ts                            ← NUEVO
      useSyncStatus.ts                          ← NUEVO
    shared/
      hooks/useElectron.ts                      ← NUEVO
      hooks/useNetworkStatus.ts                 ← NUEVO
      components/ApiLoadingScreen.tsx           ← NUEVO
      components/OfflineBanner.tsx              ← NUEVO
    layouts/MainLayout.tsx                      ← EDITAR (OfflineBanner)
    main.tsx                                    ← EDITAR (ApiLoadingScreen)
  package.json                                  ← EDITAR (main + scripts)
  appsettings.Offline.json                      ← NUEVO (en src/API)
```

### Backend (3 nuevos + 4 editados)

```
src/
  AccessControl.Domain/
    Enums/SyncStatusEnum.cs                     ← NUEVO
    Entities/SyncLog.cs                         ← NUEVO
    Entities/Visit.cs                           ← EDITAR (ClientId, SyncStatus)
    Entities/Package.cs                         ← EDITAR (ClientId, SyncStatus)
  AccessControl.Infrastucture/
    Persistence/Configurations/
      SyncLogConfiguration.cs                   ← NUEVO
      VisitConfiguration.cs                     ← EDITAR (índice ClientId)
      PackageConfiguration.cs                   ← EDITAR (índice ClientId)
    DependencyInjection.cs                      ← EDITAR (SQLite/MySQL switch)
    Persistence/AppDbContext.cs                 ← EDITAR (SQLite type mapping)
  AccessControl.API/
    Controllers/SyncController.cs              ← NUEVO
    appsettings.Offline.json                   ← NUEVO
    Program.cs                                 ← EDITAR (health check genérico)
```

---

## Notas técnicas

- **`dotnet --self-contained false`** en el publish: requiere que el PC de destino tenga .NET 9 Runtime instalado. Alternativa: `--self-contained true` genera un ejecutable standalone (~80MB extra).
- **SQLite y fotos base64**: las fotos de visitantes y paquetes (base64) se almacenan en SQLite en la columna `Photo` (TEXT). Pueden ser pesadas (≈100-200KB cada una). Si la BD crece demasiado, considerar comprimir las fotos antes del sync (ya implementado en `CameraCapture.tsx`).
- **Módulos solo lectura offline**: `User`, `Destination`, `Representative`, `CommonArea`, `Reservation` se sincronizan en el pull pero no admiten creación/edición offline. La UI debe deshabilitar estos botones cuando `!isOnline`.
- **`useLiveQuery` de Dexie**: requiere instalar también `dexie-react-hooks` para el hook reactivo de conteo pendiente en `useSyncStatus`.
- **UUID en `ClientId`**: usar `crypto.randomUUID()` (nativo en browsers modernos y Node 18+) para generar el UUID en el cliente — sin dependencia adicional.
- **Auto-updater en macOS**: requiere que la app esté firmada con un certificado de Apple Developer para distribución fuera del AppStore. En desarrollo se puede omitir.
- **Puerto Kestrel en Electron**: la API embebida usa `ASPNETCORE_URLS=http://localhost:5192` — mismo puerto que en desarrollo. Si el puerto está ocupado, el spawn fallará con error claro en la consola.
- **Conflictos LWW**: si el servidor tiene un registro más reciente (`ModifiedAt > LocalCreatedAt`), el servidor gana. Si el cliente tiene datos nuevos no conocidos por el servidor (nuevo `ClientId`), el cliente siempre gana (INSERT).

---

## Verificación final end-to-end

- [ ] `npm run electron:dev` → ventana desktop abre SPA correctamente
- [ ] Splash screen visible mientras API inicia (~2-3s)
- [ ] Login con `admin / Admin123!` funciona sobre API embebida
- [ ] `DB_PROVIDER=sqlite dotnet run` → `accesscontrol.db` creado, CRUD funcional
- [ ] `useNetworkStatus` → banner amarillo al desconectar API
- [ ] Crear visita offline → guardada en Dexie (`syncStatus: "pending"`)
- [ ] Reconectar → sync automático, visita aparece en servidor
- [ ] `npm run electron:build:win` → instalador `.exe` generado
- [ ] Instalar → shortcut en escritorio, app inicia correctamente
- [ ] Auto-updater: notificación de nueva versión al publicar un release en GitHub
