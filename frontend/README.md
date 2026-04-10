# Access Control — Frontend

SPA React + TypeScript para el sistema de control de acceso de conjuntos residenciales.  
Consume la API REST `.NET 9` y soporta instalación como **Progressive Web App (PWA)**.

## Stack tecnológico

| Categoría       | Librería                  | Versión    |
| --------------- | ------------------------- | ---------- |
| Framework       | React + TypeScript        | 19 / 6     |
| Build tool      | Vite                      | 8          |
| UI Components   | ShadCN UI + Radix UI      | Latest     |
| Estilos         | TailwindCSS v4            | 4          |
| Estado global   | Zustand                   | 5          |
| Estado servidor | TanStack Query            | 5          |
| Formularios     | React Hook Form + Zod     | 7 / 4      |
| HTTP            | Axios                     | 1          |
| Routing         | React Router DOM          | 6          |
| PWA             | vite-plugin-pwa + Workbox | 1 / latest |
| Iconos          | Lucide React              | 1          |
| Fechas          | date-fns                  | 4          |
| Notificaciones  | Sonner                    | 2          |

## Requisitos previos

- Node.js 20+
- La API backend corriendo en `http://localhost:5192`

## Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (sin PWA)
npm run dev

# Build de producción (genera SW + manifest PWA)
npm run build

# Previsualizar build de producción (con PWA activa)
npm run preview

# Lint
npm run lint
```

## Variables de entorno

Crea un archivo `.env` en la raíz del frontend (ver `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5192
```

## Módulos disponibles

| Módulo         | Ruta               | Rol requerido |
| -------------- | ------------------ | ------------- |
| Dashboard      | `/dashboard`       | Todos         |
| Visitas        | `/visits`          | Todos         |
| Paquetes       | `/packages`        | Todos         |
| Usuarios       | `/users`           | Admin         |
| Destinatarios  | `/destinations`    | Admin         |
| Representantes | `/representatives` | Admin         |

## Progressive Web App (PWA)

La app puede instalarse como aplicación nativa en cualquier dispositivo moderno.

### Cómo instalar en Chrome / Edge

1. Ejecutar `npm run build` y luego `npm run preview`
2. Navegar a `http://localhost:4173`
3. En la barra de URL aparece un ícono de instalación (⊕)
4. Hacer clic → **Instalar Access Control**
5. La app se abre como ventana independiente sin barra de navegación

> En producción se requiere HTTPS para que aparezca el botón de instalación.

### Cómo instalar en Android (Chrome)

1. Abrir la URL de producción en Chrome para Android
2. Tocar el menú (⋮) → **Agregar a pantalla principal**
3. La app queda instalada como si fuera una app nativa

### Cómo instalar en iOS (Safari)

1. Abrir la URL de producción en Safari
2. Tocar el botón compartir (□↑) → **Agregar a pantalla de inicio**

## Service Worker

El Service Worker (SW) es un script que corre en segundo plano en el navegador y actúa como proxy entre la app y la red.

### ¿Para qué sirve en esta app?

**Cache de la interfaz (assets)**  
Al primera carga, el SW descarga y guarda todos los archivos estáticos (JS, CSS, HTML). Las cargas siguientes son instantáneas desde el cache local, sin esperar la red.

**Estrategia NetworkFirst para la API**  
Cada llamada a `/api/` sigue este flujo:

1. Intenta conectar a la red → si responde, guarda en cache y devuelve el dato
2. Si la red falla → devuelve la última respuesta guardada en cache

Resultado: ante caídas momentáneas del servidor, el usuario sigue viendo los últimos datos en lugar de un error.

**Actualizaciones automáticas**  
Con `registerType: "autoUpdate"`, cuando se publica una nueva versión:

- El SW descarga la nueva versión silenciosamente en segundo plano
- Al recargar la página, se activa automáticamente

### Limitaciones

El SW **no reemplaza la API** — si el backend `.NET` no está corriendo, no es posible registrar visitas ni paquetes. El cache solo sirve para **lectura** con conexión intermitente. La operación completamente offline (sin API) requiere la fase Electron + SQLite.

### Verificar en Chrome DevTools

1. F12 → pestaña **Application**
2. **Service Workers** → debe aparecer `sw.js` con estado `activated and running`
3. **Manifest** → debe mostrar nombre "Access Control", theme color `#5B8DEF`, ícono candado
4. **Cache Storage** → muestra los archivos precacheados por Workbox

## Estructura de carpetas

```
src/
├── features/          # Módulos por dominio (visits, packages, users...)
│   ├── auth/
│   ├── dashboard/
│   ├── destinations/
│   ├── errors/        # NotFoundPage, ErrorBoundary
│   ├── packages/
│   ├── representatives/
│   ├── users/
│   └── visits/
├── layouts/           # MainLayout (sidebar + topbar)
├── lib/               # Configuración Axios, utils ShadCN
├── routes/            # AppRouter, ProtectedRoute
└── shared/            # Componentes y hooks reutilizables
    ├── components/    # CameraCapture, ErrorBoundary
    ├── hooks/
    ├── services/
    ├── types/
    └── utils/
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            // Other configs...

            // Remove tseslint.configs.recommended and replace with this
            tseslint.configs.recommendedTypeChecked,
            // Alternatively, use this for stricter rules
            tseslint.configs.strictTypeChecked,
            // Optionally, add this for stylistic rules
            tseslint.configs.stylisticTypeChecked,

            // Other configs...
        ],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.node.json", "./tsconfig.app.json"],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            // Other configs...
            // Enable lint rules for React
            reactX.configs["recommended-typescript"],
            // Enable lint rules for React DOM
            reactDom.configs.recommended,
        ],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.node.json", "./tsconfig.app.json"],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
]);
```
