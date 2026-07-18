export type FuelType = "Extra" | "Súper" | "Diésel";

export interface FuelRecord {
  id: string;
  date: string;
  mileage: number;
  fuelType: FuelType;
  gallons: number;
  pricePerGallon: number;
  total: number;
  station: string;
  fullTank: boolean;
  notes: string;
  createdAt: string;
}
