// Enum como const-object (mismo patrón que VehicleTypeEnum)
export const ReservationStatusEnum = {
  Pending: 1,
  Confirmed: 2,
  Cancelled: 3,
  Completed: 4,
} as const;

export type ReservationStatus =
  (typeof ReservationStatusEnum)[keyof typeof ReservationStatusEnum];

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  [ReservationStatusEnum.Pending]: "Pendiente",
  [ReservationStatusEnum.Confirmed]: "Confirmada",
  [ReservationStatusEnum.Cancelled]: "Cancelada",
  [ReservationStatusEnum.Completed]: "Completada",
};

export const reservationStatusColors: Record<ReservationStatus, string> = {
  [ReservationStatusEnum.Pending]:
    "bg-yellow-100 text-yellow-800 border-yellow-200",
  [ReservationStatusEnum.Confirmed]:
    "bg-green-100 text-green-800 border-green-200",
  [ReservationStatusEnum.Cancelled]: "bg-red-100 text-red-800 border-red-200",
  [ReservationStatusEnum.Completed]:
    "bg-blue-100 text-blue-800 border-blue-200",
};

// DTOs del backend
export interface CommonAreaResponse {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  location: string | null;
  openingTime: string; // "HH:mm"
  closingTime: string; // "HH:mm"
  visible: boolean;
}

export interface ReservationResponse {
  id: number;
  commonAreaId: number;
  commonAreaName: string;
  destinationId: number;
  destinationName: string;
  representativeId: number;
  representativeName: string;
  reservationDate: string; // "yyyy-MM-dd"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  status: ReservationStatus;
  statusDescription: string;
  notes: string | null;
  cancellationReason: string | null;
  createdDate: string;
}

export interface AvailabilitySlot {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isFree: boolean;
  reservationId: number | null;
  representativeName: string | null;
  destinationName: string | null;
  status: ReservationStatus | null;
}

export interface AvailabilityResponse {
  commonAreaId: number;
  commonAreaName: string;
  date: string; // "yyyy-MM-dd"
  openingTime: string; // "HH:mm"
  closingTime: string; // "HH:mm"
  slots: AvailabilitySlot[];
}

// Requests
export interface CreateCommonAreaRequest {
  name: string;
  description?: string | null;
  capacity?: number | null;
  location?: string | null;
  openingTime: string; // "HH:mm"
  closingTime: string; // "HH:mm"
  userCreated: number;
}

export interface UpdateCommonAreaRequest {
  id: number;
  name: string;
  description?: string | null;
  capacity?: number | null;
  location?: string | null;
  openingTime: string; // "HH:mm"
  closingTime: string; // "HH:mm"
  visible: boolean;
  userModified: number;
}

export interface CreateReservationRequest {
  commonAreaId: number;
  destinationId: number;
  representativeId: number;
  reservationDate: string; // "yyyy-MM-dd"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  notes?: string | null;
  userCreated: number;
}

export interface CancelReservationRequest {
  cancellationReason: string;
}

// Filtros para listado
export interface ReservationFilters {
  date?: string | null;
  commonAreaId?: number | null;
  status?: ReservationStatus | null;
}
