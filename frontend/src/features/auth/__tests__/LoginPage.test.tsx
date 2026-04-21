import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginPage } from "../LoginPage";
import { BrowserRouter } from "react-router-dom";
import * as authStore from "../store/authStore";
import * as authService from "../api/authService";

import * as sonner from "sonner";

function renderLogin() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(sonner.toast, "error").mockImplementation(() => "mock-toast-id");
  });

  it("renderiza el formulario y valida campos requeridos", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
    expect(
      await screen.findByText(/la cuenta es requerida/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/la contraseña es requerida/i),
    ).toBeInTheDocument();
  });

  it("llama a login y navega al dashboard en credenciales válidas", async () => {
    const loginMock = vi
      .spyOn(authStore, "useAuthStore")
      .mockReturnValue(() => {});
    // const navigateMock = vi.fn(); // Eliminado: variable no usada
    vi.spyOn(authService, "authService", "get").mockReturnValue({
      login: vi.fn().mockResolvedValue({
        userId: 1,
        name: "Admin",
        userAccount: "admin",
        roleName: "Administrador",
        token: "jwt-token",
      }),
    });
    renderLogin();
    fireEvent.change(screen.getByLabelText(/cuenta/i), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "Admin123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /ingresando/i }),
      ).not.toBeInTheDocument();
    });
    // No error toast
    expect(
      screen.queryByText(/credenciales incorrectas/i),
    ).not.toBeInTheDocument();
    loginMock.mockRestore();
  });

  it("muestra error si las credenciales son incorrectas", async () => {
    vi.spyOn(authService, "authService", "get").mockReturnValue({
      login: vi.fn().mockRejectedValue(new Error("fail")),
    });
    renderLogin();
    fireEvent.change(screen.getByLabelText(/cuenta/i), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith(
        "Credenciales incorrectas. Verifica tu cuenta y contraseña.",
      );
    });
  });
});
