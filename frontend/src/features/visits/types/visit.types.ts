// Enums (const object — erasableSyntaxOnly compatible)
export const VehicleTypeEnum = {
  NA: 0,
  Car: 1,
  Motorcycle: 2,
  Bicycle: 3,
} as const;
export type VehicleTypeEnum =
  (typeof VehicleTypeEnum)[keyof typeof VehicleTypeEnum];

export const vehicleTypeLabels: Record<VehicleTypeEnum, string> = {
  [VehicleTypeEnum.NA]: "Sin vehículo",
  [VehicleTypeEnum.Car]: "Automóvil",
  [VehicleTypeEnum.Motorcycle]: "Moto",
  [VehicleTypeEnum.Bicycle]: "Bicicleta",
};

// Respuestas de la API
export interface VisitResponse {
  id: number;
  documentNumber: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  fullName: string;
  representativeId: number;
  representativeName: string;
  destinationId: number;
  destinationName: string;
  hasVehicle: boolean;
  vehicleTypeId: VehicleTypeEnum;
  vehicleTypeName: string;
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
  checkIn: string;
  checkOut?: string;
  isCheckedOut: boolean;
  photo?: string;
  photo2?: string;
  createdDate: string;
}

export interface DestinationResponse {
  id: number;
  name: string;
}

export interface RepresentativeResponse {
  id: number;
  name: string;
  phone?: string;
  cellPhone?: string;
  destinationId: number;
  destinationName: string;
}

// Requests
export interface GetAllVisitsParams {
  startDate: string;
  endDate: string;
  documentFilter?: string;
  nameFilter?: string;
  destinationFilter?: number;
}

export interface CreateVisitRequest {
  documentNumber: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  representativeId: number;
  hasVehicle: boolean;
  vehicleTypeId: VehicleTypeEnum;
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
  userCreated: number;
}

export interface CheckOutRequest {
  documentNumber: string;
  userModified: number;
}
