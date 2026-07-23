import {
  createFuelRecord,
  getFuelRecords,
} from "@/lib/api/swmApi";

import { getPrimaryVehicle } from "@/lib/vehicle/vehicleService";

export async function saveFuelCloud(data: {
  date: string;
  mileage: number;
  total: number;
  notes: string;
}) {
  const vehicle = await getPrimaryVehicle();

  if (!vehicle) {
    throw new Error("No existe vehículo.");
  }

  return createFuelRecord({
    vehicle_id: vehicle.id,
    fuel_date: data.date,
    mileage: data.mileage,
    amount: data.total,
    notes: data.notes,
  });
}

export async function loadFuelCloud() {
  const vehicle = await getPrimaryVehicle();

  if (!vehicle) return [];

  return getFuelRecords(vehicle.id);
}