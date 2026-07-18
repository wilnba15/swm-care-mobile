export type ServiceCategory =
  | "Mantenimiento"
  | "Mecánico"
  | "Eléctrico"
  | "Carrocería"
  | "Neumáticos"
  | "Otro";

export interface ServiceRecord {
  id: string;
  date: string;
  mileage: number;
  category: ServiceCategory;
  notes: string;
  total: number;
  nextServiceKm: number | null;
  nextServiceDate: string | null;
  createdAt: string;

  // Compatibilidad temporal con registros creados en la versión anterior.
  description?: string;
}
