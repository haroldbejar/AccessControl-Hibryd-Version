# Guía de Instalación y Uso — Access Control

Esta guía explica cómo poner en marcha el sistema de control de acceso e instalar la aplicación web en cualquier dispositivo.

---

## Requisitos del servidor

| Componente | Versión mínima |
| ---------- | -------------- |
| .NET SDK   | 9.0            |
| MySQL      | 8.0+           |
| Node.js    | 20+            |

---

## 1. Configurar la base de datos

1. Crear una base de datos MySQL vacía (ejemplo: `accesscontrol_db`)
2. Editar `src/AccessControl.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=accesscontrol_db;User=root;Password=tu_password;"
}
```

3. Aplicar las migraciones (crea las tablas automáticamente):

```bash
dotnet ef database update --project src/AccessControl.Infrastucture --startup-project src/AccessControl.API
```

---

## 2. Iniciar la API backend

```bash
dotnet run --project src/AccessControl.API
```

La API quedará disponible en `http://localhost:5192`.

**Credenciales iniciales del sistema:**

- Usuario: `admin`
- Contraseña: `Admin123!`

> Se recomienda cambiar la contraseña del administrador tras el primer acceso.

---

## 3. Construir el frontend

```bash
cd frontend
npm install
npm run build
```

El resultado queda en la carpeta `frontend/dist/`.

---

## 4. Iniciar el servidor frontend

```bash
npm run preview
```

La app estará disponible en `http://localhost:4173`.

> En producción, sirve la carpeta `dist/` con cualquier servidor web (Nginx, IIS, Apache).

---

## 5. Instalar la app en el dispositivo (PWA)

La aplicación puede instalarse como app nativa, sin necesidad de descargar nada de una tienda de aplicaciones.

### En computador — Chrome o Edge

1. Abrir la URL del sistema en Chrome o Edge
2. En la barra de URL aparece un ícono de instalación (⊕) en la esquina derecha
3. Hacer clic → **Instalar Access Control**
4. La app se abre como ventana independiente (sin barra de navegación del navegador)
5. Queda disponible en el escritorio y en el menú de aplicaciones

### En Android — Chrome

1. Abrir la URL del sistema en Chrome
2. Tocar el menú (⋮ tres puntos) → **Agregar a pantalla principal**
3. La app queda instalada como si fuera una app descargada

### En iPhone / iPad — Safari

1. Abrir la URL del sistema en Safari
2. Tocar el botón compartir (□↑) en la barra inferior
3. Seleccionar **Agregar a pantalla de inicio**
4. La app aparece en la pantalla principal del dispositivo

---

## 6. Cómo funciona sin conexión (modo degradado)

El sistema incluye un **Service Worker** que gestiona el comportamiento sin conexión:

| Situación                     | Comportamiento                                         |
| ----------------------------- | ------------------------------------------------------ |
| Sin internet, con API activa  | Funciona con normalidad (API en red local)             |
| Internet intermitente         | Muestra últimos datos cacheados al fallar la red       |
| App ya instalada, sin red     | La interfaz carga desde el cache local del dispositivo |
| API completamente inaccesible | La interfaz carga, pero no se pueden registrar datos   |

> El sistema requiere que la API (backend .NET) esté activa para registrar visitas y paquetes. El cache solo aplica para consultas de lectura.

---

## 7. Actualizar el sistema

Cuando se publica una nueva versión del frontend:

1. Ejecutar `npm run build` para generar el nuevo `dist/`
2. Reemplazar los archivos del servidor web con el nuevo `dist/`
3. Los navegadores y dispositivos con la app instalada **se actualizan automáticamente** en la próxima carga

No es necesario que los usuarios desinstalen y reinstalen la app.

---

## 8. Verificar que el Service Worker está activo (solo técnicos)

1. Abrir la app en Chrome
2. Presionar `F12` → pestaña **Application**
3. En el menú lateral: **Service Workers**
    - Estado esperado: `activated and running`
4. En **Manifest**: verificar nombre "Access Control" y color `#5B8DEF`
5. En **Cache Storage**: ver los archivos precacheados por Workbox

---

## Solución de problemas frecuentes

| Problema                            | Causa probable                           | Solución                                              |
| ----------------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| No aparece botón de instalación     | Usando `npm run dev` en lugar de preview | Ejecutar `npm run build` + `npm run preview`          |
| No aparece botón de instalación     | Sin HTTPS en producción                  | Configurar certificado SSL en el servidor             |
| Error 401 al iniciar sesión         | Credenciales incorrectas                 | Verificar usuario `admin` / `Admin123!`               |
| Error de conexión a la API          | Backend no está corriendo                | Ejecutar `dotnet run --project src/AccessControl.API` |
| Tablas no encontradas               | Migraciones no aplicadas                 | Ejecutar `dotnet ef database update`                  |
| App desactualizada tras publicación | Cache del Service Worker                 | Recargar con `Ctrl + Shift + R`                       |
