export type DevolucionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';

export interface Devolucion {
  id: string;
  salonId: string;
  amount: number;
  reason?: string;
  requestedAt: string;
  processedBy?: string;
  status: DevolucionStatus;
}
