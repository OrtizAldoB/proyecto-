export type EventStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  // reservationStartTime / reservationEndTime: rango de la reservación (por ejemplo "14:00" - "18:00")
  reservationStartTime?: string;
  reservationEndTime?: string;
  // reservationPurpose: para qué es la reservación (texto libre)
  reservationPurpose?: string;
  capacity: number;
  salonId?: string;
  location?: string;
  status?: EventStatus;
  // price charged for reserving the salon at creation time
  salonPrice?: number;
  createdBy: string;
}
