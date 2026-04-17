import { describe, it, expect } from "vitest";
import { z } from "zod";

// Copia del schema de CreateUserDialog
const createUserSchema = z.object({
  userAccount: z.string().min(3).max(50),
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
  roleId: z.number().min(1),
});

describe("schema CreateUserDialog", () => {
  it("valida un usuario válido", () => {
    const valid = {
      userAccount: "juan123",
      name: "Juan Pérez",
      password: "Secreta123",
      roleId: 2,
    };
    expect(() => createUserSchema.parse(valid)).not.toThrow();
  });

  it("falla si falta el nombre de usuario", () => {
    const invalid = {
      name: "Juan Pérez",
      password: "Secreta123",
      roleId: 2,
    };
    expect(() => createUserSchema.parse(invalid)).toThrow();
  });

  it("falla si la contraseña es muy corta", () => {
    const invalid = {
      userAccount: "juan123",
      name: "Juan Pérez",
      password: "123",
      roleId: 2,
    };
    expect(() => createUserSchema.parse(invalid)).toThrow();
  });
});

// Copia del schema de EditUserDialog
const editUserSchema = z.object({
  name: z.string().min(2).max(100),
  roleId: z.number().min(1),
  visible: z.boolean(),
});

describe("schema EditUserDialog", () => {
  it("valida un usuario válido para edición", () => {
    const valid = {
      name: "Ana López",
      roleId: 1,
      visible: true,
    };
    expect(() => editUserSchema.parse(valid)).not.toThrow();
  });

  it("falla si el nombre es muy corto", () => {
    const invalid = {
      name: "A",
      roleId: 1,
      visible: true,
    };
    expect(() => editUserSchema.parse(invalid)).toThrow();
  });
});

// Copia del schema de ChangePasswordDialog
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

describe("schema ChangePasswordDialog", () => {
  it("valida un cambio de contraseña válido", () => {
    const valid = {
      currentPassword: "Secreta123",
      newPassword: "NuevaClave456",
      confirmPassword: "NuevaClave456",
    };
    expect(() => changePasswordSchema.parse(valid)).not.toThrow();
  });

  it("falla si las contraseñas no coinciden", () => {
    const invalid = {
      currentPassword: "Secreta123",
      newPassword: "NuevaClave456",
      confirmPassword: "OtraClave",
    };
    expect(() => changePasswordSchema.parse(invalid)).toThrow(/no coinciden/);
  });
});
