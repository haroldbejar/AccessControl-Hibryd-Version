---
name: "Fase Actual"
description: "Estado actual de la modernización y contexto de trabajo inmediato"
applyTo: "**/*"
---

> ⚠️ Este archivo define el contexto de trabajo actual. Leerlo antes de ejecutar cualquier tarea.

---

name: 'Fase Actual'
description: 'Estado actual de la modernización y contexto de trabajo inmediato'
applyTo: '\*_/_'

---

> ⚠️ Este archivo define el contexto de trabajo actual. Leerlo antes de ejecutar cualquier tarea.

## Fase actual: Fase 1 — Backend API (.NET 9)

**Objetivo:** API REST funcional que reemplace la capa Business del sistema WPF legado  
**Duración estimada:** 4-6 semanas (160-240 horas)

---

## Estado de subfases

- [x] **1.1 Setup inicial** — Estructura Clean Architecture creada
- [x] **1.2 Migración de entidades** — Todas las entidades definidas en `AccessControl.Domain/Entities/`
- [ ] **1.3 Infrastructure Layer**
- [ ] **1.4 Application Layer (CQRS)**
- [ ] **1.5 API Controllers**
- [ ] **1.6 JWT Authentication**
- [ ] **1.7 Testing**
- [ ] **1.8 Documentación y Deploy**

---

## Subfase actual: 1.3 — Infrastructure Layer

- Configurar Entity Framework Core 9 con MySQL
- Implementar ApplicationDbContext con todas las configuraciones
- Crear repositorio genérico base (Repository<T>)
- Implementar repositorios específicos para cada entidad
- Implementar Unit of Work
- Generar y aplicar migraciones iniciales
- Seed data inicial (datos de prueba)
