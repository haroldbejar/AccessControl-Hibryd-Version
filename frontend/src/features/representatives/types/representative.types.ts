import type { VehicleTypeEnum } from "@/features/visits/types/visit.types";

export interface RepresentativeResponse {
  id: number;
  name: string;
  phone?: string;
  cellPhone?: string;
  destinationId: number;
  destinationName: string;
  hasVehicle: boolean;
  vehicleTypeId: VehicleTypeEnum;
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
}

export interface CreateRepresentativeRequest {
  name: string;
  phone?: string;
  cellPhone?: string;
  destinationId: number;
  hasVehicle: boolean;
  vehicleTypeId: VehicleTypeEnum;
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
}

export interface UpdateRepresentativeRequest {
  id: number;
  name: string;
  phone?: string;
  cellPhone?: string;
  destinationId: number;
  hasVehicle: boolean;
  vehicleTypeId: VehicleTypeEnum;
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
}
