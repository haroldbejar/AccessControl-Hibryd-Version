// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import * as sonner from "sonner";
import { ProtectedRoute } from "../ProtectedRoute";
import * as authStore from "@/features/auth/store/authStore";

function renderWithAuth(isAuthenticated: boolean) {
  vi.spyOn(authStore, "useAuthStore").mockReturnValue(() => isAuthenticated);
  return render(
    <MemoryRouter initialEntries={["/privada"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/privada" element={<div>Privado</div>} />
        </Route>
        <Route path="/login" element={<MockLoginPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function MockLoginPage() {
  // Simula el toast.error al llegar a la página de login
  sonner.toast.error("Redirigido a login por falta de autenticación");
  return <div>LoginPage</div>;
}

describe("ProtectedRoute", () => {
  it("renderiza el contenido privado si está autenticado", () => {
    renderWithAuth(true);
    expect(screen.getByText(/privado/i)).toBeInTheDocument();
  });
});
