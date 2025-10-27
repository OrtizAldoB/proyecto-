export interface Salon {
  id: string;
  name: string;
  tables: number;
  chairsAvailable: number;
  tableclothsAvailable: number;
  // price per reservation (currency units)
  price?: number;
  createdBy?: string;
}
