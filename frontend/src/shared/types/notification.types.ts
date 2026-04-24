export type AlertType =
  | "package-overdue"
  | "reservation-upcoming"
  | "reservation-unconfirmed";

import type { PackageResponse } from "@/features/packages/types/package.types";

export interface AppAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  daysOverdue?: number;
  startTime?: string;
  package?: PackageResponse; // Solo para package-overdue
}
