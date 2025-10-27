export interface Ticket {
  id: string;
  eventId: string;
  buyerName: string;
  seat?: string;
  price?: number;
  purchasedAt: string;
  used?: boolean;
  refunded?: boolean;
  refundedAmount?: number;
}
