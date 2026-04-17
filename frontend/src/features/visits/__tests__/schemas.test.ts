import { describe, it, expect } from "vitest";
import { z } from "zod";

// Copia del schema de CreateVisitDialog
const VehicleTypeEnum = { NA: 0 };

const schema = z
  .object({
    documentNumber: z.string().min(1),
    firstName: z.string().min(1),
    secondName: z.string().optional(),
    lastName: z.string().min(1),
    secondLastName: z.string().optional(),
    destinationId: z.number().min(1),
    representativeId: z.number().min(1),
    hasVehicle: z.boolean(),
    vehicleTypeId: z.number(),
    brand: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
    plate: z.string().optional(),
    photo: z.string().min(1),
    photo2: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasVehicle && data.vehicleTypeId === VehicleTypeEnum.NA) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicleTypeId"],
        message: "Selecciona tipo de vehículo",
      });
    }
  });

describe("schema CreateVisitDialog", () => {
  it("valida un visitante mínimo válido", () => {
    const valid = {
      documentNumber: "123",
      firstName: "Juan",
      lastName: "Pérez",
      destinationId: 1,
      representativeId: 2,
      hasVehicle: false,
      vehicleTypeId: 1,
      photo: "base64...",
    };
    expect(() => schema.parse(valid)).not.toThrow();
  });

  it("falla si falta un campo obligatorio", () => {
    const invalid = {
      firstName: "Juan",
      lastName: "Pérez",
      destinationId: 1,
      representativeId: 2,
      hasVehicle: false,
      vehicleTypeId: 1,
      photo: "base64...",
    };
    expect(() => schema.parse(invalid)).toThrow();
  });

  it("falla si vehicleTypeId es NA y hasVehicle true", () => {
    const invalid = {
      documentNumber: "123",
      firstName: "Juan",
      lastName: "Pérez",
      destinationId: 1,
      representativeId: 2,
      hasVehicle: true,
      vehicleTypeId: 0,
      photo: "base64...",
    };
    expect(() => schema.parse(invalid)).toThrow(/tipo de vehículo/);
  });

  it("permite campos opcionales vacíos", () => {
    const valid = {
      documentNumber: "123",
      firstName: "Ana",
      lastName: "López",
      destinationId: 1,
      representativeId: 2,
      hasVehicle: false,
      vehicleTypeId: 1,
      photo: "base64...",
      secondName: undefined,
      secondLastName: undefined,
      brand: undefined,
      model: undefined,
      color: undefined,
      plate: undefined,
      photo2: undefined,
    };
    expect(() => schema.parse(valid)).not.toThrow();
  });
});
