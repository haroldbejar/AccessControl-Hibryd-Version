---
name: "Plan de Modernización sistema legado"
description: "Plan detallado para la modernización del sistema legado, incluyendo fases, tecnologías a utilizar y cronograma."
applyTo: "**/*"
---

PLAN DE MODERNIZACIÓN - SISTEMA DE CONTROL DE ACCESO
ANÁLISIS DE LA SITUACIÓN ACTUAL Y PROPUESTA DE SOLUCIÓN

TABLA DE CONTENIDOS

1. Análisis del Escenario Actual
2. Arquitectura Propuesta
3. Stack Tecnológico Moderno
4. Arquitectura Técnica Detallada
5. Plan de Migración por Fases
6. Estructura de Proyectos
7. Estrategia Offline-First
8. Comparativa: Antes vs Después
9. Estimación de Esfuerzo
10. Roadmap de Implementación

ANÁLISIS DEL ESCENARIO ACTUAL
Escenarios de Clientes

┌─────────────────────────────────────────────────────────────┐
│ 📴 ESCENARIO 1: CLIENTES SIN INTERNET (60-70%) │
├─────────────────────────────────────────────────────────────┤
│ ✓ App WPF local en una sola PC │
│ ✓ Base de datos MySQL local (XAMPP) │
│ ✓ Sin conectividad a internet │
│ ✓ Monousuario │
│ ✗ NO pueden compartir datos entre PCs │
│ ✗ NO pueden acceder remotamente │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🌐 ESCENARIO 2: CLIENTES MULTIUSUARIO (30-40%) │
├─────────────────────────────────────────────────────────────┤
│ ✓ Múltiples PCs en red local │
│ ✓ Necesitan datos centralizados │
│ ✓ Acceso desde portería, administración, seguridad │
│ ✓ Tienen conexión a internet o LAN estable │
│ ✗ WPF NO es ideal para web │
│ ✗ Cada PC debe tener WPF instalado │
└─────────────────────────────────────────────────────────────┘

Limitaciones del Sistema Actual
Aspecto Limitación Impacto
UI/UX WPF solo Windows No multiplataforma
Arquitectura Monolítica Difícil escalar
Despliegue Instalación local Mantenimiento costoso
Multiusuario No pensado para web Requiere VPN/RDP complicado
Sincronización No existe Datos aislados
Tecnología .NET Framework 4.6.1 Obsoleto (fin de soporte)

Oportunidades
✅ Backend lógica sólida: Business, Repository, Models bien estructurados
✅ Base de datos: MySQL bien diseñada, solo necesita optimización
✅ Funcionalidades completas: No hay que inventar, solo modernizar
✅ Experiencia de usuario: Ya conoces el flujo, solo mejorar UI

ARQUITECTURA PROPUESTA
Visión General: Arquitectura Híbrida (Offline-First + Online-Capable)

## Arquitectura Moderna

```
                    ┌─────────────────────────┐
                    │    ARQUITECTURA MODERNA  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   FRONTEND (ÚNICO CÓDIGO) │
                    │                           │
                    │  🟧 React + TypeScript    │
                    │  🟧 TailwindCSS / ShadCN  │
                    │  🟧 Responsive & Modern   │
                    └──────┬──────────┬────────┘
                           │          │
           ┌───────────────▼──┐    ┌──▼───────────────────┐
           │  MODO OFFLINE    │    │  MODO ONLINE          │
           │  (Electron)      │    │  (Browser)            │
           │                  │    │                       │
           │ - Desktop App    │    │ - Progressive         │
           │ - React bundled  │    │   Web App (PWA)       │
           │ - API local      │    │ - Cloud hosted        │
           │ - MySQL local    │    │ - API remota          │
           └───────┬──────────┘    └──────────┬────────────┘
                   │                          │
                   └──────────┬───────────────┘
                              │
                 ┌────────────▼────────────┐
                 │   API REST .NET 9        │
                 │   (Backend único)        │
                 └────────────┬────────────┘
                              │
                 ┌────────────▼────────────┐
                 │   MySQL Database         │
                 │   (Local o Cloud)        │
                 └─────────────────────────┘
```

## Beneficios de la Arquitectura Propuesta

| Característica          | Beneficio                                    |
| ----------------------- | -------------------------------------------- |
| **Un solo código UI**   | React funciona en Electron y Browser         |
| **Backend desacoplado** | API sirve a ambos escenarios                 |
| **Offline-First**       | Funciona sin internet, sincroniza cuando hay |
| **Escalable**           | Fácil agregar más clientes web               |
| **Moderna**             | Stack actual del mercado (2024-2026)         |
| **Mantenible**          | Clean Architecture + DDD ligero              |
| **Mobile-ready**        | React Native (futuro)                        |

## Stack Tecnológico Moderno

# Backend

Tecnología: .NET 9
Arquitectura: Clean Architecture / Vertical Slice
API: REST con controllers mínimos
ORM: Entity Framework Core 9
Database: MySQL 8.0+ / PostgreSQL (opcional)
Auth: JWT + Refresh Tokens
Logging: Serilog
Validación: FluentValidation
Mapeo: Roik.Mapperly
Testing: xUnit + FluentAssertions

## Estructura Clean Architecture

AccessControl.API/
├── Domain/ # Entidades puras (Visit, Package, User)
│ ├── Entities/
│ ├── Enums/
│ └── Interfaces/
├── Application/ # Casos de uso (CQRS)
│ ├── Features/
│ │ ├── Visits/
│ │ │ ├── Commands/
│ │ │ │ ├── CreateVisit/
│ │ │ │ └── CheckOutVisit/
│ │ │ └── Queries/
│ │ │ ├── GetAllVisits/
│ │ │ └── GetVisitById/
│ │ ├── Packages/
│ │ └── Users/
│ ├── Common/
│ │ ├── Behaviors/
│ │ ├── Interfaces/
│ │ └── Models/
│ └── DependencyInjection.cs
├── Infrastructure/ # Implementaciones concretas
│ ├── Persistence/
│ │ ├── Contexts/
│ │ ├── Repositories/
│ │ └── Configurations/
│ ├── Identity/
│ ├── Services/
│ └── DependencyInjection.cs
├── WebAPI/ # Entrada HTTP
│ ├── Controllers/
│ ├── Middleware/
│ ├── Filters/
│ └── Program.cs
└── Tests/
├── Domain.Tests/
├── Application.Tests/
└── Integration.Tests/

## Frontend

Framework: React 18+
Lenguaje: TypeScript
Build: Vite
UI Library: ShadCN UI + TailwindCSS
State: Zustand / Redux Toolkit
Forms: React Hook Form + Zod
HTTP: Axios / TanStack Query
Routing: React Router v6
Offline: IndexedDB + Dexie.js
Desktop: Electron
PWA: Workbox
Testing: Vitest + React Testing Library

## Estructura Frontend

access-control-ui/
├── src/
│ ├── features/ # Por módulo
│ │ ├── visits/
│ │ │ ├── api/ # API calls
│ │ │ ├── components/ # Componentes del módulo
│ │ │ ├── hooks/ # Custom hooks
│ │ │ ├── stores/ # Estado local
│ │ │ ├── types/ # TypeScript types
│ │ │ └── index.tsx # Página principal
│ │ ├── packages/
│ │ ├── auth/
│ │ └── dashboard/
│ ├── shared/ # Compartido
│ │ ├── components/ # Button, Input, Modal
│ │ ├── hooks/ # useAuth, useOffline
│ │ ├── services/ # API base, storage
│ │ ├── types/ # Types globales
│ │ └── utils/ # Helpers
│ ├── assets/ # Imágenes, fonts
│ ├── styles/ # CSS global
│ ├── routes/ # Routing
│ ├── App.tsx
│ └── main.tsx
├── electron/ # Electron wrapper
│ ├── main.ts
│ ├── preload.ts
│ └── api-server.ts # API local embebida
├── public/
└── package.json

## Tabla Nueva para Sincronización

CREATE TABLE SyncLog (
Id INT PRIMARY KEY AUTO_INCREMENT,
EntityType VARCHAR(50) NOT NULL, -- 'Visit', 'Package', etc.
EntityId INT NOT NULL,
Action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
SyncStatus VARCHAR(20) NOT NULL, -- 'PENDING', 'SYNCED', 'FAILED'
CreatedAt DATETIME NOT NULL,
SyncedAt DATETIME,
Payload JSON, -- Datos del cambio
ErrorMessage TEXT,
INDEX idx_status (SyncStatus),
INDEX idx_entity (EntityType, EntityId)
);

## Arquitectura tecnica detallada

┌─────────────────────────────────────────────────────────────┐
│ CLIENTE OFFLINE (Electron) │
├─────────────────────────────────────────────────────────────┤
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ React App (Renderer Process) │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│ │ │VisitPage │ │PackagePg │ │Dashboard │ │ │
│ │ └─────┬────┘ └─────┬────┘ └─────┬────┘ │ │
│ │ │ │ │ │ │
│ │ └──────────── ┼ ─────────────┘ │ │
│ │ ↓ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ API Client Layer │ │ │
│ │ │ (Axios + IndexedDB) │ │ │
│ │ └──────────┬───────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│ │ │
│ │ http://localhost:5000 │
│ ↓ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ .NET 9 API (Main Process Embedded) │ │
│ │ ┌──────────────────────────────────────────────┐ │ │
│ │ │ Kestrel HTTP Server │ │ │
│ │ │ Controllers → Services → Repositories │ │ │
│ │ └───────────────────┬──────────────────────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│ │ │
│ │ EF Core │
│ ↓ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ MySQL Local (XAMPP o Standalone) │ │
│ │ Database: accesscontrol_local │ │
│ └────────────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ IndexedDB (Offline Cache) │ │
│ │ - Visitas en cola de sincronización │ │
│ │ - Datos de configuración local │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

# Flujo de una operacion offline:

1. Usuario crea visita en React
2. React guarda en IndexedDB (inmediato)
3. React llama API local (localhost:5000)
4. API .NET valida y guarda en MySQL local
5. React actualiza UI con respuesta
6. Background service marca para sincronización futura

# Modo Online (PWA + API Cloud)

┌─────────────────────────────────────────────────────────────┐
│ CLIENTE ONLINE (Browser PWA) │
├─────────────────────────────────────────────────────────────┤
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ React App (Deployed) │ │
│ │ https://app.accesscontrol.com │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│ │ │VisitPage │ │PackagePg │ │Dashboard │ │ │
│ │ └─────┬────┘ └─────┬────┘ └─────┬────┘ │ │
│ │ └──────────── ┼ ─────────────┘ │ │
│ │ ↓ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ API Client Layer │ │ │
│ │ │ (Axios + TanStack Q) │ │ │
│ │ └──────────┬───────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│ │ │
│ │ HTTPS │
│ ↓ │
└─────────────────────────┼───────────────────────────────────┘
│
│ Internet
↓
┌─────────────────────────────────────────────────────────────┐
│ SERVIDOR CLOUD (Azure/AWS) │
├─────────────────────────────────────────────────────────────┤
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ .NET 9 API (Container / App Service) │ │
│ │ https://api.accesscontrol.com │ │
│ │ ┌──────────────────────────────────────────────┐ │ │
│ │ │ Controllers → MediatR → Handlers │ │ │
│ │ │ JWT Auth + Authorization │ │ │
│ │ │ Rate Limiting + CORS │ │ │
│ │ └───────────────────┬──────────────────────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│ │ │
│ │ EF Core │
│ ↓ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ MySQL Server  
│ │ Database: accesscontrol_production │ │
│ │ - Replicación │ │
│ │ - Backups automáticos │ │
│ └────────────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Redis Cache (Opcional) │ │
│ │ - Sesiones │ │
│ │ - Cache de consultas frecuentes │ │
│ └────────────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Blob Storage (Azure/S3) │ │
│ │ - Fotos de visitas │ │
│ │ - Fotos de paquetes │ │
│ │ - Firmas digitales │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

# Modo Hibrido: Sincronización Offline-Online

┌─────────────────────────────────────────────────────────────┐
│ CLIENTE CON SINCRONIZACIÓN PERIÓDICA │
├─────────────────────────────────────────────────────────────┤
│ │
│ 1. Usuario trabaja offline (Electron + MySQL local) │
│ - Todas las operaciones CRUD normales │
│ - Se marcan en tabla SyncLog con status='PENDING' │
│ │
│ 2. Background Service detecta conexión a internet │
│ - Polling cada 5 minutos o webhook │
│ │
│ 3. Proceso de sincronización: │
│ ┌──────────────────────────────────────────────┐ │
│ │ a) Lee SyncLog WHERE SyncStatus='PENDING' │ │
│ │ b) Por cada registro: │ │
│ │ - Envía a API cloud │ │
│ │ - Si OK: marca SyncStatus='SYNCED' │ │
│ │ - Si falla: SyncStatus='FAILED' + retry │ │
│ │ c) Descarga cambios del servidor (pull) │ │
│ │ d) Aplica cambios locales (merge) │ │
│ └──────────────────────────────────────────────┘ │
│ │
│ 4. Resolución de conflictos: │
│ - Last-Write-Wins (LWW) │
│ - O mostrar conflicto al usuario para resolver │
│ │
└─────────────────────────────────────────────────────────────┘
