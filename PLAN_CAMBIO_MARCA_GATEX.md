# Plan: Cambio de marca a GateX

## Objetivo

Reemplazar la marca visible "Access Control" por "GateX" en la aplicacion, sin cambiar rutas, logica de negocio ni contratos de API.

## Alcance

### Frontend

- Cambiar el titulo de la pestaña del navegador.
- Cambiar el nombre visible del brand en el sidebar y topbar.
- Cambiar el texto de la pantalla de login.
- Cambiar el nombre del manifest PWA.
- Cambiar el texto visible en encabezados de reportes PDF.

### Documentacion visible al usuario

- Actualizar README y guia de instalacion si se desea consistencia total con la nueva marca.

### Fuera de alcance

- No cambiar nombres internos de proyectos, carpetas, rutas o namespaces.
- No modificar endpoints, DTOs, entidades ni contratos de API.
- No cambiar referencias historicas no visibles al usuario, salvo que se decida ampliar el alcance.

## Archivos a revisar y modificar

- [frontend/index.html](frontend/index.html)
- [frontend/vite.config.ts](frontend/vite.config.ts)
- [frontend/src/layouts/MainLayout.tsx](frontend/src/layouts/MainLayout.tsx)
- [frontend/src/features/auth/LoginPage.tsx](frontend/src/features/auth/LoginPage.tsx)
- [frontend/src/features/reports/pdf/ReportLayout.tsx](frontend/src/features/reports/pdf/ReportLayout.tsx)
- [frontend/README.md](frontend/README.md)
- [INSTALL.md](INSTALL.md)

## Plan de implementacion

### Fase 1 - Inventario

- Buscar todas las apariciones visibles de "Access Control" en el frontend.
- Identificar cuales son marca visible y cuales son texto documental o historico.

### Fase 2 - Cambio de marca principal

- Reemplazar "Access Control" por "GateX" en el layout principal.
- Reemplazar el titulo de la pestaña en `index.html`.
- Reemplazar el nombre del manifest PWA en `vite.config.ts`.
- Reemplazar el texto del login y del layout de reportes.

### Fase 3 - Documentacion opcional

- Si se quiere coherencia total, actualizar README e INSTALL.
- Mantener el contenido tecnico sin cambios funcionales.

### Fase 4 - Verificacion

- Ejecutar build del frontend.
- Verificar que la pestaña del navegador muestre GateX.
- Verificar sidebar, login y reportes.
- Verificar el manifest PWA generado.

## Criterios de exito

- La aplicacion muestra GateX como marca principal en las superficies visibles.
- No se rompen builds ni rutas existentes.
- El manifest PWA y el titulo del navegador quedan alineados con la nueva marca.

## Siguiente decision

- Confirmar si tambien se actualiza la documentacion visible al usuario o si solo se cambia la UI/PWA.
