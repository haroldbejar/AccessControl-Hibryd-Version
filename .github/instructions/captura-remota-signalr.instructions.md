---
name: "Captura Remota de Fotos vía SignalR"
description: "Plan de implementación para capturar fotos desde un celular y enviarlas en tiempo real al PC via SignalR."
applyTo: "**/*"
---

> ⚠️ Este archivo define el plan de implementación de Captura Remota vía SignalR. Leerlo antes de ejecutar cualquier tarea relacionada con esta funcionalidad.

## Propósito

Permitir que el formulario del PC (visitas, paquetes) abra una sesión temporal y muestre un QR; el portero escanea el QR con su celular, toma la foto con la cámara nativa, y la imagen aparece automáticamente en el PC en tiempo real via SignalR WebSocket.

---

## Decisiones de arquitectura confirmadas

| Decisión            | Valor                                                            |
| ------------------- | ---------------------------------------------------------------- |
| Storage fotos       | Base64 en MySQL (sin cambio, igual que hoy)                      |
| Cámara móvil        | `<input type="file" accept="image/*" capture="environment">`     |
| Sesiones            | `ConcurrentDictionary` singleton, expiran 10 min                 |
| Seguridad           | `sessionId` + `token` (GUIDs) en QR URL                          |
| NuGet nuevos        | Ninguno (SignalR incluido en ASP.NET Core)                       |
| NPM nuevos          | `@microsoft/signalr` + `qrcode.react` (con `--legacy-peer-deps`) |
| `CameraCapture.tsx` | Intacto — embebido dentro del nuevo `PhotoCapture.tsx`           |
| CORS                | `SetIsOriginAllowed(_ => true)` + `AllowCredentials()` en dev    |
| Ruta móvil          | `/capture/:sessionId?token=xxx` — pública (sin JWT)              |

---

## Estado de implementación

- [x] **Fase A** — Backend: Hub, servicio de sesiones, controlador, Program.cs
- [x] **Fase B** — Frontend PC: hook, componente PhotoCapture, integración en dialogs
- [x] **Fase C** — Frontend Móvil: MobileCapturePage

---

## Fase A — Backend (3 nuevos + 1 editado)

### A.1 `src/AccessControl.API/Hubs/PhotoHub.cs` (NUEVO)

```csharp
using Microsoft.AspNetCore.SignalR;

namespace AccessControl.API.Hubs;

public class PhotoHub : Hub
{
    public async Task JoinSession(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
    }
}
```

### A.2 `src/AccessControl.API/Services/PhotoSessionService.cs` (NUEVO, singleton)

```csharp
using System.Collections.Concurrent;

namespace AccessControl.API.Services;

public record PhotoSession(string SessionId, string Token, DateTime ExpiresAt);

public class PhotoSessionService
{
    private readonly ConcurrentDictionary<string, PhotoSession> _sessions = new();

    public (string SessionId, string Token) CreateSession()
    {
        var sessionId = Guid.NewGuid().ToString("N");
        var token = Guid.NewGuid().ToString("N");
        var session = new PhotoSession(sessionId, token, DateTime.UtcNow.AddMinutes(10));
        _sessions[sessionId] = session;
        CleanExpired();
        return (sessionId, token);
    }

    public bool ValidateAndConsume(string sessionId, string token)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
            return false;
        if (session.Token != token || session.ExpiresAt < DateTime.UtcNow)
        {
            _sessions.TryRemove(sessionId, out _);
            return false;
        }
        _sessions.TryRemove(sessionId, out _); // uso único
        return true;
    }

    private void CleanExpired()
    {
        var now = DateTime.UtcNow;
        foreach (var key in _sessions.Keys)
        {
            if (_sessions.TryGetValue(key, out var s) && s.ExpiresAt < now)
                _sessions.TryRemove(key, out _);
        }
    }
}
```

### A.3 `src/AccessControl.API/Controllers/PhotoSessionsController.cs` (NUEVO)

```csharp
using AccessControl.API.Hubs;
using AccessControl.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace AccessControl.API.Controllers;

[ApiController]
[Route("api/photo-sessions")]
public class PhotoSessionsController : ControllerBase
{
    private readonly PhotoSessionService _sessionService;
    private readonly IHubContext<PhotoHub> _hub;

    public PhotoSessionsController(PhotoSessionService sessionService, IHubContext<PhotoHub> hub)
    {
        _sessionService = sessionService;
        _hub = hub;
    }

    // Crea una sesión — requiere admin o portero autenticado
    [Authorize]
    [HttpPost]
    public IActionResult CreateSession()
    {
        var (sessionId, token) = _sessionService.CreateSession();
        return Ok(new { sessionId, token });
    }

    // Recibe la foto desde el celular — público (sin JWT)
    [AllowAnonymous]
    [HttpPost("{sessionId}/upload")]
    public async Task<IActionResult> UploadPhoto(string sessionId, [FromBody] UploadPhotoRequest request)
    {
        if (!_sessionService.ValidateAndConsume(sessionId, request.Token))
            return Unauthorized(new { message = "Sesión inválida o expirada." });

        if (string.IsNullOrWhiteSpace(request.Photo))
            return BadRequest(new { message = "La foto es requerida." });

        await _hub.Clients.Group(sessionId).SendAsync("photoReceived", request.Photo);
        return Ok(new { message = "Foto recibida." });
    }
}

public record UploadPhotoRequest(string Token, string Photo);
```

### A.4 `src/AccessControl.API/Program.cs` [EDITAR]

Agregar **después** de `builder.Services.AddControllers()`:

```csharp
builder.Services.AddSignalR();
builder.Services.AddSingleton<PhotoSessionService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalNetwork", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
```

Agregar **después** de `app.UseAuthentication()` / `app.UseAuthorization()`:

```csharp
app.UseCors("LocalNetwork");
app.MapHub<PhotoHub>("/hubs/photo");
```

### Verificación Fase A

```
dotnet build → 0 errores
```

---

## Fase B — Frontend PC (3 nuevos + 3 editados)

### Instalación

```bash
npm install @microsoft/signalr react-qr-code --legacy-peer-deps
```

### B.1 `frontend/src/shared/hooks/useCameraSession.ts` (NUEVO)

```ts
import * as signalR from "@microsoft/signalr";
import { useCallback, useRef, useState } from "react";
import apiClient from "@/lib/apiClient"; // axios instance

type SessionState = "idle" | "connecting" | "waiting" | "received" | "error";

export function useCameraSession(onPhotoReceived: (base64: string) => void) {
    const [state, setState] = useState<SessionState>("idle");
    const [sessionUrl, setSessionUrl] = useState<string | null>(null);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    const generateSession = useCallback(async () => {
        setState("connecting");
        try {
            const { data } = await apiClient.post("/photo-sessions");
            const { sessionId, token } = data;

            const backendHost = window.location.hostname;
            const frontendPort = window.location.port || "5174";
            const url = `http://${backendHost}:${frontendPort}/capture/${sessionId}?token=${token}`;
            setSessionUrl(url);

            const connection = new signalR.HubConnectionBuilder()
                .withUrl(`http://${backendHost}:5192/hubs/photo`)
                .withAutomaticReconnect()
                .build();

            connection.on("photoReceived", (photo: string) => {
                onPhotoReceived(photo);
                setState("received");
                connection.stop();
            });

            await connection.start();
            await connection.invoke("JoinSession", sessionId);
            setState("waiting");
            connectionRef.current = connection;
        } catch {
            setState("error");
        }
    }, [onPhotoReceived]);

    const cancelSession = useCallback(() => {
        connectionRef.current?.stop();
        connectionRef.current = null;
        setState("idle");
        setSessionUrl(null);
    }, []);

    return { state, sessionUrl, generateSession, cancelSession };
}
```

### B.2 `frontend/src/shared/components/PhotoCapture.tsx` (NUEVO)

- Misma firma de props que `CameraCapture`: `{ label, required?, onCapture }`
- Tabs ShadCN: **"Cámara PC"** (embebe `<CameraCapture>`) / **"Usar celular"** (QR + spinner + preview)
- Tab "Usar celular": botón "Generar QR" → llama `generateSession` → muestra QR con `react-qr-code` → spinner "Esperando foto..." → al recibir, muestra preview + badge "✓ Foto recibida"

```tsx
import { useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCode from "react-qr-code";
import CameraCapture from "./CameraCapture";
import { useCameraSession } from "@/shared/hooks/useCameraSession";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    label: string;
    required?: boolean;
    onCapture: (base64: string) => void;
}

export default function PhotoCapture({ label, required, onCapture }: Props) {
    const handlePhoto = useCallback(
        (photo: string) => onCapture(photo),
        [onCapture],
    );
    const { state, sessionUrl, generateSession, cancelSession } =
        useCameraSession(handlePhoto);

    return (
        <Tabs defaultValue="pc">
            <TabsList className="mb-2">
                <TabsTrigger value="pc">Cámara PC</TabsTrigger>
                <TabsTrigger value="mobile">Usar celular</TabsTrigger>
            </TabsList>

            <TabsContent value="pc">
                <CameraCapture
                    label={label}
                    required={required}
                    onCapture={onCapture}
                />
            </TabsContent>

            <TabsContent
                value="mobile"
                className="flex flex-col items-center gap-3"
            >
                {state === "idle" && (
                    <Button variant="outline" onClick={generateSession}>
                        Generar QR
                    </Button>
                )}
                {(state === "connecting" || state === "waiting") &&
                    sessionUrl && (
                        <>
                            <QRCode value={sessionUrl} size={180} />
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Esperando foto del celular...
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelSession}
                            >
                                Cancelar
                            </Button>
                        </>
                    )}
                {state === "received" && (
                    <p className="text-sm text-green-600 font-medium">
                        ✓ Foto recibida
                    </p>
                )}
                {state === "error" && (
                    <p className="text-sm text-destructive">
                        Error al generar sesión.{" "}
                        <button onClick={generateSession} className="underline">
                            Reintentar
                        </button>
                    </p>
                )}
            </TabsContent>
        </Tabs>
    );
}
```

### B.3 `frontend/src/features/visits/components/CreateVisitDialog.tsx` [EDITAR]

Reemplazar los 2 imports + usos de `CameraCapture` → `PhotoCapture`:

```diff
- import CameraCapture from "@/shared/components/CameraCapture";
+ import PhotoCapture from "@/shared/components/PhotoCapture";

- <CameraCapture label="Foto" required onCapture={...} />
+ <PhotoCapture label="Foto" required onCapture={...} />

- <CameraCapture label="Foto 2" onCapture={...} />
+ <PhotoCapture label="Foto 2" onCapture={...} />
```

### B.4 `frontend/src/features/packages/components/RegisterPackageDialog.tsx` [EDITAR]

Reemplazar el import + uso de `CameraCapture` → `PhotoCapture`:

```diff
- import CameraCapture from "@/shared/components/CameraCapture";
+ import PhotoCapture from "@/shared/components/PhotoCapture";

- <CameraCapture label="Foto del paquete" onCapture={...} />
+ <PhotoCapture label="Foto del paquete" onCapture={...} />
```

### B.5 `frontend/src/routes/AppRouter.tsx` [EDITAR]

Agregar ruta pública (fuera de `ProtectedRoute`):

```tsx
const MobileCapturePage = lazy(
    () => import("@/features/capture/MobileCapturePage"),
);

// En el Router, fuera del ProtectedRoute:
<Route path="/capture/:sessionId" element={<MobileCapturePage />} />;
```

---

## Fase C — Frontend Móvil (1 nuevo)

### C.1 `frontend/src/features/capture/MobileCapturePage.tsx` (NUEVO)

- Lee `sessionId` de `useParams()`, `token` de `useSearchParams()`
- Estados: `idle → capturing → sending → done | error`
- `<input type="file" accept="image/*" capture="environment">` oculto → activa cámara nativa
- Convierte imagen a base64 → POST a `http://${window.location.hostname}:5192/api/photo-sessions/${sessionId}/upload`
- UI minimalista, full-screen, optimizada para móvil

```tsx
import { useParams, useSearchParams } from "react-router-dom";
import { useRef, useState } from "react";

type State = "idle" | "sending" | "done" | "error";

export default function MobileCapturePage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const inputRef = useRef<HTMLInputElement>(null);
    const [state, setState] = useState<State>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setState("sending");
        try {
            const base64 = await toBase64(file);
            const backendHost = window.location.hostname;
            const res = await fetch(
                `http://${backendHost}:5192/api/photo-sessions/${sessionId}/upload`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, photo: base64 }),
                },
            );
            if (!res.ok) throw new Error("Sesión inválida o expirada.");
            setState("done");
        } catch (err: unknown) {
            setErrorMsg(
                err instanceof Error ? err.message : "Error desconocido",
            );
            setState("error");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-background">
            <h1 className="text-2xl font-bold text-foreground">
                Captura de Foto
            </h1>

            {state === "idle" && (
                <>
                    <p className="text-muted-foreground text-center">
                        Toca el botón para abrir la cámara y tomar la foto.
                    </p>
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-lg font-medium"
                    >
                        Tomar foto
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleCapture}
                    />
                </>
            )}

            {state === "sending" && (
                <p className="text-muted-foreground">Enviando foto...</p>
            )}

            {state === "done" && (
                <div className="flex flex-col items-center gap-3">
                    <span className="text-5xl">✅</span>
                    <p className="text-green-600 font-semibold text-lg">
                        Foto enviada correctamente
                    </p>
                    <p className="text-muted-foreground text-sm text-center">
                        Puedes cerrar esta página.
                    </p>
                </div>
            )}

            {state === "error" && (
                <div className="flex flex-col items-center gap-3">
                    <span className="text-5xl">❌</span>
                    <p className="text-destructive font-semibold">{errorMsg}</p>
                    <button
                        onClick={() => {
                            setState("idle");
                            setErrorMsg("");
                        }}
                        className="underline text-sm text-muted-foreground"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            )}
        </div>
    );
}

function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Retornar solo la parte base64 (sin el prefijo data:image/...;base64,)
            resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
```

---

## Archivos a crear / editar — resumen

### Backend (3 nuevos + 1 editado)

```
src/AccessControl.API/
  Hubs/PhotoHub.cs                        ← NUEVO
  Services/PhotoSessionService.cs         ← NUEVO
  Controllers/PhotoSessionsController.cs  ← NUEVO
  Program.cs                              ← EDITAR
```

### Frontend (4 nuevos + 3 editados)

```
frontend/src/
  shared/hooks/useCameraSession.ts                          ← NUEVO
  shared/components/PhotoCapture.tsx                        ← NUEVO
  features/capture/MobileCapturePage.tsx                    ← NUEVO
  features/visits/components/CreateVisitDialog.tsx          ← EDITAR
  features/packages/components/RegisterPackageDialog.tsx    ← EDITAR
  routes/AppRouter.tsx                                      ← EDITAR
```

---

## Verificación por fase

- **Fase A:** `dotnet build` → 0 errores. Probar `POST /api/photo-sessions` con JWT, verificar respuesta `{ sessionId, token, networkIp }`.
- **Fase B:** `npm run build` → 0 errores. Abrir dialog de visita → "Usar celular" → aparece QR con IP de red.
- **Fase C:** `npx vite --host` → celular escanea QR → toma foto (comprimida) → foto aparece en PC → registro creado exitosamente.

---

## Flujo completo end-to-end

```
1. Portero abre "Nueva Visita" en PC
2. En campo "Foto" → tab "Usar celular" → click "Generar QR"
3. Frontend: POST /api/photo-sessions → { sessionId, token }
4. Frontend conecta a SignalR Hub /hubs/photo → JoinSession(sessionId)
5. PC muestra QR con URL: http://{host}:5174/capture/{sessionId}?token={token}
6. Portero escanea QR con su celular (misma red WiFi)
7. Celular abre MobileCapturePage → toca "Tomar foto" → cámara nativa
8. Celular: POST /api/photo-sessions/{sessionId}/upload { token, photo }
9. Backend valida token → Hub.Clients.Group(sessionId).SendAsync("photoReceived", photo)
10. PC recibe evento → onPhotoReceived invocado → foto aparece en input
11. Celular muestra "✅ Foto enviada correctamente"
```

---

## Notas técnicas

- **HTTPS no requerido:** `<input capture>` funciona sobre HTTP plano en todos los navegadores móviles (no usa `getUserMedia`)
- **Seguridad:** Token de 1 uso + expiración 10 min + eliminado tras uso
- **`CameraCapture.tsx`:** No se modifica — queda disponible para casos donde el PC tenga cámara
- **Misma red:** PC y celular deben estar en la misma red local (WiFi) — ver sección Producción para internet
- **Puerto backend:** 5192. Kestrel en dev escucha en `0.0.0.0:5192` (launchSettings.json) para que el celular alcance el backend
- **Puerto frontend:** dinámico via `window.location.port` en `useCameraSession`
- **IP de red:** El backend detecta su IP de red local (`NetworkInterface`) y la devuelve en `POST /photo-sessions` → el frontend la usa en la URL del QR y en la URL de SignalR del celular. El PC siempre conecta SignalR por `localhost:5192`
- **Compresión de fotos móviles:** `MobileCapturePage.toBase64()` redimensiona a máx 800px y comprime JPEG 0.8 antes de enviar (igual que `CameraCapture`). Sin esto la foto original del celular (~2MB) genera 500 por `max_allowed_packet` de MySQL
- **QR library:** `qrcode.react@4.2.0` (ESM nativo) — NO usar `react-qr-code` (CJS, incompatible con Vite dev mode, lanza `Element type is invalid: got object`)
- **CORS SignalR:** Requiere `SetIsOriginAllowed(_ => true)` + `AllowCredentials()`. `AllowAnyOrigin()` es incompatible con `credentials: 'include'` que usa SignalR en negotiate

---

## Producción — plan de migración

> Implementación actual funciona en red local (LAN). Para despliegue cloud se requieren los siguientes cambios.

### P.1 URL del QR — eliminar `networkIp` del backend

En producción la IP interna del servidor no es accesible desde internet. El frontend debe construir la URL del QR usando su propio `window.location.origin`:

**Backend `PhotoSessionsController.cs`:** eliminar la detección de `networkIp`, devolver solo `{ sessionId, token }`.

**Frontend `useCameraSession.ts`:** cambiar:

```ts
// PRODUCCIÓN — usar el origen del frontend
const frontendOrigin = window.location.origin; // ej: https://miapp.com
const url = `${frontendOrigin}/capture/${sessionId}?token=${token}`;
```

> En desarrollo sin esta lógica, abrir el frontend desde la IP de red (`http://192.168.x.x:5173`) en lugar de `localhost` para que `window.location.origin` sea la IP correcta.

### P.2 Kestrel — detrás de reverse proxy

Revertir `launchSettings.json` → `http://localhost:5192`. El reverse proxy (nginx/IIS/Azure App Gateway) termina TLS y pasa tráfico internamente.

nginx ejemplo:

```nginx
location /hubs/ {
    proxy_pass http://localhost:5192;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

### P.3 SignalR — escalado horizontal

Con múltiples instancias del backend, el hub del PC puede estar en instancia A y el upload del celular caer en instancia B. Soluciones por orden de complejidad:

**Opción A — Redis Backplane (on-premises / VM):**

```csharp
// Program.cs
builder.Services.AddSignalR()
    .AddStackExchangeRedis("redis:6379");
```

Instalar NuGet: `Microsoft.AspNetCore.SignalR.StackExchangeRedis`

**Opción B — Azure SignalR Service (cloud):**

```csharp
builder.Services.AddSignalR()
    .AddAzureSignalR(Configuration["Azure:SignalR:ConnectionString"]);
```

Instalar NuGet: `Microsoft.Azure.SignalR`
No requiere backplane propio — Azure gestiona el routing entre instancias.

**Opción C — Sticky sessions:** Configurar affinity en el load balancer. Simple pero limita el escalado real.

### P.4 `PhotoSessionService` — sesiones distribuidas

El `ConcurrentDictionary` en memoria no sobrevive múltiples instancias. Migrar a Redis con TTL:

```csharp
// Usando IDistributedCache (Redis)
public async Task<(string SessionId, string Token)> CreateSessionAsync()
{
    var sessionId = Guid.NewGuid().ToString("N");
    var token = Guid.NewGuid().ToString("N");
    await _cache.SetStringAsync(
        $"photo-session:{sessionId}",
        token,
        new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) });
    return (sessionId, token);
}

public async Task<bool> ValidateAndConsumeAsync(string sessionId, string token)
{
    var key = $"photo-session:{sessionId}";
    var stored = await _cache.GetStringAsync(key);
    if (stored != token) return false;
    await _cache.RemoveAsync(key); // uso único
    return true;
}
```

Registrar: `builder.Services.AddStackExchangeRedisCache(o => o.Configuration = "redis:6379")`

### P.5 CORS — restringir orígenes

```csharp
// appsettings.Production.json
"AllowedOrigins": ["https://miapp.com", "https://www.miapp.com"]

// Program.cs
policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()!)
      .AllowAnyMethod()
      .AllowAnyHeader()
      .AllowCredentials();
```

### P.6 Límites de tamaño

```csharp
// Program.cs — ya cubierto por compresión en cliente, pero defensivo:
builder.Services.Configure<KestrelServerOptions>(o =>
    o.Limits.MaxRequestBodySize = 5 * 1024 * 1024); // 5MB
```

MySQL `my.cnf`:

```ini
[mysqld]
max_allowed_packet = 16M
```

### Resumen de cambios para producción

| Componente              | Dev (actual)                                 | Producción                              |
| ----------------------- | -------------------------------------------- | --------------------------------------- |
| URL del QR              | IP local detectada por backend (`networkIp`) | `window.location.origin` del frontend   |
| Kestrel binding         | `0.0.0.0:5192`                               | `localhost:5192` + reverse proxy        |
| Protocolo               | HTTP / WS                                    | HTTPS / WSS (automático en SignalR)     |
| SignalR multi-instancia | N/A (1 instancia)                            | Redis Backplane o Azure SignalR Service |
| Sesiones foto           | `ConcurrentDictionary` en memoria            | `IDistributedCache` (Redis) con TTL     |
| CORS                    | `SetIsOriginAllowed(_ => true)`              | `WithOrigins("https://miapp.com")`      |
