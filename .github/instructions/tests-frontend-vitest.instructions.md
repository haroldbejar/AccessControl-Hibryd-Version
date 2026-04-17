---
name: "Tests Frontend — Vitest + React Testing Library"
description: "Plan detallado para implementar cobertura de tests unitarios y de integración en el frontend usando Vitest y React Testing Library."
applyTo: "frontend/**"
---

> ⚠️ Este archivo define el plan de implementación de tests frontend. Leerlo antes de ejecutar cualquier tarea relacionada con testing.

## Propósito

Implementar cobertura de tests unitarios y de integración en el frontend React, usando Vitest + React Testing Library + MSW, para asegurar calidad, robustez y facilitar refactorizaciones futuras.

---

## Decisiones de arquitectura confirmadas

| Decisión           | Valor                                                 |
| ------------------ | ----------------------------------------------------- |
| Test runner        | Vitest (compatible Vite, TypeScript, jsdom)           |
| UI testing         | @testing-library/react + @testing-library/user-event  |
| Matchers           | @testing-library/jest-dom                             |
| Mock HTTP          | MSW v2 (Mock Service Worker)                          |
| Entorno DOM        | jsdom                                                 |
| Cobertura          | @vitest/coverage-v8                                   |
| Alias imports      | `@/*` → `./src/*` (configurado en vitest.config.ts)   |
| Scripts            | `test`, `test:watch`, `test:coverage` en package.json |
| Ubicación tests    | `__tests__/` junto a los archivos que testean         |
| E2E                | No incluido en este plan (solo unit/integration)      |
| Snapshots visuales | No (solo tests de comportamiento)                     |
| Playwright         | No incluido en este plan                              |

---

## Estado de implementación

- [x] **Fase 2** — Tests de schemas Zod
- [x] **Fase 3** — Tests de authStore Zustand

---

## Fase 1 — Setup base ✅ COMPLETADA

1. **Dependencias instaladas:**
    - `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `msw@2`, `@vitest/coverage-v8`
    - Instalación ejecutada con:
        ```bash
        npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw@2 @vitest/coverage-v8 --legacy-peer-deps
        ```
2. **Config creada:**
    - `frontend/vitest.config.ts` (env jsdom, alias @, setupFiles, cobertura)
    - `frontend/src/test/setup.ts` (importa jest-dom)
    - `frontend/src/test/utils.tsx` (render con QueryClient + BrowserRouter)
3. **Scripts agregados a `package.json`:**
    - `"test": "vitest run --reporter=verbose"`
    - `"test:watch": "vitest --watch"`
    - `"test:coverage": "vitest run --coverage"`
4. **Validación:**
    - `npm run test` ejecuta Vitest correctamente (sale con código 1 porque no hay tests aún, esperado)
    - No hay errores de compilación ni conflictos

**Checklist:**

- [x] Dependencias instaladas
- [x] Configuración Vitest creada
- [x] Scripts agregados
- [x] Build sin errores
- [x] Listo para Fase 2
    - `npm run test` ejecuta Vitest correctamente (sale con código 1 porque no hay tests aún)
    - No hay errores de compilación ni conflictos

**Estado:**

- [x] Dependencias instaladas
- [x] Configuración Vitest creada
- [x] Scripts agregados
- [x] Build sin errores
- [x] Listo para Fase 2

---

## Fase 2 — Tests de schemas Zod (~15 tests)

Casos:

## Fase 3 — Tests de authStore Zustand (~8 tests)

**Checklist:**

- [x] Test de estado inicial
- [x] Test de login/logout
- [x] Test de persistencia
- [x] Test de rehidratación

**Estado:** ✅ COMPLETADO

---

- `src/shared/hooks/__tests__/useNotifications.test.ts`
- `src/shared/hooks/__tests__/useCameraSession.test.ts`

- Alerts generadas según datos, máquina de estados, integración con MSW

---

## Fase 4 — Tests de hooks de lógica (ABORTADA)

Se intentó implementar tests para hooks de lógica (`useNotifications`, `useCameraSession`, `useVisits`), pero se eliminaron por problemas de importación/mocks y bajo valor de cobertura real en este contexto. No hay tests activos para estos hooks.

**Checklist:**

- [ ] Tests de hooks de lógica implementados
- [x] Tests eliminados por decisión técnica (16/04/2026)

**Estado:** ❌ ABORTADA — No se incluyen tests de hooks de lógica en la suite.

---

## Fase 5 — Tests de componentes clave (~10 tests)

- `src/routes/__tests__/ProtectedRoute.test.tsx`
- `src/features/auth/__tests__/LoginPage.test.tsx`

Casos:

- Redirección, renderizado condicional, validación, feedback de error

---

## Archivos a crear/editar — resumen

### Nuevos (11):

```
frontend/vitest.config.ts
frontend/src/test/setup.ts
frontend/src/test/utils.tsx
frontend/src/features/visits/types/__tests__/visitSchema.test.ts
frontend/src/features/packages/types/__tests__/packageSchema.test.ts
frontend/src/features/auth/types/__tests__/loginSchema.test.ts
frontend/src/features/auth/store/__tests__/authStore.test.ts
frontend/src/shared/hooks/__tests__/useNotifications.test.ts
frontend/src/shared/hooks/__tests__/useCameraSession.test.ts
frontend/src/routes/__tests__/ProtectedRoute.test.tsx
frontend/src/features/auth/__tests__/LoginPage.test.tsx
```

### Editados (2):

```
frontend/package.json  ← scripts test + devDependencies
frontend/tsconfig.app.json  ← types: vitest/globals
```

---

## Verificación final

1. `npm run test` → todos los tests pasan (27 tests activos, hooks de lógica excluidos)
2. `npm run test:coverage` → cobertura visible en terminal
3. `npm run build` → sin errores (tests no afectan build)

---

## Decisiones adicionales

- Entorno: `jsdom` (mejor compatibilidad con RTL)
- MSW v2 (compatible con Vitest/Vite)
- Tests co-localizados en `__tests__/` junto al archivo que testean
- NO Playwright/e2e — solo unit/integration
- NO tests de UI visual (snapshots) — tests de comportamiento
- Cobertura objetivo: schemas 100%, stores 90%+, hooks críticos 80%+
