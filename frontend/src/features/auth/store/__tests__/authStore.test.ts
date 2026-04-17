import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "../authStore";

const TEST_USER = {
  userId: 1,
  userAccount: "admin",
  name: "Administrador",
  roleName: "Admin",
};

describe("authStore Zustand", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
    localStorage.clear();
  });

  afterEach(() => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
    localStorage.clear();
  });

  it("estado inicial es no autenticado", () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("login actualiza el estado y persiste", () => {
    useAuthStore.getState().login("abc123", TEST_USER);
    const state = useAuthStore.getState();
    expect(state.token).toBe("abc123");
    expect(state.user).toEqual(TEST_USER);
    expect(state.isAuthenticated).toBe(true);
    // Persiste en localStorage
    const persisted = JSON.parse(localStorage.getItem("access-control-auth")!);
    expect(persisted.state.token).toBe("abc123");
    expect(persisted.state.user).toEqual(TEST_USER);
    expect(persisted.state.isAuthenticated).toBe(true);
  });

  it("logout limpia el estado y localStorage", () => {
    useAuthStore.getState().login("abc123", TEST_USER);
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    // Persiste en localStorage
    const persisted = JSON.parse(localStorage.getItem("access-control-auth")!);
    expect(persisted.state.token).toBeNull();
    expect(persisted.state.user).toBeNull();
    expect(persisted.state.isAuthenticated).toBe(false);
  });

  it("persiste y rehidrata el estado desde localStorage", () => {
    useAuthStore.getState().login("abc123", TEST_USER);
    // Simula recarga
    useAuthStore.persist.rehydrate();
    const state = useAuthStore.getState();
    expect(state.token).toBe("abc123");
    expect(state.user).toEqual(TEST_USER);
    expect(state.isAuthenticated).toBe(true);
  });
});
