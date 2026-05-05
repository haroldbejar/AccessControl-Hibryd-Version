export const RepresentativeTypeEnum = {
  Owner: 1,
  Tenant: 2,
} as const;
export type RepresentativeTypeEnum =
  (typeof RepresentativeTypeEnum)[keyof typeof RepresentativeTypeEnum];

export const representativeTypeLabels: Record<RepresentativeTypeEnum, string> =
  {
    [RepresentativeTypeEnum.Owner]: "Propietario",
    [RepresentativeTypeEnum.Tenant]: "Arrendatario",
  };

export interface RepresentativeResponse {
  id: number;
  name: string;
  phone?: string;
  cellPhone?: string;
  destinationId: number;
  destinationName: string;
  hasVehicle: boolean;
  vehicleTypeId: number | null;
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
  representativeType: RepresentativeTypeEnum;
  representativeTypeDescription: string;
  contractEndDate?: string | null;
  visible: boolean;
}

export interface CreateRepresentativeRequest {
  name: string;
  phone?: string;
  cellPhone?: string;
  destinationId: number;
  hasVehicle: boolean;
  vehicleTypeId: number | null;
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
  representativeType: number;
  contractEndDate?: string | null;
}

export interface UpdateRepresentativeRequest {
  id: number;
  name: string;
  phone?: string;
  cellPhone?: string;
  destinationId: number;
  hasVehicle: boolean;
  vehicleTypeId: number | null;
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
  representativeType: number;
  contractEndDate?: string | null;
}
