export type AlertType =
  | "package-overdue"
  | "reservation-upcoming"
  | "reservation-unconfirmed";

export interface AppAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  daysOverdue?: number;
  startTime?: string;
}
