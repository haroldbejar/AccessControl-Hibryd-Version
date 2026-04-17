import { describe, it, expect } from "vitest";
import { z } from "zod";

// Copia del schema de CreateReservationDialog
const createReservationSchema = z.object({
  commonAreaId: z.number().min(1),
  reservationDate: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  destinationId: z.number().min(1),
  representativeId: z.number().min(1),
  notes: z.string().max(500).optional(),
});

describe("schema CreateReservationDialog", () => {
  it("valida una reserva válida", () => {
    const valid = {
      commonAreaId: 1,
      reservationDate: "2026-04-16",
      startTime: "10:00",
      endTime: "12:00",
      destinationId: 2,
      representativeId: 3,
    };
    expect(() => createReservationSchema.parse(valid)).not.toThrow();
  });

  it("falla si falta el área común", () => {
    const invalid = {
      reservationDate: "2026-04-16",
      startTime: "10:00",
      endTime: "12:00",
      destinationId: 2,
      representativeId: 3,
    };
    expect(() => createReservationSchema.parse(invalid)).toThrow();
  });
});

// Copia del schema de CancelReservationDialog
const cancelReservationSchema = z.object({
  cancellationReason: z.string().min(5, "El motivo es requerido").max(500),
});

describe("schema CancelReservationDialog", () => {
  it("valida un motivo válido", () => {
    const valid = { cancellationReason: "Motivo suficiente" };
    expect(() => cancelReservationSchema.parse(valid)).not.toThrow();
  });

  it("falla si el motivo es muy corto", () => {
    const invalid = { cancellationReason: "abc" };
    expect(() => cancelReservationSchema.parse(invalid)).toThrow();
  });
});

// Copia del schema de CreateCommonAreaDialog
const createCommonAreaSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  capacity: z.coerce.number().min(1).max(9999).optional(),
  location: z.string().max(200).optional(),
  openingTime: z.string().min(1),
  closingTime: z.string().min(1),
});

describe("schema CreateCommonAreaDialog", () => {
  it("valida una zona común válida", () => {
    const valid = {
      name: "Salón comunal",
      openingTime: "08:00",
      closingTime: "22:00",
    };
    expect(() => createCommonAreaSchema.parse(valid)).not.toThrow();
  });

  it("falla si el nombre es muy corto", () => {
    const invalid = {
      name: "A",
      openingTime: "08:00",
      closingTime: "22:00",
    };
    expect(() => createCommonAreaSchema.parse(invalid)).toThrow();
  });
});

// Copia del schema de EditCommonAreaDialog
const editCommonAreaSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  capacity: z.coerce.number().min(1).max(9999).optional(),
  location: z.string().max(200).optional(),
  openingTime: z.string().min(1),
  closingTime: z.string().min(1),
  visible: z.boolean(),
});

describe("schema EditCommonAreaDialog", () => {
  it("valida una zona común válida para edición", () => {
    const valid = {
      name: "Zona BBQ",
      openingTime: "09:00",
      closingTime: "21:00",
      visible: true,
    };
    expect(() => editCommonAreaSchema.parse(valid)).not.toThrow();
  });

  it("falla si falta el campo visible", () => {
    const invalid = {
      name: "Zona BBQ",
      openingTime: "09:00",
      closingTime: "21:00",
    };
    expect(() => editCommonAreaSchema.parse(invalid)).toThrow();
  });
});
