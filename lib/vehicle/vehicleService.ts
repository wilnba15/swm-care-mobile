import {
  createVehicle,
  getVehicles,
  updateVehicle,
  type SwmVehicle,
  type SwmVehicleCreatePayload,
  type SwmVehicleUpdatePayload,
} from "@/lib/api/swmApi";

export const VEHICLE_UPDATED_EVENT = "swm:vehicle-cloud-updated";

let primaryVehicleCache: SwmVehicle | null | undefined;
let pendingVehicleRequest: Promise<SwmVehicle | null> | null = null;

function emitVehicleUpdated(vehicle: SwmVehicle | null): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(VEHICLE_UPDATED_EVENT, {
      detail: vehicle,
    }),
  );
}

export async function getPrimaryVehicle(
  forceRefresh = false,
): Promise<SwmVehicle | null> {
  if (!forceRefresh && primaryVehicleCache !== undefined) {
    return primaryVehicleCache;
  }

  if (!forceRefresh && pendingVehicleRequest) {
    return pendingVehicleRequest;
  }

  pendingVehicleRequest = getVehicles()
    .then((vehicles) => {
      const primaryVehicle = vehicles[0] ?? null;
      primaryVehicleCache = primaryVehicle;
      return primaryVehicle;
    })
    .finally(() => {
      pendingVehicleRequest = null;
    });

  return pendingVehicleRequest;
}

export async function createPrimaryVehicle(
  payload: SwmVehicleCreatePayload,
): Promise<SwmVehicle> {
  const vehicle = await createVehicle(payload);
  primaryVehicleCache = vehicle;
  emitVehicleUpdated(vehicle);
  return vehicle;
}

export async function updatePrimaryVehicle(
  vehicleId: number,
  payload: SwmVehicleUpdatePayload,
): Promise<SwmVehicle> {
  const vehicle = await updateVehicle(vehicleId, payload);
  primaryVehicleCache = vehicle;
  emitVehicleUpdated(vehicle);
  return vehicle;
}

export async function updatePrimaryMileage(
  vehicleId: number,
  currentMileage: number,
): Promise<SwmVehicle> {
  return updatePrimaryVehicle(vehicleId, {
    current_mileage: currentMileage,
  });
}

export function clearPrimaryVehicleCache(): void {
  primaryVehicleCache = undefined;
  pendingVehicleRequest = null;
  emitVehicleUpdated(null);
}
